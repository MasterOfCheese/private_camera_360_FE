<template>
  <div
    class="relative rounded-xl overflow-hidden border transition duration-300 ease-in-out group h-full w-full object-cover"
    :class="camera?.name
        ? 'bg-white/5 backdrop-blur-lg border-blue-600/30 shadow-lg hover:shadow-xl hover:border-blue-500/60 hover:scale-[1.015] cursor-pointer'
        : 'border-2 border-dashed border-white/10 bg-black/10 hover:border-white/20 hover:bg-black/20 cursor-pointer'
      " ref="cardRootRef">
    <!-- CASE 1: Camera exists -->
    <template v-if="camera?.name">
      <!-- WebRTC Stream Card (Mounted if IP exists) -->
      <WebRTCStreamCard v-if="has_webrtc_stream" ref="webrtcCardRef" :key="camera.id + '-webrtc'"
        :url="`${camera.webrtc_ip}/whep`"
        class="w-full h-full object-cover absolute inset-0 transition-opacity duration-300" :class="{
          'opacity-100': is_webrtc_connected,
          'opacity-0 pointer-events-none': !is_webrtc_connected,
        }" :pano="camera.panorama" @error="handleStreamError" @success="handleStreamSuccess" />

      <!-- Fallback Video (Mounted if URL exists) -->
      <video v-if="has_fallback_video" ref="fallbackVideoRef" :key="camera.id + '-fallback'"
        :src="camera.fallback_video_url"
        class="w-full h-full object-cover absolute inset-0 transition-opacity duration-300" :class="{
          'opacity-100': !is_webrtc_connected && is_fallback_playable,
          'opacity-0 pointer-events-none': is_webrtc_connected || !is_fallback_playable,
        }" autoplay muted playsinline loop @canplay="handleFallbackCanPlay" @playing="handleFallbackPlaying"
        @error="handleFallbackError" @stalled="handleFallbackStalled"></video>

      <!-- Error Overlay -->
      <!-- Show ONLY if computed property evaluates to true -->
      <template v-if="show_error_overlay">
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 p-3 text-center z-10">
          <i class="pi pi-exclamation-triangle text-red-300 text-3xl mb-2"></i>
          <p class="text-sm font-medium text-red-200">{{ error_display_message }}</p>
          <p class="text-xs text-red-400 mt-1">ID: {{ camera?.id }}</p>
          <span
            class="absolute right-0 top-0 p-1.5 text-xs text-gray-200 hover:text-white cursor-pointer pointer-events-auto pi pi-times z-10"
            @click="deleteCamera"></span>
        </div>
      </template>

      <!-- Normal Overlays (Show only when WebRTC is connected AND no error overlay) -->
      <!-- Added !show_error_overlay condition to prevent overlap -->
      <template v-if="!show_error_overlay">
        <!-- Top Overlay -->
        <div
          class="absolute top-0 left-0 right-0 p-1.5 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <div class="flex items-center">
            <span class="inline-block h-2 w-2 rounded-full mr-1.5"
              :class="{ 'bg-green-500': !is_webrtc_connected, 'bg-red-500': is_webrtc_connected }"></span>
            <span class="text-xs font-bold text-white uppercase tracking-wide mr-2"><span v-if="camera.panorama"
                class="text-blue-400 bg-blue-600/30 px-2 mr-2 rounded-md">3D</span>LIVE</span>
            <span class="text-xs text-gray-200 tabular-nums">{{ liveTimestamp }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-200 hover:text-white cursor-pointer pointer-events-auto pi pi-times"
              title="Delete camera" @click="deleteCamera"></span>
          </div>
        </div>
        <!-- Bottom Overlay -->
        <div
          class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity flex justify-between items-baseline-last">
          <div>
            <p class="text-sm font-semibold text-white truncate" :title="camera.name">
              {{ camera.name }}
            </p>
            <div class="flex">
              <p class="text-xs text-blue-200 truncate" :title="camera.location">
                {{ camera.location }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span v-if="camera.panorama && is_webrtc_connected"
              class="pi pi-sync pointer-events-auto font-semibold text-gray-400 hover:text-white cursor-pointer"
              title="Auto-rotate" @click="webrtcCardRef?.toggleAutoRotate"></span>
            <span v-if="camera.gate_disable_alarm_url && camera.isGate && is_webrtc_connected"
              class="pi pi-megaphone pointer-events-auto font-semibold text-gray-400 hover:text-white cursor-pointer"
              title="Muted alarm" @click.stop="openAlarmDisablePrompt"></span>
            <span
              class="pi pointer-events-auto cursor-pointer hover:text-white transition-colors text-gray-400 hover:text-white"
              :class="isFullscreenActive ? 'pi-window-minimize' : 'pi-window-maximize'"
              :title="isFullscreenActive ? 'Exit Fullscreen' : 'Enter Fullscreen'" @click.stop="toggleFullscreen"></span>
          </div>
        </div>
      </template>

      <!-- Optional: Fallback Video Overlay? -->
      <!-- You might want a simpler overlay when the fallback is playing -->
      <!-- <template v-if="!is_webrtc_connected && is_fallback_playable && !show_error_overlay"> -->
      <!-- Simple indicator that it's fallback -->
      <!-- <div class="absolute top-1 left-1 p-1 bg-orange-700/50 rounded"> -->
      <!-- <span class="text-xs text-orange-100 font-bold">FALLBACK</span> -->
      <!-- </div> -->
      <!-- </template> -->
    </template>

    <!-- CASE 2: No Camera -->
    <template v-else>
      <div class="h-full w-full flex items-center justify-center" @click="handleClick">
        <i class="pi pi-plus text-gray-600 group-hover:text-blue-400 text-3xl transition-colors"></i>
      </div>
    </template>

    <!-- --- Password Prompt Modal for Disabling Alarm --- -->
    <div v-if="showPasswordPrompt"
      class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ease-out">
      <div
        class="bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 w-full max-w-sm p-6 transition-transform duration-300 ease-out scale-100 opacity-100">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">Disable Alarm Confirmation</h3>
          <button @click="closePasswordPrompt" class="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>
        <p class="text-sm text-gray-300 mb-4">
          Enter password to disable alarm for camera:
          <strong class="text-blue-300">{{ camera?.name }}</strong>.
        </p>
        <form @submit.prevent="handlePasswordSubmit">
          <div v-if="passwordError" class="mb-3 p-2 bg-red-900/40 text-red-300 border border-red-700 rounded-md text-xs">
            {{ passwordError }}
          </div>
          <div>
            <label for="alarm-password" class="block text-xs font-medium text-blue-300 mb-1">Password</label>
            <input type="password" id="alarm-password" v-model="enteredPassword" ref="passwordInputRef" required
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="closePasswordPrompt"
              class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg font-medium text-sm transition">
              Cancel
            </button>
            <button type="submit"
              class="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition shadow-md">
              Confirm & Disable
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- --- End Password Prompt Modal --- -->
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import WebRTCStreamCard from '@/components/stream/webrtcStreamCard.vue'
const isGate = ref(true) // Placeholder for isGate prop, replace with actual prop if needed

const props = defineProps({
  camera: Object,
  liveTimestamp: String,
})

const emit = defineEmits(['addcamera', 'deletecamera'])

// --- Refs ---
const cardRootRef = ref(null) // Ref for the component's root element
const webrtcCardRef = ref(null) // Ref for the WebRTCStreamCard component instance
const passwordInputRef = ref(null) // Ref for the password input field

// --- State ---
const is_webrtc_connected = ref(false)
const is_fallback_playable = ref(false) // Is the fallback *currently* considered playable?
const last_webrtc_error = ref(null)
const last_fallback_error = ref(null) // Stores the specific error from fallback
const fallbackVideoRef = ref(null)
const isFullscreenActive = ref(false) // Track fullscreen state

// --- Computed Properties ---
const has_webrtc_stream = computed(() => !!props.camera?.webrtc_ip)
const has_fallback_video = computed(() => !!props.camera?.fallback_video_url)

// --- NEW State for Password Prompt ---
const showPasswordPrompt = ref(false)
const enteredPassword = ref('')
const passwordError = ref(null)
// --- END NEW State ---

// Determine if the error overlay should be shown based on current state
const show_error_overlay = computed(() => {
  // Condition 1: WebRTC MUST be disconnected
  if (is_webrtc_connected.value) {
    return false
  }

  // Condition 2: Check based on fallback availability
  if (!has_fallback_video.value) {
    // No fallback exists: Show error if WebRTC is configured but failed
    return has_webrtc_stream.value && !!last_webrtc_error.value
    // Or maybe just: return !!last_webrtc_error.value; (if component assumes camera always has *some* source intended)
  } else {
    // Fallback exists: Show error ONLY if fallback has also explicitly failed
    // We check !is_fallback_playable AND last_fallback_error is set.
    // This prevents showing error overlay just because fallback hasn't loaded yet after WebRTC failed.
    return !is_fallback_playable.value && !!last_fallback_error.value
  }
})

// Determine the message to display in the error overlay
const error_display_message = computed(() => {
  // This computed is only relevant when show_error_overlay is true.
  if (!show_error_overlay.value) return ''

  if (!has_fallback_video.value) {
    // Error shown because WebRTC failed and no fallback exists
    return last_webrtc_error.value || 'Stream unavailable (no fallback).'
  } else {
    // Error shown because fallback failed (and WebRTC already failed)
    // Prioritize the fallback error message as it's the direct reason for the overlay now.
    return last_fallback_error.value || 'Fallback video failed.'
    // Optionally combine: `Stream unavailable. ${last_fallback_error.value || 'Fallback video failed.'}`
  }
  // Consider a final fallback message if needed, though the above should cover it.
  // return 'Stream and fallback unavailable.';
})

// --- Utility Functions ---
const resetState = () => {
  // console.log(`Resetting state for camera ${props.camera?.id ?? 'new camera'}`)
  is_webrtc_connected.value = false
  is_fallback_playable.value = false
  last_webrtc_error.value = null
  last_fallback_error.value = null
  // If the fallback video element might persist across camera changes (e.g. due to v-show instead of v-if)
  // you might need to pause/reset it manually here too. With v-if, it should be okay.
  // if (fallbackVideoRef.value) {
  //   fallbackVideoRef.value.pause();
  //   fallbackVideoRef.value.currentTime = 0;
  // }
}

// --- Fullscreen Logic ---
const getActiveElementForFullscreen = () => {
  // Priority: Pannellum > WebRTC Video > Fallback Video
  if (props.camera?.panorama === 1 && is_webrtc_connected.value) {
    return webrtcCardRef.value?.plmContainerRef // Access exposed ref
  } else if (is_webrtc_connected.value) {
    return webrtcCardRef.value?.videoRef // Access exposed ref
  } else if (!is_webrtc_connected.value && is_fallback_playable.value) {
    return fallbackVideoRef.value // Access local ref
  }
  return null // No active element suitable for fullscreen
}

const toggleFullscreen = async () => {
  // Check if *any* element is currently fullscreen
  if (!document.fullscreenElement) {
    // Enter fullscreen
    const targetElement = getActiveElementForFullscreen()
    if (targetElement) {
      try {
        await targetElement.requestFullscreen()
        // isFullscreenActive will be updated by the event listener
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
        // Potentially show a user notification that fullscreen failed
      }
    } else {
      console.warn('No active element found to make fullscreen.')
    }
  } else {
    // Exit fullscreen
    try {
      await document.exitFullscreen()
      // isFullscreenActive will be updated by the event listener
    } catch (err) {
      console.error(`Error attempting to disable full-screen mode: ${err.message} (${err.name})`)
    }
  }
}

const handleFullscreenChange = () => {
  // Update reactive state based on document's fullscreen status
  // Check if the fullscreen element is *within* this specific card instance
  // This prevents unrelated fullscreen changes from affecting this card's icon
  const currentFullscreenElement = document.fullscreenElement
  if (currentFullscreenElement && cardRootRef.value?.contains(currentFullscreenElement)) {
    isFullscreenActive.value = true
  } else {
    isFullscreenActive.value = false
    // Double check if *nothing* is fullscreen anymore globally, just in case
    if (!currentFullscreenElement) {
      isFullscreenActive.value = false
    }
  }

  // Simpler check (might update icon even if another element went fullscreen):
  // isFullscreenActive.value = !!document.fullscreenElement;
}
// --- Lifecycle and Watchers ---
watch(
  () => props.camera?.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      // console.log(`Camera ID changed from ${oldId} to ${newId}. Resetting state.`)
      resetState()
    }
  },
  { immediate: true }, // Immediate is important to run reset on initial load if needed
)

