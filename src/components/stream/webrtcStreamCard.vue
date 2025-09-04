<template>
  <div class="relative w-full h-full">
    <!-- Pannellum Container (used when pano === 1) -->
    <div ref="plmContainerRef" class="w-full h-full" :class="{ hidden: props.pano !== 1 }"></div>
    <video
      ref="videoRef"
      autoplay
      muted
      playsinline
      no-controls
      crossorigin="anonymous"
      class="object-fill"
      loop
      :class="{
        'w-full h-full': props.pano !== 1,
        'absolute -top-[9999px] -left-[9999px] w-px h-px opacity-0 pointer-events-none':
          props.pano === 1,
      }"
    ></video>
    <div
      v-if="status === 'Initializing...'"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
    >
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, defineExpose } from 'vue'
import { MediaMTXWebRTCReader } from '@/helper'
import 'pannellum/build/pannellum.css'
import 'pannellum/build/pannellum.js'
import { usePanoSettingStore } from '@/stores'

const props = defineProps({
  url: String,
  camera: Object,
  onError: Function,
  onTrack: Function,
  pano: { type: Number, default: 0 },
})

const emit = defineEmits(['success'])

const status = ref('Initializing...')
const videoRef = ref(null)
const plmContainerRef = ref(null)
let reader = null
let pannellumViewer = null // Use a local variable for the viewer instance
let stream = null // Store the stream

// --- Pannellum Specific Event Handlers ---
// These need to be defined *outside* the setup function if they are added/removed
// directly, or use bound functions. We'll define them inside and use closures.
let handleCanPlay, handlePlay, handlePause, handleSeeking, handleSeeked
const pano = usePanoSettingStore()
// --- MediaMTXWebRTCReader Handlers ---
const handleTrack = (evt) => {
  stream = evt.streams[0] // Store the stream
  if (videoRef.value && stream) {
    videoRef.value.srcObject = stream
    status.value = 'Streaming'
    // console.log('Stream received for', props.url)
    emit('success', stream) // Emit success event with the stream

    // Wait for the video metadata to load before potentially initializing Pannellum
    videoRef.value.addEventListener(
      'loadedmetadata',
      () => {
        // console.log('Video metadata loaded.')
        // Attempt to play after metadata is loaded
        videoRef.value.play().catch((e) => console.warn('Autoplay possibly prevented:', e))

        // Initialize Pannellum IF needed and possible
        if (props.pano === 1) {
          // Use nextTick to ensure the DOM is updated (plmContainerRef is available)
          nextTick(() => {
            initializePannellum()
            const label = plmContainerRef.value.querySelector('.pnlm-about-msg')
            if (label) {
              label.innerHTML = `
              <a href="#" target="_blank" rel="noopener noreferrer">
                Copyright © 2025 AI Department.
              </a>
              `
            } else {
              console.warn('Pannellum label not found.')
            }
          })
        }
      },
      { once: true },
    ) // Ensure this listener runs only once
  } else {
    // console.error('Video ref or stream not available on track event.')
    status.value = 'Error: Stream or Video Element missing'
  }
}

const handleError = (err) => {
  // console.error('Camera error:', props.url, err)
  status.value = `Error: ${err?.message || err}`
  // Call the provided onError prop if it exists
  if (props.onError) {
    props.onError(err)
  }
}

