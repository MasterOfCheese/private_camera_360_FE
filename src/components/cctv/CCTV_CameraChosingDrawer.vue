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
            :title="`View details for ${camera.name}`"
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
                  <p
                    class="text-xs text-blue-300 truncate text-right flex-shrink-0"
                    :title="camera.location"
                  >
                    <i class="pi pi-map-marker text-xs mr-1 opacity-80"></i>
                    {{ camera.location ?? 'N/A' }}
                  </p>
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

defineProps({
  cameras: {
    type: Array,
    default: () => [],
  },
  visible: {
    type: Boolean,
    default: false,
  },
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
  console.log('Selected camera from list:', camera)
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
