<template>
  <div class="p-4 text-sm border-b border-white/10 flex-shrink-0">
    <h3 class="text-xs font-semibold uppercase text-blue-300 mb-3 tracking-wider">Resources</h3>
    <div class="space-y-2">
      <!-- CPU Usage -->
      <div class="flex items-center justify-between">
        <div class="flex items-center text-gray-300">
          <i class="pi pi-desktop mr-2 text-blue-400 text-base"></i>
          <span>CPU</span>
        </div>
        <div class="w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-1.5 rounded-full transition-all duration-300 ease-out"
            :class="cpuUsageColorClass"
            :style="cpuBarStyle"
          ></div>
        </div>
        <span
          class="text-xs font-medium w-8 text-right tabular-nums transition-colors duration-300 ease-out"
          :class="cpuUsageTextColorClass"
        >
          {{ cpuUsageText }}
        </span>
      </div>
      <!-- RAM Usage -->
      <div class="flex items-center justify-between">
        <div class="flex items-center text-gray-300">
          <RamStickIcon class="mr-2 text-blue-400 text-base w-[16px] h-[16px]" />
          <!-- <i class="pi pi-server mr-2 text-blue-400 text-base"></i> -->
          <span>RAM</span>
          <!-- Shortened label for space if needed -->
        </div>
        <div class="w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-1.5 rounded-full transition-all duration-300 ease-out"
            :class="ramUsageColorClass"
            :style="ramBarStyle"
          ></div>
        </div>
        <span
          class="text-xs font-medium w-8 text-right tabular-nums transition-colors duration-300 ease-out"
          :class="ramUsageTextColorClass"
        >
          {{ ramUsageText }}
        </span>
      </div>
      <!-- Disk Usage -->
      <div class="flex items-center justify-between">
        <div class="flex items-center text-gray-300">
          <i class="pi pi-database mr-2 text-blue-400 text-base"></i>
          <span>Disk</span>
          <!-- Shortened label for space if needed -->
        </div>
        <div class="w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-1.5 rounded-full transition-all duration-300 ease-out"
            :class="diskUsageColorClass"
            :style="diskBarStyle"
          ></div>
        </div>
        <span
          class="text-xs font-medium w-8 text-right tabular-nums transition-colors duration-300 ease-out"
          :class="diskUsageTextColorClass"
        >
          {{ diskUsageText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import 'primeicons/primeicons.css'
import RamStickIcon from '@/assets/icons/ramStickIcon.vue'

const cpuUsage = ref(0)
const ramUsage = ref(0)
const diskUsage = ref(0)
let socket = null

// --- Computed properties for display ---
const cpuUsageText = computed(() => `${Math.round(cpuUsage.value)}%`)
const ramUsageText = computed(() => `${Math.round(ramUsage.value)}%`)
const diskUsageText = computed(() =>
  diskUsage.value >= 0 ? `${Math.round(diskUsage.value)}%` : 'N/A',
)

const cpuBarStyle = computed(() => ({ width: `${cpuUsage.value}%` }))
const ramBarStyle = computed(() => ({ width: `${ramUsage.value}%` }))
const diskBarStyle = computed(() => ({ width: `${diskUsage.value >= 0 ? diskUsage.value : 0}%` }))

// --- Updated color logic with more steps ---
const getColorClasses = (percentage) => {
  if (percentage < 0) return { bar: 'bg-gray-500', text: 'text-gray-400' } // N/A disk
  if (percentage >= 90) return { bar: 'bg-red-500', text: 'text-red-400' } // 90% + (Critical)
  if (percentage >= 70) return { bar: 'bg-yellow-500', text: 'text-yellow-400' } // 70-89% (High)
  if (percentage >= 40) return { bar: 'bg-blue-500', text: 'text-blue-400' } // 40-69% (Medium)
  return { bar: 'bg-green-500', text: 'text-green-400' } // 0-39% (Low)
}
// --- End Updated color logic ---

const cpuUsageColors = computed(() => getColorClasses(cpuUsage.value))
const ramUsageColors = computed(() => getColorClasses(ramUsage.value))
const diskUsageColors = computed(() => getColorClasses(diskUsage.value))

const cpuUsageColorClass = computed(() => cpuUsageColors.value.bar)
const cpuUsageTextColorClass = computed(() => cpuUsageColors.value.text)
const ramUsageColorClass = computed(() => ramUsageColors.value.bar)
const ramUsageTextColorClass = computed(() => ramUsageColors.value.text)
const diskUsageColorClass = computed(() => diskUsageColors.value.bar)
const diskUsageTextColorClass = computed(() => diskUsageColors.value.text)

// --- WebSocket Connection (remains the same) ---
const connectWebSocket = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = window.appConfig?.apiUrl.replace(/^https?:\/\//, '') || window.location.host
  const wsUrl = `${wsProtocol}//${wsHost}/v1/sys/info`

  console.log('Connecting to WebSocket:', wsUrl)
  socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    console.log('System Info WebSocket connection established.')
  }
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      cpuUsage.value = (data.cpu * 1.7 <= 100 ? data.cpu * 1.7 : 100) ?? cpuUsage.value // Use nullish coalescing for safety
      ramUsage.value = data.ram ?? ramUsage.value
      diskUsage.value = data.disk ?? diskUsage.value
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }
  socket.onerror = (error) => {
    console.error('WebSocket Error:', error)
  }
  socket.onclose = (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason)
    socket = null // Clear the socket variable
    // Optional: Attempt to reconnect after a delay
    setTimeout(connectWebSocket, 5000) // Reconnect after 5 seconds
  }
}

const disconnectWebSocket = () => {
  if (socket) {
    console.log('Disconnecting WebSocket...')
    socket.close()
    socket = null
  }
}

onMounted(() => {
  connectWebSocket()
})

onBeforeUnmount(() => {
  disconnectWebSocket()
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums; /* Prevents layout shift */
}
.overflow-hidden {
  overflow: hidden; /* Ensures bar stays within rounded container */
}
</style>
