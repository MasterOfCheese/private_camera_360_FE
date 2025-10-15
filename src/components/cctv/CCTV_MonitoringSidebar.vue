<template>
  <aside
    :class="[
      'w-56 bg-gray-800/40 backdrop-blur-xl border-r border-white/10 flex flex-col',
      'text-gray-300 flex-shrink-0 shadow-lg z-10',
      'transition-all duration-300 ease-in-out', // The transition effect
      isVisible ? 'translate-x-0' : '-translate-x-full -ml-56', // The animation logic
    ]"
  >
    <div class="p-4 px-2 border-b border-white/10 bg-white/5">
      <h3 class="text-sm font-semibold uppercase text-blue-300 mb-2 tracking-wider">
        {{ $t('Status') }}
      </h3>
      <div class="space-y-1 text-sm">
        <div class="flex justify-between items-center">
          <span>{{ $t('Visitors') }}</span>
          <span class="font-semibold px-1 py-0.5 bg-blue-600/30 rounded text-sm text-white">
            {{ visitors }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span>{{ $t('Alarms') }}</span>
          <span class="font-semibold px-1 py-0.5 bg-red-600/30 rounded text-sm text-white">
            {{ alarms }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span>{{ $t('Violations') }}</span>
          <span class="font-semibold px-1 py-0.5 bg-yellow-600/30 rounded text-sm text-white">
            {{ violations }} %
          </span>
        </div>
      </div>
    </div>

    <SystemResource />

    <nav class="py-2 space-y-0">
      <RouterLink
        to="/"
        :class="[
          'flex items-center px-2 py-2 text-sm transition-all delay-150 duration-300',
          route.path === '/'
            ? 'font-medium bg-gradient-to-r from-blue-700/50 to-transparent text-white border-l-4 border-blue-400'
            : 'text-gray-300 rounded-md hover:bg-white/10 hover:text-white group transition-colors duration-150',
        ]"
      >
        <i
          class="pi pi-video mr-2"
          :class="
            route.path === '/'
              ? 'text-base'
              : 'text-gray-400 group-hover:text-blue-300 transition-colors duration-150 text-base'
          "
        ></i>
        <span>{{ $t('LIVE_View') }}</span>
      </RouterLink>

      <RouterLink
        to="/tour"
        :class="[
          'transition-all duration-300 flex items-center px-2 py-2 text-sm',
          route.path === '/tour'
            ? 'font-medium bg-gradient-to-r from-blue-700/50 to-transparent text-white border-l-4 border-blue-400'
            : 'text-gray-300 rounded-md hover:bg-white/10 hover:text-white group transition-colors duration-150',
        ]"
      >
        <i
          class="pi pi-compass mr-2"
          :class="
            route.path === '/tour'
              ? 'text-base'
              : 'text-gray-400 group-hover:text-blue-300 transition-colors duration-150 text-base'
          "
        ></i>
        <span>{{ $t('Virtual_Tour') }}</span>
      </RouterLink>

      <RouterLink
        to="/BBS"
        :class="[
          'transition-all duration-300 flex items-center px-2 py-2 text-sm',
          route.path === '/BBS'
            ? 'font-medium bg-gradient-to-r from-blue-700/50 to-transparent text-white border-l-4 border-blue-400'
            : 'text-gray-300 rounded-md hover:bg-white/10 hover:text-white group transition-colors duration-150',
        ]"
      >
        <i
          class="pi pi-compass mr-2"
          :class="
            route.path === '/BBS'
              ? 'text-base'
              : 'text-gray-400 group-hover:text-blue-300 transition-colors duration-150 text-base'
          "
        ></i>
        <span>{{ $t('BBS_tour') }}</span>
      </RouterLink>

      <RouterLink
        to="/notifications"
        :class="[
          'transition-all duration-300 flex items-center px-2 py-2 text-sm',
          route.path === '/notifications'
            ? 'font-medium bg-gradient-to-r from-blue-700/50 to-transparent text-white border-l-4 border-blue-400'
            : 'text-gray-300 rounded-md hover:bg-white/10 hover:text-white group transition-colors duration-150',
        ]"
      >
        <i
          class="pi pi-bell mr-2"
          :class="
            route.path === '/notifications'
              ? 'text-base'
              : 'text-gray-400 group-hover:text-blue-300 transition-colors duration-150 text-base'
          "
        ></i>
        <span>{{ $t('Notifications') }}</span>
        <span
          class="ml-auto text-xs font-medium bg-red-600 text-red-100 px-1.5 py-0.5 rounded-full"
          >{{ totalAlertsCount }}</span
        >
      </RouterLink>

      <div class="px-2 pt-2 border-t border-white/10 mt-1.5">
        <div class="flex bg-gray-700/50 rounded-md p-0.5">
          <button
            @click="activeTab = 'smartgate'"
            :class="[
              'flex-1 text-[11px] p-2 rounded cursor-pointer transition-colors duration-200',
              activeTab === 'smartgate'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-400 hover:text-gray-200',
            ]"
          >
            Smart Gate
          </button>
          <button
            @click="activeTab = 'camera360'"
            :class="[
              'flex-1 text-[11px] px-1.5 py-1 rounded cursor-pointer transition-colors duration-200',
              activeTab === 'camera360'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-400 hover:text-gray-200',
            ]"
          >
            Camera 360
          </button>
        </div>
      </div>
    </nav>

    <div
      class="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-800/40 scrollbar-track-transparent"
    >
      <div v-if="activeTab === 'smartgate'">
        <div
          v-for="(alert, index) in displayedSmartGateAlerts"
          :key="'sg-' + index"
          :class="[
            'bg-red-900 border-t border-gray-700 p-3 rounded-md cursor-pointer transition duration-200',
            'hover:scale-[1.02] hover:shadow-md hover:bg-red-700/80',
            alert.active ? 'bg-opacity-80' : 'bg-opacity-50',
          ]"
          @click="viewDetails(alert)"
        >
          <div class="font-semibold">{{ alert.title }}</div>

          <div class="text-sm flex items-center text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
            {{ alert.name_camera }}
          </div>

          <div class="flex items-center text-sm text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ alert.name_user || 'Test' }}</span>
          </div>

          <div class="flex items-center text-sm text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ alert.location }}</span>
          </div>

          <div class="flex items-center text-sm text-gray-200 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ alert.time }}</span>
          </div>
        </div>

        <div v-if="displayedSmartGateAlerts.length === 0" class="p-6 text-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mx-auto mb-3 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>No Smart Gate alerts to display</p>
        </div>
      </div>

      <div v-if="activeTab === 'camera360'">
        <div
          v-for="(alarm, index) in displayedCamera360Alarms"
          :key="'c360-' + index"
          :class="`bg-red-900 border-t border-gray-700 p-3 cursor-pointer bg-opacity-80 transform transition duration-300 hover:scale-105 hover:shadow-xl hover:bg-red-700`"
          @click="viewCamera360Details(alarm)"
        >
          <div class="font-semibold">{{ alarm.error_detail }}</div>

          <div class="text-sm flex items-center drop-shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1 text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
            {{ alarm.camera_name || 'Unknown' }}
          </div>

          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1 text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm drop-shadow">{{ alarm.location }}</span>
          </div>

          <div class="flex items-center mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1 text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm drop-shadow">{{ alarm.timestamp }}</span>
          </div>
        </div>

        <div v-if="displayedCamera360Alarms.length === 0" class="p-6 text-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mx-auto mb-3 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>No Camera 360 alarms to display</p>
        </div>
      </div>
    </div>

    <div class="pt-1 pb-2 border-t border-white/10">
      <RouterLink
        to="/settings"
        :class="[
          'flex items-center p-2 text-sm transition-all duration-300',
          route.path === '/settings'
            ? 'font-medium bg-gradient-to-r from-blue-700/50 to-transparent text-white border-l-4 border-blue-400'
            : 'text-gray-300 rounded-md hover:bg-white/10 hover:text-white group transition-colors duration-150',
        ]"
      >
        <i
          class="pi pi-cog mr-3"
          :class="
            route.path === '/settings'
              ? 'text-base'
              : 'text-gray-400 group-hover:text-blue-300 transition-colors duration-150 text-base'
          "
        ></i>
        <span>{{ $t('Settings') }}</span>
      </RouterLink>

      <a
        class="flex items-center p-2 text-sm text-gray-300 rounded-md hover:bg-white/10 hover:text-white group transition-colors duration-150 cursor-pointer"
        @click="logout"
      >
        <i
          class="pi pi-sign-out mr-3 text-gray-400 group-hover:text-blue-300 transition-colors duration-150 text-base"
        ></i>
        <span>{{ $t('Logout') }}</span>
      </a>
    </div>

    <div class="p-2 border-t border-white/10 text-xs text-center text-gray-500">
      <div class="flex items-center justify-center space-x-2">
        <div>
          <div>POWERED BY</div>
          <div class="font-bold text-blue-300 text-sm mt-1 tracking-wide">CPEG-AI</div>
        </div>
        <img :src="gifSrc" alt="My GIF" class="w-12 h-auto" />
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="selectedLog && activeTab === 'smartgate'"
        class="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full" @click.stop>
          <h3 class="text-xl font-bold mb-4">Event Log Details</h3>
          <div class="grid grid-cols-2 gap-4">
            <div><strong>ID:</strong> {{ selectedLog.ID }}</div>
            <div>
              <strong>Name:</strong> {{ selectedLog.name_user ? selectedLog.name_user : 'Test' }}
            </div>
            <div><strong>DateTime:</strong> {{ new Date(selectedLog.time).toLocaleString() }}</div>
            <div><strong>Camera:</strong> {{ selectedLog.name_camera }}</div>
            <div><strong>Location:</strong> {{ selectedLog.location }}</div>
            <div><strong>Error Code:</strong> {{ selectedLog.title }}</div>
            <div><strong>Status:</strong> {{ selectedLog.Status }}</div>
            <div v-if="selectedLog.description" class="col-span-2">
              <strong>Description:</strong> {{ selectedLog.description }}
            </div>
            <div v-if="selectedLog.img_url" class="col-span-2">
              <strong>Image:</strong>
              <img :src="selectedLog.img_url" alt="Error image" class="mt-2 max-w-full h-auto" />
            </div>
            <div v-if="selectedLog.videoPath && selectedLog.baseUrl" class="col-span-2">
              <strong>Video: </strong>
              <video controls class="mt-2 max-w-full h-auto">
                <source :src="`${selectedLog.baseUrl}/${selectedLog.videoPath}`" type="video/mp4" />
              </video>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div v-if="selectedLog.Status === 'Pending'" class="space-x-2">
              <Button label="Accept" severity="success" size="small" @click="accept(selectedLog)" />
              <Button
                label="Decline"
                severity="danger"
                size="small"
                @click="decline(selectedLog)"
              />
            </div>
            <div v-else>
              <Button
                :label="selectedLog.Status"
                :severity="selectedLog.Status === 'OK' ? 'success' : 'danger'"
                size="small"
                disabled
              />
            </div>
            <button
              class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              @click="selectedLog = null"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div
        v-if="selectedCamera360Alarm"
        class="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full" @click.stop>
          <h3 class="text-xl font-bold mb-4 text-white">Camera 360 Alarm Details</h3>
          <div class="grid grid-cols-2 gap-4 text-white">
            <div><strong>ID:</strong> {{ selectedCamera360Alarm.id }}</div>
            <div><strong>Location:</strong> {{ selectedCamera360Alarm.location }}</div>

            <div>
              <strong>Camera:</strong> {{ selectedCamera360Alarm.camera_name || 'Unknown' }}
            </div>
            <div><strong>Date Time:</strong> {{ selectedCamera360Alarm.timestamp }}</div>

            <div>
              <strong>Status: </strong>
              <span :class="getStatusColor(selectedCamera360Alarm.status)">
                {{ getStatusText(selectedCamera360Alarm.status) }}
              </span>
            </div>
            <div v-if="selectedCamera360Alarm.error_detail">
              <strong>Error Code:</strong> {{ selectedCamera360Alarm.error_detail }}
            </div>

            <div v-if="selectedCamera360Alarm.video_error" class="col-span-2">
              <strong>Video:</strong>
              <video controls class="mt-2 max-w-full h-auto rounded-lg">
                <source :src="camera360ErrorVideoUrl" type="video/mp4" />
              </video>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div v-if="selectedCamera360Alarm.status === 0" class="space-x-2">
              <Button
                label="Accept"
                severity="success"
                size="small"
                @click="acceptCamera360WorkerEvent(selectedCamera360Alarm)"
              />
              <Button
                label="Decline"
                severity="danger"
                size="small"
                @click="declineCamera360WorkerEvent(selectedCamera360Alarm)"
              />
            </div>
            <div v-else-if="selectedCamera360Alarm.status === 1">
              <Button label="Accepted" severity="success" size="small" disabled />
            </div>
            <div v-else-if="selectedCamera360Alarm.status === 2">
              <Button label="Declined" severity="danger" size="small" disabled />
            </div>
            <div v-else>
              <Button label="Confirmed" severity="success" size="small" disabled />
            </div>
            <button
              class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 hover:cursor:pointer"
              @click="selectedCamera360Alarm = null"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineProps } from 'vue'