// --- Event Handlers ---
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange) // Safari
  document.addEventListener('mozfullscreenchange', handleFullscreenChange) // Firefox
  document.addEventListener('MSFullscreenChange', handleFullscreenChange) // IE11
  // Initial check in case component mounts while already in fullscreen (unlikely but safe)
  handleFullscreenChange()
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  // If this component initiated fullscreen, exit it on unmount? Optional.
  // if (isFullscreenActive.value && document.fullscreenElement && cardRootRef.value?.contains(document.fullscreenElement)) {
  //    document.exitFullscreen();
  // }
})

// WebRTC Events
const handleStreamError = (err) => {
  console.error(`WebRTC Stream error for ${props.camera?.id}:`, err)
  // Only update state if we were previously connected or haven't recorded an error yet
  // This can prevent floods of updates if the stream component retries internally and fails repeatedly
  if (is_webrtc_connected.value || !last_webrtc_error.value) {
    is_webrtc_connected.value = false
    last_webrtc_error.value = err || 'WebRTC connection failed'
    // **Crucially, DO NOT touch is_fallback_playable or last_fallback_error here**
    // Let the fallback video manage its own state independently.
    // console.log(
    //   `WebRTC failed for ${props.camera?.id}. Fallback state: playable=${is_fallback_playable.value}, error=${last_fallback_error.value}`,
    // )
    if (fallbackVideoRef.value && !last_fallback_error.value) {
      is_fallback_playable.value = true
      fallbackVideoRef.value?.play()
      console.log(`Fallback video playing for ${props.camera?.id}`)
      // Handle error if needed, but don't set last_fallback_error here to avoid confusion
    }
    // Pause fallback video if WebRTC fails
  } else {
    console.warn(`Repeated WebRTC Stream error for ${props.camera?.id}, state unchanged.`)
  }
}