// --- Pannellum Initialization and Synchronization ---
const initializePannellum = () => {
  // Ensure Pannellum library is loaded
  if (typeof pannellum === 'undefined') {
    // console.error('Pannellum library is not loaded.')
    status.value = 'Error: Pannellum not loaded'
    return
  }

  // Ensure container and video element refs are available
  if (!plmContainerRef.value || !videoRef.value) {
    // console.error('Pannellum container or video element not found in DOM.')
    status.value = 'Error: DOM elements missing'
    return
  }

  // Destroy existing viewer if it exists (e.g., on prop change)
  if (pannellumViewer) {
    // console.log('Destroying existing Pannellum viewer before reinitialization.')
    destroyPannellum()
  }

  console.log('Initializing Pannellum...')
  try {
    pannellumViewer = pannellum.viewer(plmContainerRef.value, {
      type: 'equirectangular',
      dynamic: true, // Crucial for video
      panorama: videoRef.value, // Use the video element as the source
      autoLoad: true, // Start loading the video texture
      ...pano.getPanoSettingFromID(props.camera.id), // Use pano settings from store
      // Start updates immediately IF the video is already playing
      // Otherwise, the play event will trigger it.
      dynamicUpdate: videoRef.value && !videoRef.value.paused,
    })
    pannellumViewer.on('mouseup', () => {
      console.log(
        'data: ',
        pannellumViewer.getPitch(),
        pannellumViewer.getYaw(),
        pannellumViewer.getHfov(),
      )
      pano.setPanoSettingFromID(props.camera.id, {
        autoRotate: 0,
        pitch: pannellumViewer.getPitch(),
        yaw: pannellumViewer.getYaw(),
        hfov: pannellumViewer.getHfov(),
      })
      // console.log('Final pitch:', data.pitch, 'Final yaw:', data.yaw, 'Final hfov:', data.hfov)
    })

    // --- Add Event Listeners for Synchronization ---
    const videoElement = videoRef.value // Cache for clarity

    handleCanPlay = () => {
      // console.log('Pano video canplay')
      // Don't automatically setUpdate(true) here, wait for 'play'
      // This ensures viewer updates only when video is actually playing.
      if (!videoElement.paused && pannellumViewer) {
        // console.log('Pano video canplay and not paused, requesting update')
        pannellumViewer.setUpdate(true)
      }
    }

    handlePlay = () => {
      // console.log('Pano video play event')
      if (pannellumViewer) {
        // console.log('Setting Pannellum update to true')
        pannellumViewer.setUpdate(true)
      }
    }

    handlePause = () => {
      // console.log('Pano video pause event')
      if (pannellumViewer) {
        // console.log('Setting Pannellum update to false')
        pannellumViewer.setUpdate(false)
      }
    }

    // Handle seeking: update one frame to show the new position
    handleSeeking = () => {
      if (videoElement.paused && pannellumViewer) {
        // console.log('Pano video seeking while paused, requesting single update')
        pannellumViewer.setUpdate(true) // Request update
      }
    }

    // Handle seeked: stop updates if it was paused during seeking
    handleSeeked = () => {
      if (videoElement.paused && pannellumViewer) {
        // console.log('Pano video seeked while paused, setting update to false')
        // Important: Check if the viewer still exists before calling setUpdate
        if (pannellumViewer) {
          pannellumViewer.setUpdate(false) // Stop updates
        }
      }
    }

    videoElement.addEventListener('canplay', handleCanPlay)
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    videoElement.addEventListener('seeking', handleSeeking)
    videoElement.addEventListener('seeked', handleSeeked)

    // If video is already playing when Pannellum initializes, ensure updates start
    if (!videoElement.paused) {
      handlePlay()
    }

    // console.log('Pannellum initialized successfully.')
    status.value = 'Streaming 360' // Update status
  } catch (error) {
    // console.error('Error initializing Pannellum:', error)
    status.value = `Error: ${error.message}`
  }
}

const destroyPannellum = () => {
  if (pannellumViewer) {
    // console.log('Destroying Pannellum viewer...')
    // Remove event listeners first
    if (videoRef.value) {
      videoRef.value.removeEventListener('canplay', handleCanPlay)
      videoRef.value.removeEventListener('play', handlePlay)
      videoRef.value.removeEventListener('pause', handlePause)
      videoRef.value.removeEventListener('seeking', handleSeeking)
      videoRef.value.removeEventListener('seeked', handleSeeked)
    }
    pannellumViewer.destroy()
    pannellumViewer = null
    // console.log('Pannellum viewer destroyed.')
  }
  // Reset handlers
  handleCanPlay = null
  handlePlay = null
  handlePause = null
  handleSeeking = null
  handleSeeked = null
}