import { useAuthStore } from '@/stores'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import SortIcon from '@/components/icons/IconSort.vue'
import SystemResource from '@/components/cctv/SystemResource.vue'
import Button from 'primevue/button'
import { fetchWrapper } from '@/helper'
import { onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import gifSrc from '@/assets/iSeeMascoticenter.gif'
defineProps({
  isVisible: {
    type: Boolean,
    default: true,
  },
})
const { t } = useI18n()
const cpuUsage = ref(96)
const ramUsage = ref(44.7)
const displayRamUsage = computed(() => Math.round(ramUsage.value))
const baseUrl_api = ref('')

const currentCamera360Page = ref(1)
const camera360PageSize = ref(10)
const totalCamera360Items = ref(0)

const totalCamera360Pages = computed(() => {
  return Math.ceil(totalCamera360Items.value / camera360PageSize.value)
})

const goToCamera360Page = async (page) => {
  currentCamera360Page.value = page
  await fetchCamera360WorkerEvents()
}

const displayedCamera360Pages = computed(() => {
  const totalPagesValue = totalCamera360Pages.value
  const currentPageValue = currentCamera360Page.value
  const maxPagesToShow = 5
  const pages = []

  // Show all pages if total pages is less than or equal to maxPagesToShow
  if (totalPagesValue <= maxPagesToShow) {
    return Array.from({ length: totalPagesValue }, (_, i) => i + 1)
  }

  // Show pages around current page
  const half = Math.floor(maxPagesToShow / 2)
  let start = Math.max(1, currentPageValue - half)
  let end = Math.min(totalPagesValue, start + maxPagesToShow - 1)

  // Adjust start if end is near the end
  if (end - start + 1 < maxPagesToShow) {
    start = Math.max(1, end - maxPagesToShow + 1)
  }

  // Add first page and "..." if needed
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Add "..." and last page if needed
  if (end < totalPagesValue) {
    if (end < totalPagesValue - 1) pages.push('...')
    pages.push(totalPagesValue)
  }

  return pages
})

// Tab switching
const activeTab = ref('smartgate') // 'smartgate' hoặc 'camera360'

let interval = null

onMounted(() => {
  // Cập nhật giá trị mỗi 3 giây
  interval = setInterval(() => {
    // Tạo giá trị ngẫu nhiên từ 50 đến 100 cho CPU
    cpuUsage.value = Math.floor(Math.random() * 51) + 50

    // Tạo giá trị ngẫu nhiên từ 20 đến 70 cho RAM
    ramUsage.value = Math.floor(Math.random() * 51) + 50
  }, 5000)
})

onBeforeUnmount(() => {
  // Xóa interval khi component bị hủy
  if (interval) {
    clearInterval(interval)
  }
})

const route = useRoute()
const authStore = useAuthStore()
const selectedLog = ref(null)
// Khai báo các biến
const visitors = ref(0)
const alarms = ref(0)
const violations = ref(0)

// Camera 360 data (new)
const selectedCamera360Alarm = ref(null)
const camera360Alarms = ref([])

const logout = () => {
  if (confirm(t('log_out'))) {
    authStore.logout()
  }
}

// Loading state
const isLoading = ref(false)
// Dữ liệu logs lấy từ API
const allLogs = ref([])
// Dữ liệu alerts sẽ hiển thị
const alerts = ref([])
// Filtered logs nếu bạn cần lọc thêm (tùy)
const filteredLogs = ref([])

const paginatedLogs = computed(() => {
  return filteredLogs.value.slice(startIndex.value, endIndex.value)
})

const viewDetails = (log) => {
  selectedLog.value = log
  console.log('selectedLog.value ::: ', selectedLog)
}

const viewCamera360Details = (alarm) => {
  selectedCamera360Alarm.value = alarm
  // console.log("selectedCamera360Alarm.value ::: ", selectedCamera360Alarm);
}

// Fetch Camera 360 worker events
const fetchCamera360WorkerEvents = async () => {
  try {
    const apiResponse = await fetchWrapper.get(
      `${window.appConfig.apiUrl}/v1/cameras/worker-events?page=${currentCamera360Page.value}&size=${camera360PageSize.value}`,
    )

    camera360Alarms.value = apiResponse?.data || []
    totalCamera360Items.value = apiResponse?.total || 0
  } catch (error) {
    console.error('Error fetching Camera 360 worker events:', error)
    camera360Alarms.value = []
    totalCamera360Items.value = 0
  }
}

// Thêm vào trong script của bạn
const getStatusColor = (status) => {
  switch (status) {
    case 0:
      return 'text-yellow-400' // Pending
    case 1:
      return 'text-green-400' // Accepted
    case 2:
      return 'text-red-400' // Declined
    default:
      return 'text-gray-400'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0:
      return 'Pending'
    case 1:
      return 'Accepted'
    case 2:
      return 'Declined'
    default:
      return 'Unknown'
  }
}

// Confirm Camera 360 worker event
const confirmCamera360WorkerEvent = async (workerEvent) => {
  const confirmMessage = 'Are you sure you want to confirm this worker event?'

  if (!confirm(confirmMessage)) {
    return
  }

  try {
    // Gọi API để confirm worker event (cần tạo endpoint mới tương tự alarms)
    const response = await fetchWrapper.patch(
      `${window.appConfig.apiUrl}/v1/cameras/worker-events/${workerEvent.id}/confirm`,
      {
        employee_confirm_id: authStore.user?.id || 'unknown', // Lấy từ auth store
        client_ip: clientId, // Backend sẽ tự lấy IP
      },
    )

    if (response) {
      // Update local state
      workerEvent.is_confirmed = true
      selectedCamera360Alarm.value = null

      // Refresh danh sách
      await fetchCamera360WorkerEvents()
    }
  } catch (error) {
    console.error('Error confirming Camera 360 worker event:', error)
    alert('Failed to confirm worker event. Please try again.')
  }
}

// Hàm lấy dữ liệu logs từ các camera (Smart Gate)
const fetchLogs = async () => {
  isLoading.value = true

  try {
    // Bước 1: Lấy danh sách camera
    const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`)

    // Map baseUrl -> camera name để tra nhanh
    const urlToCameraName = {}
    cameras.forEach((camera) => {
      try {
        if (!camera.statistic_api_url) return
        let apiUrl = camera.statistic_api_url.trim()
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
          apiUrl = 'http://' + apiUrl
        }
        const baseUrl = new URL(apiUrl).origin
        urlToCameraName[baseUrl] = camera.name
      } catch (error) {
        console.error(`Invalid URL in camera ${camera.name}:`, camera.statistic_api_url, error)
      }
    })

    // Bước 2: Lấy tất cả URL hợp lệ (không null, không trống)
    const statisticUrls = Object.keys(urlToCameraName)

    // Bước 3: Lấy dữ liệu sự kiện từ mỗi URL
    const allResults = await Promise.all(
      statisticUrls.map(async (baseUrl) => {
        try {
          const response = await fetch(`${baseUrl}/notification_stats?query=all`, {
            method: 'GET',
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          const results = Array.isArray(data) ? data : data.results || []

          // Với mỗi bản ghi, thêm trường 'camera' = tên camera
          return results.map((item) => ({
            ...item,
            camera: urlToCameraName[baseUrl] || 'Unknown',
            sourceUrl: baseUrl,
          }))
        } catch (error) {
          console.error(`Error fetching from ${baseUrl}:`, error)
          return []
        }
      }),
    )

    // Bước 4: Gộp tất cả kết quả
    const combinedResults = allResults.flat()

    // Bước 5: Sắp xếp theo datetime mới nhất
    allLogs.value = combinedResults.sort((a, b) => {
      return new Date(b.datetime) - new Date(a.datetime)
    })

    // Cập nhật Alerts dựa trên Logs mới nhất
    alerts.value = allLogs.value.slice(0, 10).map((item) => ({
      ID: item.ID,
      baseUrl: item.sourceUrl,
      videoPath: item.videoPath,
      title: item.Irregularity,
      imgPath: item.imgPath,
      name_camera: item.camera,
      name_user: item.name || 'null',
      location: item.location || 'Unknown',
      time: item.datetime || '',
      Status: item.Status,
    }))

    // Lấy dữ liệu và cập nhật trạng thái
    await fetchAndUpdateStatus(statisticUrls)

    applyFilters()
  } catch (error) {
    console.error('Error in fetchLogs:', error)
    allLogs.value = []
    filteredLogs.value = []
  } finally {
    isLoading.value = false
  }
}

const applyFilters = () => {
  let result = [...allLogs.value]

  // Apply filters
  if (filters.value.status) {
    result = result.filter((log) => log.Status === filters.value.status)
  }

  if (filters.value.camera) {
    const query = filters.value.camera.toLowerCase()
    result = result.filter((log) => log.camera && log.camera.toLowerCase().includes(query))
  }

  if (filters.value.id) {
    const query = filters.value.id.toLowerCase()
    result = result.filter((log) => log.ID && log.ID.toString().toLowerCase().includes(query))
  }

  if (filters.value.error_code) {
    const query = filters.value.error_code.toLowerCase()
    result = result.filter(
      (log) => log.Irregularity && log.Irregularity.toLowerCase().includes(query),
    )
  }

  if (filters.value.location) {
    const query = filters.value.location.toLowerCase()
    result = result.filter((log) => log.location && log.location.toLowerCase().includes(query))
  }

  // Apply sorting
  if (sort.value.by) {
    result.sort((a, b) => {
      const fieldA = a[sort.value.by]
      const fieldB = b[sort.value.by]

      if (fieldA === fieldB) return 0

      // Handle date comparison
      if (sort.value.by === 'datetime') {
        const dateA = new Date(fieldA)
        const dateB = new Date(fieldB)
        return sort.value.order === 'asc' ? dateA - dateB : dateB - dateA
      }

      // Handle string comparison
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sort.value.order === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA)
      }

      // Handle number comparison
      return sort.value.order === 'asc' ? fieldA - fieldB : fieldB - fieldA
    })
  }

  filteredLogs.value = result

  // Reset to first page when filters change
  goToPage(1)
}

// Hàm lấy dữ liệu từ API và cập nhật
const fetchAndUpdateStatus = async (statisticUrls) => {
  try {
    const allStatusResults = await Promise.all(
      statisticUrls.map(async (baseUrl) => {
        try {
          const response = await fetch(`${baseUrl}/update_status`, { method: 'GET' })
          if (!response.ok) throw new Error(`Failed to fetch from ${baseUrl}`)
          const data = await response.json()
          return {
            visitors: data.today?.visitors || 0,
            alarms: data.today?.alarms || 0,
            violations: data.today?.violations || 0,
          }
        } catch (error) {
          console.error(`Error fetching from ${baseUrl}:`, error)
          return { visitors: 0, alarms: 0, violations: 0 }
        }
      }),
    )

    // Tính tổng visitors và alarms trước
    const totals = allStatusResults.reduce(
      (acc, curr) => ({
        visitors: acc.visitors + curr.visitors,
        alarms: acc.alarms + curr.alarms,
      }),
      { visitors: 0, alarms: 0 },
    )

    // Tính violations sau khi có tổng
    const totalStatus = {
      ...totals,
      violations: totals.visitors > 0 ? ((totals.alarms / totals.visitors) * 100).toFixed(2) : 0,
    }

    // Cập nhật vào các biến reactive
    visitors.value = totalStatus.visitors
    alarms.value = totalStatus.alarms
    violations.value = totalStatus.violations
  } catch (error) {
    console.error('Error in fetching or processing status:', error)
  }
}

// Thiết lập cập nhật tự động
onMounted(() => {
  // Lấy danh sách camera và thiết lập các URL ngay từ đầu
  const setupInitialData = async () => {
    try {
      const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`)

      // Map baseUrl -> camera name
      const urlToCameraName = {}
      cameras.forEach((camera) => {
        try {
          if (!camera.statistic_api_url) return
          let apiUrl = camera.statistic_api_url.trim()
          if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
            apiUrl = 'http://' + apiUrl
          }
          const baseUrl = new URL(apiUrl).origin
          console.log('baseUrl:===========>', baseUrl)
          urlToCameraName[baseUrl] = camera.name
        } catch (error) {
          console.error(`Invalid URL in camera ${camera.name}:`, camera.statistic_api_url, error)
        }
      })

      const statisticUrls = Object.keys(urlToCameraName)

      // Lấy dữ liệu ban đầu
      await fetchAndUpdateStatus(statisticUrls)

      // Thiết lập interval để cập nhật dữ liệu mỗi 5 giây
      setInterval(async () => {
        await fetchAndUpdateStatus(statisticUrls)
        await fetchLogs()
        await fetchCamera360WorkerEvents() // Thay đổi từ fetchCamera360Alarms
      }, 5000)

      fetchLogs()
      fetchCamera360WorkerEvents() // Thay đổi từ fetchCamera360Alarms
    } catch (error) {
      console.error('Error setting up initial data:', error)
    }
  }

  setupInitialData()
})