const handleStreamSuccess = () => {
  // Only update if not already connected, prevents unnecessary re-renders
  if (!is_webrtc_connected.value) {
    // console.log(`WebRTC Stream success for ${props.camera?.id}.`)
    is_webrtc_connected.value = true
    last_webrtc_error.value = null // Clear WebRTC error

    // Explicitly mark fallback as not playable when WebRTC is active
    is_fallback_playable.value = false
    // last_fallback_error.value = null // Clear fallback error too
    fallbackVideoRef.value?.pause()
  }
}

// Fallback Video Events
const handleFallbackCanPlay = () => {
  console.log(`Fallback video can play for ${props.camera?.id}`)
  // Only mark as playable if WebRTC IS NOT connected.
  if (!is_webrtc_connected.value) {
    // Check if it's already considered playable to avoid redundant updates
    if (!is_fallback_playable.value || last_fallback_error.value) {
      is_fallback_playable.value = true
      last_fallback_error.value = null // Clear any previous fallback error
      console.log(`Fallback marked as playable for ${props.camera?.id}`)
    }
  } else {
    // WebRTC is connected, ensure fallback remains marked as not playable.
    is_fallback_playable.value = false
  }
}

const handleFallbackPlaying = () => {
  console.log(`Fallback video playing for ${props.camera?.id}`)
  // Same logic as canplay: only mark as playable if WebRTC is not connected
  if (!is_webrtc_connected.value) {
    if (!is_fallback_playable.value || last_fallback_error.value) {
      is_fallback_playable.value = true
      last_fallback_error.value = null
      console.log(`Fallback confirmed playing for ${props.camera?.id}`)
    }
  } else {
    is_fallback_playable.value = false
  }
}

