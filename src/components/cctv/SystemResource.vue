<template>
  <div class="p-2 text-sm border-b border-white/10 flex-shrink-0">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-[10px] font-semibold uppercase text-blue-300 tracking-wide">
        Resources
      </h3>
      <!-- Carousel Dots -->
      <div class="flex space-x-1">
        <button
          @click="currentPage = 0"
          :class="[
            'w-2.5 h-2.5 rounded-full transition-colors duration-300',
            currentPage === 0 ? 'bg-blue-400 scale-105' : 'bg-gray-600 hover:bg-gray-500',
          ]"
          aria-label="View CPU, RAM, Disk"
        ></button>
        <button
          @click="currentPage = 1"
          :class="[
            'w-2.5 h-2.5 rounded-full transition-colors duration-300',
            currentPage === 1 ? 'bg-blue-400 scale-105' : 'bg-gray-600 hover:bg-gray-500',
          ]"
          aria-label="View GPU, Network"
        ></button>
      </div>
    </div>


    <!-- Carousel Container with overflow hidden for smooth transition -->
    <div class="relative h-[60px] overflow-hidden">
      <!-- Page 1: CPU, RAM, Disk -->
      <transition
        enter-active-class="transition-transform duration-500 ease-out"
        leave-active-class="transition-transform duration-200 ease-in absolute top-0 left-0 right-0"
        :enter-from-class="transitionDirection === 'next' ? 'translate-x-full' : '-translate-x-full'"
        :enter-to-class="'translate-x-0'"
        :leave-from-class="'translate-x-0'"
        :leave-to-class="transitionDirection === 'next' ? '-translate-x-full' : 'translate-x-full'"
      >
        <div v-if="currentPage === 0" key="page1" class="space-y-1.5 w-full" @click="stopAutoSlide">
          <!-- CPU Usage -->
          <div class="flex items-center justify-between">
            <div class="flex items-center text-gray-300 w-[54px] flex-shrink-0">
              <i class="pi pi-desktop mr-1.5 text-blue-400 text-sm"></i>
              <span class="text-[11px]">CPU</span>
            </div>
            <div class="flex-grow mx-1.5 bg-gray-700 rounded-full h-1 overflow-hidden">
              <div
                class="h-1 rounded-full transition-all duration-300 ease-out"
                :class="cpuUsageColorClass"
                :style="cpuBarStyle"
              ></div>
            </div>
            <span
              class="text-[11px] font-medium w-7 text-right tabular-nums transition-colors duration-300 ease-out"
              :class="cpuUsageTextColorClass"
            >
              {{ cpuUsageText }}
            </span>
          </div>
          <!-- RAM Usage -->
          <div class="flex items-center justify-between">
            <div class="flex items-center text-gray-300 w-[54px] flex-shrink-0">
              <RamStickIcon class="mr-1.5 text-blue-400 text-sm w-[14px] h-[14px]" />
              <span class="text-[11px]">RAM</span>
            </div>
            <div class="flex-grow mx-1.5 bg-gray-700 rounded-full h-1 overflow-hidden">
              <div
                class="h-1 rounded-full transition-all duration-300 ease-out"
                :class="ramUsageColorClass"
                :style="ramBarStyle"
              ></div>
            </div>
            <span
              class="text-[11px] font-medium w-7 text-right tabular-nums transition-colors duration-300 ease-out"
              :class="ramUsageTextColorClass"
            >
              {{ ramUsageText }}
            </span>
          </div>
          <!-- Disk Usage -->
          <div class="flex items-center justify-between">
            <div class="flex items-center text-gray-300 w-[54px] flex-shrink-0">
              <i class="pi pi-database mr-1.5 text-blue-400 text-sm"></i>
              <span class="text-[11px]">Disk</span>
            </div>
            <div class="flex-grow mx-1.5 bg-gray-700 rounded-full h-1 overflow-hidden">
              <div
                class="h-1 rounded-full transition-all duration-300 ease-out"
                :class="diskUsageColorClass"
                :style="diskBarStyle"
              ></div>
            </div>
            <span
              class="text-[11px] font-medium w-7 text-right tabular-nums transition-colors duration-300 ease-out"
              :class="diskUsageTextColorClass"
            >
              {{ diskUsageText }}
            </span>
          </div>
        </div>
      </transition>

      <!-- Page 2: GPU, Network -->
      <transition
        enter-active-class="transition-transform duration-500 ease-out"
        leave-active-class="transition-transform duration-200 ease-in absolute top-0 left-0 right-0"
        :enter-from-class="transitionDirection === 'next' ? 'translate-x-full' : '-translate-x-full'"
        :enter-to-class="'translate-x-0'"
        :leave-from-class="'translate-x-0'"
        :leave-to-class="transitionDirection === 'next' ? '-translate-x-full' : 'translate-x-full'"
      >
        <div v-if="currentPage === 1" key="page2" class="space-y-1.5 w-full" @click="stopAutoSlide">
          <!-- GPU Usage -->
          <div class="flex items-center justify-between">
            <div class="flex items-center text-gray-300 w-[54px] flex-shrink-0">
              <i class="pi pi-microchip-ai mr-1.5 text-blue-400 text-sm"></i>
              <span class="text-[11px]">GPU</span>
            </div>
            <div class="flex-grow mx-1.5 bg-gray-700 rounded-full h-1 overflow-hidden">
              <div
                class="h-1 rounded-full transition-all duration-300 ease-out"
                :class="gpuUsageColorClass"
                :style="gpuBarStyle"
              ></div>
            </div>
            <span
              class="text-[11px] font-medium w-7 text-right tabular-nums transition-colors duration-300 ease-out"
              :class="gpuUsageTextColorClass"
            >
              {{ gpuUsageText }}
            </span>
          </div>
          <!-- Network Upload -->
          <div class="flex items-center justify-between">
            <div class="flex items-center text-gray-300 w-[54px] flex-shrink-0">
              <i class="pi pi-upload mr-1.5 text-blue-400 text-sm"></i>
              <span class="text-[11px]">Up</span>
            </div>
            <div class="flex-grow mx-1.5"></div>
            <span class="text-[11px] font-medium w-auto text-right tabular-nums text-gray-300 pr-0.5">
              {{ netUpText }}
            </span>
          </div>
          <!-- Network Download -->
          <div class="flex items-center justify-between">
            <div class="flex items-center text-gray-300 w-[54px] flex-shrink-0">
              <i class="pi pi-download mr-1.5 text-blue-400 text-sm"></i>
              <span class="text-[11px]">Down</span>
            </div>
            <div class="flex-grow mx-1.5"></div>
            <span class="text-[11px] font-medium w-auto text-right tabular-nums text-gray-300 pr-0.5">
              {{ netDownText }}
            </span>
          </div>
        </div>
      </transition>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import 'primeicons/primeicons.css'