// --- Vue Lifecycle Hooks ---
onMounted(() => {
  status.value = 'Initializing...'
  // console.log('Component mounted, initializing reader for:', props.url)
  reader = new MediaMTXWebRTCReader({
    url: props.url,
    // Use component's handlers
    onError: handleError,
    onTrack: handleTrack,
  })
})

onUnmounted(() => {
  // console.log('Component unmounting, cleaning up for:', props.url)
  // Destroy Pannellum if it exists
  if (props.pano === 1) {
    destroyPannellum()
  }

  // Close the WebRTC reader
  if (reader) {
    reader.close()
    reader = null
    console.log('MediaMTX reader closed.')
  }

  // Clean up video element resources
  if (videoRef.value) {
    videoRef.value.srcObject = null // Important to release the stream
    videoRef.value.removeAttribute('src')
    videoRef.value.load() // Reset the video element state
    // console.log('Video element resources released.')
  }
  stream = null // Clear stream reference
})

// Watch for changes in the 'pano' prop to potentially switch modes
// Note: Switching dynamically might be complex depending on timing.
// This example focuses on initial setup based on the prop.
// A full dynamic switch might require destroying/recreating Pannellum/video setup.
watch(
  () => props.pano,
  (newPano, oldPano) => {
    // console.log(`Pano prop changed from ${oldPano} to ${newPano}`)
    // If switching TO pano mode and stream is ready
    if (newPano === 1 && oldPano !== 1 && stream && videoRef.value?.readyState >= 1) {
      // readyState >= 1 (HAVE_METADATA)
      nextTick(() => {
        initializePannellum()
        const label = plmContainerRef.value.querySelector('.pnlm-about-msg')
        if (label) {
          label.innerHTML = 'Loading 360° video...'
          console.log('Pannellum label updated.')
        } else {
          console.warn('Pannellum label not found.')
        }
        // plmContainerRef.value.querySelector('.pnlm-about-msg').innerHTML = '' // Ensure DOM is ready
      })
    }
    // If switching FROM pano mode
    else if (newPano !== 1 && oldPano === 1) {
      destroyPannellum()
      // Ensure video is playable directly if needed (autoplay might handle this)
      // nextTick(() => {
      //     if (videoRef.value) videoRef.value.play().catch(e => console.warn("Autoplay possibly prevented:", e));
      // });
    }
    // If the component loads initially with pano=1, onTrack will handle initialization.
  },
)

// Watch for URL changes to re-initialize the reader and potentially Pannellum
watch(
  () => props.url,
  (newUrl, oldUrl) => {
    if (newUrl !== oldUrl) {
      // console.log(`URL changed from ${oldUrl} to ${newUrl}. Re-initializing.`)
      status.value = 'Initializing...'

      // Cleanup old resources first
      if (props.pano === 1) {
        destroyPannellum()
      }
      if (reader) {
        reader.close()
        reader = null
      }
      if (videoRef.value) {
        videoRef.value.srcObject = null
        videoRef.value.removeAttribute('src')
        videoRef.value.load()
      }
      stream = null // Clear stream reference

      // Re-initialize reader for the new URL
      reader = new MediaMTXWebRTCReader({
        url: newUrl,
        onError: handleError,
        onTrack: handleTrack,
      })
    }
  },
)
const toggleAutoRotate = () => {
  if (pannellumViewer) {
    const pitch = pannellumViewer.getPitch()
    pannellumViewer.startAutoRotate(-3, pitch) // Set auto-rotation speed
  }
}

defineExpose({
  videoRef, // Expose the video element ref
  plmContainerRef,
  toggleAutoRotate, // Expose the Pannellum container ref
})
</script>

<style scoped>
/* Basic CSS for the spinner (keep existing styles) */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Ensure Pannellum container takes up space */
.hidden {
  display: none;
}

/* Style for visually hidden video needed for Pannellum */
.absolute.-top-\[9999px\].-left-\[9999px\].w-px.h-px.opacity-0.pointer-events-none {
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 1px; /* Small size */
  height: 1px; /* Small size */
  opacity: 0;
  pointer-events: none;
}
</style>