const handleFallbackError = (event) => {
  console.error(`Fallback video error for ${props.camera?.id}:`, event.target.error)
  const error = event.target.error
  let message = 'Fallback video failed.'
  if (error) {
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        message = 'Fallback video load aborted.'
        break
      case error.MEDIA_ERR_NETWORK:
        message = 'Fallback network error.'
        break
      case error.MEDIA_ERR_DECODE:
        message = 'Fallback decode error.'
        break
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        message = 'Fallback source is not supported.'
        break
      default:
        message = `Fallback error code ${error.code}.`
    }
  }

  // Only update state if it's not already in this error state
  if (is_fallback_playable.value || last_fallback_error.value !== message) {
    is_fallback_playable.value = false
    last_fallback_error.value = message
    console.log(`Fallback error recorded for ${props.camera?.id}: ${message}`)
  }
}

const handleFallbackStalled = () => {
  console.warn(`Fallback video stalled for ${props.camera?.id}`)
}

const handleClick = () => {
  emit('addcamera', props.camera)
}
const deleteCamera = () => {
  console.log(`Deleting camera ${props.camera?.id}`)
  emit('deletecamera', props.camera)
}

// --- MODIFIED AND NEW Functions for Alarm Disabling ---
const openAlarmDisablePrompt = () => {
  enteredPassword.value = '' // Clear previous entry
  passwordError.value = null // Clear previous error
  showPasswordPrompt.value = true
  nextTick(() => {
    // Focus the password input after the modal is shown
    if (passwordInputRef.value) {
      passwordInputRef.value.focus()
    }
  })
}