// Tính tổng kết (nếu cần sử dụng ở nơi khác)
const totalSummary = computed(() => ({
  visitors: visitors.value,
  alarms: alarms.value,
  violations: violations.value,
}))

// Hàm lọc logs (nếu cần)
// const applyFilters = () => {
//   filteredLogs.value = allLogs.value
// }

// Computed properties for displayed alerts
const displayedSmartGateAlerts = computed(() => {
  return alerts.value.slice(0, 10)
})

const displayedCamera360Alarms = computed(() => {
  return camera360Alarms.value
})

// Total alerts count for badge
const totalAlertsCount = computed(() => {
  return alerts.value.length + camera360Alarms.value.length
})

const length_alerts = computed(() => filteredLogs.value.length)

// Hiển thị tối đa 10 alerts
const displayedAlerts = computed(() => {
  // console.log("alerts.value ::: ", alerts.value);
  return alerts.value.slice(0, 10)
})

// Gọi fetchLogs khi component được mounted
fetchLogs()
/////////////////////////////////////////////////////////////////////////////////

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Sorting & Filtering
const sort = ref({
  by: '',
  order: 'asc',
})
const filters = ref({
  status: '',
  camera: '',
  id: '',
  error_code: '',
  location: '',
})

// Computed
const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / pageSize.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const endIndex = computed(() => {
  return startIndex.value + parseInt(pageSize.value)
})