import RamStickIcon from '@/assets/icons/ramStickIcon.vue'

// --- Resource State ---
const cpuUsage = ref(0)
const ramUsage = ref(0)
const diskUsage = ref(0)
const gpuUsage = ref(0) // New
const netUp = ref(0) // New
const netDown = ref(0) // New

// --- Carousel State ---
const currentPage = ref(0)
const totalPages = 2
const autoSlideInterval = ref(10000) // 10 seconds
let slideTimer = null
const transitionDirection = ref('next') // 'next' or 'prev' for transition animation

// --- WebSocket ---
let socket = null

// --- Computed properties for display ---
const cpuUsageText = computed(() => `${Math.round(cpuUsage.value)}%`)
const ramUsageText = computed(() => `${Math.round(ramUsage.value)}%`)
const diskUsageText = computed(() =>
  diskUsage.value >= 0 ? `${Math.round(diskUsage.value)}%` : 'N/A',
)
const gpuUsageText = computed(() => `${Math.round(gpuUsage.value)}%`)

const formatNetworkSpeed = (bytes) => {
  if (bytes < 1024) return `${bytes} B/s`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`
}
const netUpText = computed(() => formatNetworkSpeed(netUp.value))
const netDownText = computed(() => formatNetworkSpeed(netDown.value))

// Bar styles
const cpuBarStyle = computed(() => ({ width: `${cpuUsage.value}%` }))
const ramBarStyle = computed(() => ({ width: `${ramUsage.value}%` }))
const diskBarStyle = computed(() => ({ width: `${diskUsage.value >= 0 ? diskUsage.value : 0}%` }))
const gpuBarStyle = computed(() => ({ width: `${gpuUsage.value}%` })) // Assuming GPU is also a percentage

// Color logic (can be reused)
const getColorClasses = (percentage) => {
  if (percentage < 0) return { bar: 'bg-gray-500', text: 'text-gray-400' }
  if (percentage >= 90) return { bar: 'bg-red-500', text: 'text-red-400' }
  if (percentage >= 70) return { bar: 'bg-yellow-500', text: 'text-yellow-400' }
  if (percentage >= 40) return { bar: 'bg-blue-500', text: 'text-blue-400' }
  return { bar: 'bg-green-500', text: 'text-green-400' }
}

// Color classes for each resource
const cpuUsageColors = computed(() => getColorClasses(cpuUsage.value))
const ramUsageColors = computed(() => getColorClasses(ramUsage.value))
const diskUsageColors = computed(() => getColorClasses(diskUsage.value))
const gpuUsageColors = computed(() => getColorClasses(gpuUsage.value)) // Use same logic for GPU

const cpuUsageColorClass = computed(() => cpuUsageColors.value.bar)
const cpuUsageTextColorClass = computed(() => cpuUsageColors.value.text)
const ramUsageColorClass = computed(() => ramUsageColors.value.bar)
const ramUsageTextColorClass = computed(() => ramUsageColors.value.text)
const diskUsageColorClass = computed(() => diskUsageColors.value.bar)
const diskUsageTextColorClass = computed(() => diskUsageColors.value.text)
const gpuUsageColorClass = computed(() => gpuUsageColors.value.bar)
const gpuUsageTextColorClass = computed(() => gpuUsageColors.value.text)

// --- Carousel Logic ---
const nextSlide = () => {
  transitionDirection.value = 'next'
  currentPage.value = (currentPage.value + 1) % totalPages
}

const startAutoSlide = () => {
  if (slideTimer) clearInterval(slideTimer)
  slideTimer = setInterval(nextSlide, autoSlideInterval.value)
}

const stopAutoSlide = () => {
  if (slideTimer) clearInterval(slideTimer)
}

// --- WebSocket Connection ---
const connectWebSocket = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = window.appConfig?.apiUrl?.replace(/^https?:\/\//, '') || window.location.host
  const wsUrl = `${wsProtocol}//${wsHost}/v1/sys/info`

  // console.log('SystemResources: Connecting to WebSocket:', wsUrl)
  socket = new WebSocket(wsUrl)

  socket.onopen = () => 
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      cpuUsage.value = Math.min((data.cpu ?? cpuUsage.value) * 1.7, 100)
      ramUsage.value = data.ram ?? ramUsage.value
      diskUsage.value = data.disk ?? diskUsage.value
      gpuUsage.value = data.gpu ?? gpuUsage.value
      netUp.value = data.net_up ?? netUp.value
      netDown.value = data.net_down ?? netDown.value
    } catch (error) {
      console.error('SystemResources: Failed to parse WebSocket message:', error)
    }
  }
  socket.onerror = (error) => console.error('SystemResources: WebSocket Error:', error)
  socket.onclose = (event) => {
    console.log('SystemResources: WebSocket connection closed:', event.code, event.reason)
    socket = null
    stopAutoSlide() // Stop sliding if connection drops
    setTimeout(connectWebSocket, 5000) // Reconnect
  }
}

const disconnectWebSocket = () => {
  if (socket) {
    console.log('SystemResources: Disconnecting WebSocket...')
    socket.close()
    socket = null
  }
}

// Reset timer when user manually changes slide
watch(currentPage, () => {
  startAutoSlide()
})

onMounted(() => {
  connectWebSocket()
  startAutoSlide()
})

onBeforeUnmount(() => {
  disconnectWebSocket()
  stopAutoSlide()
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
.overflow-hidden {
  overflow: hidden;
}
/* Optional: If icons need consistent sizing */
.pi {
  flex-shrink: 0; /* Prevent icons from shrinking */
}
</style>