const closePasswordPrompt = () => {
  showPasswordPrompt.value = false
  enteredPassword.value = ''
  passwordError.value = null
}

const formatDateForPassword = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}${month}${day}`
}

const handlePasswordSubmit = async () => {
  if (!enteredPassword.value) {
    passwordError.value = 'Password cannot be empty.'
    return
  }

  const today = new Date()
  const correctPassword = `AI${formatDateForPassword(today)}`

  const enteredPasswordUpper = enteredPassword.value.toUpperCase()
  const correctPasswordUpper = correctPassword.toUpperCase()
  if (enteredPasswordUpper === correctPasswordUpper) {
    passwordError.value = null // Clear error
    // console.log('Password correct. Proceeding to disable alarm.');
    closePasswordPrompt() // Close modal before fetch

    // Perform the actual fetch call
    try {
      // console.log(`Attempting to disable alarm for camera ${props.camera?.id} at ${props.camera?.gate_disable_alarm_url}`);
      const response = await fetch(props.camera.gate_disable_alarm_url, {
        method: 'POST',
        body: JSON.stringify({ txt_to_send: `${window.appConfig.hexa_dong_cua}` }),
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers your API requires
        },
        // Add headers or body if your API requires them
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ action: 'disable_alarm' })
      })

      if (response.ok) {
        console.log(`Alarm disabled successfully for camera ${props.camera?.id}`)
        // Optionally, show a success notification to the user
        // alert(`Alarm for ${props.camera?.name} disabled.`);
      } else {
        const errorText = await response.text()
        console.error(
          `Failed to disable alarm for camera ${props.camera?.id}. Status: ${response.status}. Message: ${errorText}`,
        )
        // Optionally, show an error notification to the user
        alert(`Failed to disable alarm: ${errorText || response.statusText}`)
      }
    } catch (error) {
      console.error(`Error during fetch to disable alarm for camera ${props.camera?.id}:`, error)
      // Optionally, show an error notification to the user
      alert(`Network error while disabling alarm: ${error.message}`)
    }
  } else {
    passwordError.value = 'Incorrect password. Please try again.'
    enteredPassword.value = '' // Clear the input for re-entry
    passwordInputRef.value?.focus()
  }
}
// --- END MODIFIED AND NEW Functions ---
</script>

<style>
/* Ensure necessary Tailwind base/components/utilities are included */
.transition-opacity {
  transition-property: opacity;
}

.duration-300 {
  transition-duration: 300ms;
}
</style>