const displayedPages = computed(() => {
  const totalPagesValue = totalPages.value
  const currentPageValue = currentPage.value
  const maxPagesToShow = 5
  const pages = []

  // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxPagesToShow
  if (totalPagesValue <= maxPagesToShow) {
    return Array.from({ length: totalPagesValue }, (_, i) => i + 1)
  }

  // Hiển thị các trang xung quanh trang hiện tại
  const half = Math.floor(maxPagesToShow / 2)
  let start = Math.max(1, currentPageValue - half)
  let end = Math.min(totalPagesValue, start + maxPagesToShow - 1)

  // Điều chỉnh lại start nếu end đã đến gần cuối
  if (end - start + 1 < maxPagesToShow) {
    start = Math.max(1, end - maxPagesToShow + 1)
  }

  // Thêm trang đầu và dấu "..." nếu cần
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  // Thêm các trang ở giữa
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Thêm dấu "..." và trang cuối nếu cần
  if (end < totalPagesValue) {
    if (end < totalPagesValue - 1) pages.push('...')
    pages.push(totalPagesValue)
  }

  return pages
})

const camera360ErrorImageUrl = computed(() => {
  if (
    selectedCamera360Alarm.value &&
    selectedCamera360Alarm.value.img_error &&
    typeof window !== 'undefined' &&
    window.appConfig
  ) {
    return `${window.appConfig.apiUrl}/${selectedCamera360Alarm.value.img_error}`
  }
  return ''
})

