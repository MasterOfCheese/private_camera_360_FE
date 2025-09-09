<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div
      v-if="visible"
      @click="$emit('close')"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
    ></div>
  </transition>

  <!-- Drawer -->
  <transition name="slide-right">
    <aside
      v-if="visible"
      class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-gradient-to-b from-gray-900/90 via-blue-950/90 to-gray-900/90 backdrop-blur-xl shadow-2xl border-l border-blue-300/20 z-50 flex flex-col"
      aria-labelledby="drawer-title"
    >
      <!-- Header -->
      <header
        class="flex items-center justify-between p-4 border-b border-blue-300/20 flex-shrink-0"
      >
        <h2 id="drawer-title" class="text-lg font-semibold text-white">
          All Cameras ({{ cameras?.length || 0 }})
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-white hover:bg-blue-500/20 rounded-full p-1.5 transition-colors text-xl leading-none"
          aria-label="Close camera list"
        >
          <i class="pi pi-times"></i>
        </button>
      </header>

      <!-- Body - Camera List -->
      <div class="overflow-y-auto flex-1">
        <ul v-if="cameras && cameras.length > 0" class="divide-y divide-blue-300/20">
          <li
            v-for="camera in cameras"
            :key="camera.id"
            class="p-3 sm:p-4 hover:bg-blue-600/10 transition-colors duration-150 cursor-pointer group"
            @click="handleItemClick(camera)"
            :title="getCameraItemTitle(camera)"
          >
            <div class="flex items-center space-x-3 sm:space-x-4">
              <!-- Fixed Size Image/Placeholder Container -->
              <div
                class="w-14 h-10 sm:w-16 sm:h-12 rounded border border-blue-300/20 flex-shrink-0 overflow-hidden flex items-center justify-center bg-gray-800/50 flex-none"
              >
                <img
                  v-if="camera.preview_image_url"
                  :src="camera.preview_image_url"
                  :alt="`${camera.name} Preview`"
                  loading="lazy"
                  class="w-full h-full object-cover"
                  @error="onImageError"
                />
                <i v-else class="pi pi-video text-blue-500/60 text-xl"></i>
              </div>

              <!-- Camera Info - Reorganized for horizontal space -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1">
                  <p
                    class="text-sm font-medium text-white group-hover:text-blue-300 transition-colors truncate pr-2"
                    :title="camera.name"
                  >
                    {{ camera.name }}
                  </p>
                  <div class="flex items-center text-xs text-blue-300 truncate text-right flex-shrink-0">
                    <div class="flex items-center" :title="camera.location">
                      <i class="pi pi-map-marker text-xs mr-1 opacity-80"></i>
                      {{ camera.location ?? 'N/A' }}
                    </div>
                    <div class="ml-2">
                      <i 
                        :class="[
                          'pi text-xs transform scale-75',
                          getCameraStatus(camera) === 'active' 
                            ? 'pi-circle-fill text-green-400 animate-pulse' 
                            : getCameraStatus(camera) === 'inactive'
                            ? 'pi-circle-fill text-red-500'
                            : 'pi-minus-circle text-gray-500'
                        ]"
                        :title="
                          getCameraStatus(camera) === 'active' 
                            ? 'Camera is streaming' 
                            : getCameraStatus(camera) === 'inactive'
                            ? 'Camera offline'
                            : 'No stream configured'
                        "
                      ></i>
                    </div>
                  </div>
                </div>

                <div class="flex items-center text-xs text-gray-400 space-x-3 mb-1.5">
                  <span class="inline-flex items-center" title="Camera ID">
                    <i class="pi pi-hashtag mr-1 opacity-70"></i> {{ camera.id }}
                  </span>
                  <span
                    class="inline-flex items-center"
                    :title="camera.webrtc_ip ? 'WebRTC Available' : 'WebRTC Not Configured'"
                  >
                    <i
                      :class="[
                        'pi pi-video text-xs mr-1',
                        camera.webrtc_ip ? 'text-blue-400' : 'text-gray-600',
                      ]"
                    ></i>
                    <span>{{ camera.webrtc_ip ? 'RTC' : 'N/A' }}</span>
                  </span>
                  <span
                    class="inline-flex items-center"
                    :title="camera.panorama === 1 ? '360° Panorama View' : 'Standard View'"
                  >
                    <i
                      :class="[
                        'pi text-xs mr-1',
                        camera.panorama === 1
                          ? 'pi-globe text-green-400'
                          : 'pi-desktop text-gray-500',
                      ]"
                    ></i>
                    <span>{{ camera.panorama === 1 ? '360°' : 'Std' }}</span>
                  </span>
                </div>
                <div v-if="camera.tags && camera.tags.length > 0" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in camera.tags.slice(0, 6)"
                    :key="tag.id"
                    class="bg-blue-600/40 text-blue-200 text-[10px] font-medium px-2 py-0.5 rounded-full leading-tight"
                    :title="tag.tag_name"
                  >
                    {{ tag.tag_name }}
                  </span>
                  <span
                    v-if="camera.tags.length > 6"
                    class="text-blue-300 text-[10px] font-medium px-2 py-0.5 leading-tight italic"
                  >
                    +{{ camera.tags.length - 6 }}
                  </span>
                </div>
                <div v-else class="text-xs text-gray-500/80 italic mt-1">No tags</div>
              </div>
            </div>
          </li>
        </ul>
        <div v-else class="p-6 flex flex-col items-center justify-center h-full text-center">
          <i class="pi pi-video text-5xl text-blue-600/40 mb-4"></i>
          <span class="text-gray-300 font-medium">No cameras found.</span>
          <span class="text-xs text-gray-500 mt-1">Check API connection or configuration.</span>
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import 'primeicons/primeicons.css'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// defineProps({
//   cameras: {
//     type: Array,
//     default: () => [],
//   },
//   visible: {
//     type: Boolean,
//     default: false,
//   },
// })
// Lấy props để sử dụng trong các function
const props = defineProps({
  cameras: {
    type: Array,
    default: () => [],
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

// Frontend code để thay thế trong CCTV_CameraChosingDrawer.vue

// 2. Thêm reactive data cho camera status và WebSocket
const activeCameraStreams = ref(new Set())
const isCheckingStatus = ref(false)
const cameraStatusWs = ref(null)

// 3. Computed để check camera status (giữ nguyên)
const getCameraStatus = (camera) => {
  if (!camera.webrtc_ip) return 'no-stream'
  
  const streamName = extractStreamName(camera.webrtc_ip)
  if (!streamName) return 'no-stream'
  
  return activeCameraStreams.value.has(streamName) ? 'active' : 'inactive'
}

// 4. Helper function để extract stream name (giữ nguyên)
const extractStreamName = (webrtcUrl) => {
  if (!webrtcUrl) return null
  try {
    const url = new URL(webrtcUrl)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    return pathSegments[pathSegments.length - 1] || null
  } catch {
    return null
  }
}

// 5. WebSocket connection functions
const connectCameraStatusWs = () => {
  if (cameraStatusWs.value) return // Already connected
  
  // Determine WebSocket URL based on current API config
  let wsUrl
  const apiUrl = window.appConfig?.apiUrl
  // console.log('API URL from config:', apiUrl)
  
  if (apiUrl) {
    // Convert HTTP API URL to WebSocket URL
    // Ensure we have /v1 prefix - if apiUrl doesn't end with /v1, add it
    let baseWsUrl = apiUrl.replace(/^https?:/, 'ws:')
    if (!baseWsUrl.endsWith('/v1')) {
      baseWsUrl += '/v1'
    }
    wsUrl = baseWsUrl + '/sys/camera-status'
  } else {
    // Fallback to default
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    wsUrl = `${protocol}//${window.location.hostname}:8005/v1/sys/camera-status`
  }
  
  // console.log('Final WebSocket URL:', wsUrl)
  
  // console.log('Connecting to camera status WebSocket:', wsUrl)
  
  try {
    isCheckingStatus.value = true
    cameraStatusWs.value = new WebSocket(wsUrl)
    
    cameraStatusWs.value.onopen = () => {
      // console.log('Camera status WebSocket connected')
      isCheckingStatus.value = false
    }
    
    cameraStatusWs.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // console.log('Received camera status:', data)
        if (data.active_streams && Array.isArray(data.active_streams)) {
          activeCameraStreams.value = new Set(data.active_streams)
        }
      } catch (error) {
        console.warn('Error parsing camera status data:', error)
      }
    }
    
    cameraStatusWs.value.onerror = (error) => {
      console.warn('Camera status WebSocket error:', error)
      isCheckingStatus.value = false
    }
    
    cameraStatusWs.value.onclose = (event) => {
      // console.log('Camera status WebSocket disconnected:', event.code, event.reason)
      cameraStatusWs.value = null
      isCheckingStatus.value = false
    }
  } catch (error) {
    console.warn('Error creating camera status WebSocket:', error)
    isCheckingStatus.value = false
  }
}

const disconnectCameraStatusWs = () => {
  if (cameraStatusWs.value) {
    cameraStatusWs.value.close()
    cameraStatusWs.value = null
  }
  isCheckingStatus.value = false
}

// 6. Computed để tạo dynamic title cho camera item (giữ nguyên)
const getCameraItemTitle = (camera) => {
  const status = getCameraStatus(camera)
  const baseName = camera.name || 'Camera'
  
  switch (status) {
    case 'active':
      return `${baseName} is ready for stream`
    case 'inactive':
      return `${baseName} is not ready for stream`
    case 'no-stream':
    default:
      return `View details for ${baseName}`
  }
}

// 7. Lifecycle hooks - Cleanup WebSocket
onUnmounted(() => {
  disconnectCameraStatusWs()
})

// 8. Watch for drawer visibility - Connect/disconnect WebSocket
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    connectCameraStatusWs()
  } else {
    disconnectCameraStatusWs()
  }
})

const emit = defineEmits(['close', 'select-camera'])

const onImageError = (event) => {
  const img = event.target
  if (img.dataset.errorHandled) return
  console.warn('Error loading preview image:', img.src)
  img.style.display = 'none'
  img.dataset.errorHandled = 'true'
  // Show placeholder icon if image fails
  const container = img.parentElement
  const icon = container?.querySelector('i.pi-video')
  if (icon) icon.style.display = 'inline-block' // Make sure placeholder icon is visible
}

const handleItemClick = (camera) => {
  // console.log('Selected camera from list:', camera)
  emit('select-camera', camera)
}
</script>

<style scoped>
/* Transitions remain the same */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}
</style>