const camera360ErrorVideoUrl = computed(() => {
  if (
    selectedCamera360Alarm.value &&
    selectedCamera360Alarm.value.video_error &&
    typeof window !== 'undefined' &&
    window.appConfig
  ) {
    return `${window.appConfig.apiUrl}/${selectedCamera360Alarm.value.video_error}`
  }
  return ''
})

const acceptCamera360WorkerEvent = async (workerEvent) => {
  const confirmMessage = 'Are you sure you want to accept this worker event?'

  if (!confirm(confirmMessage)) {
    return
  }

  try {
    const url = `${window.appConfig.apiUrl}/v1/cameras/worker-events/${workerEvent.id}/accept`

    // Simplified payload - remove status field
    const payload = {
      ID: workerEvent.id,
      action: 'OK',
      // Remove: status: "Pending"
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Camera 360 accept error:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Camera 360 accept success:', data)

    // Update UI
    workerEvent.status = 1
    await fetchCamera360WorkerEvents()
  } catch (error) {
    console.error('Error accepting Camera 360 worker event:', error)
    alert(`Failed to accept worker event: ${error.message}`)
  }
}

const declineCamera360WorkerEvent = async (workerEvent) => {
  const confirmMessage = 'Are you sure you want to decline this worker event?'

  if (!confirm(confirmMessage)) {
    return
  }

  try {
    const url = `${window.appConfig.apiUrl}/v1/cameras/worker-events/${workerEvent.id}/decline`

    // Simplified payload - remove status field
    const payload = {
      ID: workerEvent.id,
      action: 'NG',
      // Remove: status: "Pending"
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Camera 360 decline error:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Camera 360 decline success:', data)

    // Update UI
    workerEvent.status = 2
    await fetchCamera360WorkerEvents()
  } catch (error) {
    console.error('Error declining Camera 360 worker event:', error)
    alert(`Failed to decline worker event: ${error.message}`)
  }
}

// Function chung để xử lý cả accept và decline cho Camera 360
const processCamera360Action = async (workerEvent, action, statusValue) => {
  const confirmMessage = `Are you sure you want to ${action} this worker event?`

  if (!confirm(confirmMessage)) {
    return
  }

  try {
    const url = `${window.appConfig.apiUrl}/v1/cameras/worker-events/${workerEvent.id}/${action}`

    // Payload đơn giản - chỉ gửi những gì backend thực sự cần
    const payload = {
      employee_confirm_id: 'system', // Giá trị cố định, đơn giản
      client_ip: null,
    }

    console.log(`Camera 360 ${action} request:`, { url, payload })

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Camera 360 ${action} error:`, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`Camera 360 ${action} success:`, data)

    // Cập nhật UI ngay lập tức
    workerEvent.status = statusValue

    // Refresh danh sách
    await fetchCamera360WorkerEvents()
  } catch (error) {
    console.error(`Error ${action}ing Camera 360 worker event:`, error)
    alert(`Failed to ${action} worker event: ${error.message}`)
  }
}

// Methods
const toggleSort = (field) => {
  if (sort.value.by === field) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.by = field
    sort.value.order = 'asc'
  }
  applyFilters()
}

const goToPage = (page) => {
  currentPage.value = page
}

// Smart Gate functions (existing)
async function postNotification(log, action, status) {
  const url_post = `${log.baseUrl}/notification_action`
  console.log('url_post ::: ', log.baseUrl)
  const confirmMessage = 'Are you sure you want to perform this action?'

  if (!confirm(confirmMessage)) {
    return
  }

  try {
    const response = await fetch(url_post, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ID: log.ID,
        action: action, // "OK" hoặc "NG"
        status: status, // "Violation" hoặc "Alert"
      }),
    })

    const data = await response.json()
    console.log('response ::: ', data)

    if (response.ok) {
      // Sau khi thành công thì cập nhật Status trực tiếp
      log.Status = action
    } else {
      console.error('Lỗi server ::: ', data.detail || data)
    }
  } catch (error) {
    console.error('Lỗi ngoại lệ: ', error)
  }
}

// Khi nhấn Accept
function accept(log) {
  postNotification(log, 'OK', 'Violation')
}

// Khi nhấn Decline
function decline(log) {
  postNotification(log, 'NG', 'Alert')
}

// Lifecycle hooks
onMounted(() => {
  fetchLogs()
})

// Watch for pageSize changes
watch(pageSize, () => {
  goToPage(1)
})
</script>

<style scoped>
/* Styles for scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.4);
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(59, 130, 246, 0.6);
}
</style>
