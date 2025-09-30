<!-- eslint-disable no-unused-vars -->
<template>
  <div class="h-full flex flex-col p-4 md:p-6 relative">
    <div class="flex justify-end mb-4 flex-shrink-0">
      <div
        class="flex items-center bg-gray-800/60 backdrop-blur-lg rounded-lg overflow-hidden border border-white/10 shadow-md p-1.5 space-x-2">
        <!-- Toggle Button -->
        <button
          @click="enableAlarms = !enableAlarms"
          :title="enableAlarms ? 'Off Alarm' : 'On Alarm'"
          :class="[
            'p-3 rounded-full transition-colors duration-300',
            'focus:outline-none focus:ring-4 focus:ring-opacity-50',
            'bg-transparent hover:bg-white/10 focus:ring-gray-300'
          ]"
        >
          <svg
            v-if="enableAlarms"
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 text-black animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          <svg 
            v-else 
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 text-black animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 20L20 4"
            />
          </svg>
        </button>

        <!-- Layout Buttons -->
        <button v-for="layout in layouts" :key="layout.id" :class="[
          'p-1.5 rounded-md transition-colors duration-150',
          currentLayout === layout.id
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-400 hover:bg-white/10 hover:text-gray-100',
        ]" :title="`${layout.id} layout`" @click="setCurrentLayout(layout.id)">
          <component :is="layout.icon" class="w-5 h-5" :class="currentLayout === layout.id ? 'fill-blue-300' : 'fill-transparent'" />
        </button>
        <!-- Settings Button -->
        <button
          class="p-1.5 rounded-md text-gray-400 hover:bg-white/10 hover:text-gray-100 transition-colors duration-150"
          title="Settings" @click="openSettings">
          <i class="pi pi-cog text-lg"></i>
        </button>
      </div>
    </div>

    <!-- Grid (Remains the same) -->
    <div :class="getGridClass()" class="flex-1 min-h-0">
      <CameraCard v-for="(item, index) in gridState" :key="item.id || `empty-${index}`"
        :camera="item.status === 'filled' ? item : null" :live-timestamp="liveTimestamp"
        @click="handleSlotClick(item, index)" @deletecamera="handleDeleteCamera" :class="index === 0 && targetGridSize === 6 ? 'col-span-2 row-span-2' : '' "/>
    </div>

    <!-- Settings Modal (Remains the same) -->
    <div v-if="settingsVisible" @click.self="closeSettings"
      class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] transition-opacity duration-300 ease-out">
      <div
        class="bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out">
        <!-- Modal Content -->
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-white">Grid Settings</h2>
            <button @click="closeSettings" class="text-gray-400 hover:text-white transition-colors text-2xl leading-none">
              ×
            </button>
          </div>
          <div class="space-y-4">
            <div>
              <label for="cameraCount" class="block text-sm font-medium text-blue-300 mb-1">
                Preferred Grid Size
              </label>
              <select id="cameraCount" v-model="selectedCameraCount"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none">
                <option v-for="option in cameraCountOptions" :key="option.value" :value="option.value"
                  class="bg-gray-700">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-8 border-t border-white/10 pt-4">
            <button @click="closeSettings" type="button"
              class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg font-medium transition duration-200 text-sm">
              Cancel
            </button>
            <button @click="applyCameraSettings" type="button"
              class="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition duration-200 shadow-md text-sm">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera Choosing Drawer (Remains the same) -->
    <CameraChosingDrawer :visible="isDrawerVisible" :cameras="availableCameras" @close="closeDrawer"
      @select-camera="handleCameraSelectedFromList" />

    <!-- Alarm Toggle Button - Dynamic position above popup -->
    <div 
      v-if="hasActiveAlarms" 
      class="fixed right-4 z-50"
      :style="{ bottom: `calc(3rem + min(60vh, ${Math.min(360 + (alarmList.length * 63), 600)}px) + 0.9rem)` }"
    >
      <button
        @click="toggleAlarmPopup"
        class="relative flex items-center justify-center w-12 h-12 
              bg-red-600 hover:bg-red-700 
              rounded-full shadow-xl 
              transition-all duration-300 ease-in-out
              hover:scale-110 hover:shadow-red-500/50
              cursor-pointer"
        :class="{ 'animate-bounce': !alarmPopupVisible }"
      >
        <!-- Warning Icon with Slash when hidden -->
        <div class="relative">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6 text-white" 
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
          <!-- Slash line when popup is hidden -->
          <div 
            v-if="!alarmPopupVisible"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-10 h-0.5 bg-white transform rotate-45 rounded-full"></div>
          </div>
        </div>
        
        <!-- Badge số lượng NG errors -->
        <span 
          class="absolute -top-1 -right-1 
                bg-yellow-500 text-black 
                text-xs font-bold 
                rounded-full w-5 h-5 
                flex items-center justify-center
                border-2 border-white
                animate-pulse"
        >
          {{ alarmList.length }}
        </span>
      </button>
    </div>

    <!-- Alarm Popup - Giữ nguyên vị trí như cũ -->
    <Dialog
      v-if="hasActiveAlarms"
      v-model:visible="alarmPopupVisible"
      header="CCTV Alarm Monitoring"
      :modal="false"
      :closable="false"
      :draggable="false"
      :resizable="false"
      :style="{ backgroundColor: 'rgba(31,41,55,0.6)' }"
      class="fixed bottom-2 right-2 
            w-[90vw] sm:w-[22rem] md:w-[24rem] lg:w-[26rem] xl:w-[20rem]
            max-w-[95vw] max-h-[85vh] sm:max-h-[80vh]
            backdrop-blur-xl rounded-xl shadow-2xl 
            border border-white/20 text-white
            overflow-hidden transition-all duration-300 ease-out
            scale-100 opacity-100"
    >
      <div class="flex flex-col h-full max-h-[75vh] sm:max-h-96">
        <!-- Header with Select All -->
        <div class="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3 pb-2 border-b border-gray-600">
          <!-- Left -->
          <span class="text-sm sm:text-md font-medium text-blue-300 whitespace-nowrap">
            {{ alarmList.length }} NG Error(s) Found
          </span>

          <!-- Right (button + warning) -->
          <div class="flex flex-col items-start sm:items-end">
            <Button 
              @click="selectAllAlarms" 
              :label="selectedAlarms.size === alarmList.length ? 'Deselect All' : 'Select All'"
              class="p-button-sm text-xs sm:text-sm"
              size="small"
            />
          </div>
        </div>

        <!-- Scrollable Alarm List -->
        <div class="overflow-y-auto flex-1 space-y-2 sm:space-y-3 scrollbar-thin scrollbar-thumb-blue-700/50 scrollbar-track-transparent pr-1 sm:pr-2">
          <div 
            v-for="alarm in alarmList" 
            :key="alarm.id"
            class="flex flex-col sm:flex-row items-start p-2 sm:p-3 border border-gray-600 rounded-lg bg-gray-800/40 gap-2 sm:gap-3"
            :class="{ 'bg-blue-700/20 border-blue-500': selectedAlarms.has(alarm.id) }"
          >
            <!-- Mobile: Checkbox and Image row -->
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <!-- Checkbox -->
              <div class="flex-shrink-0">
                <input
                  type="checkbox"
                  :checked="selectedAlarms.has(alarm.id)"
                  @change="toggleAlarmSelection(alarm.id)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/20 cursor-pointer"
                />
              </div>

              <!-- Alarm Image -->
              <img 
                :src="alarm.img_error" 
                alt="NG Error Image" 
                class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-gray-500 flex-shrink-0"
              />

              <!-- Mobile: Camera ID inline with image -->
              <div class="block sm:hidden flex-1 min-w-0">
                <div class="text-xs">
                  <span class="text-gray-400">Camera:</span>
                  <span class="ml-1 text-white font-medium break-all">{{ alarm.camera_id }}</span>
                </div>
              </div>
            </div>

            <!-- Alarm Information -->
            <div class="flex-1 min-w-0 text-xs sm:text-sm space-y-1 w-full">
              <!-- Desktop: Camera ID -->
              <div class="hidden sm:block">
                <span class="text-gray-400">Camera:</span>
                <span class="ml-2 text-white font-medium break-all">{{ alarm.camera_id }}</span>
              </div>
              
              <div>
                <span class="text-gray-400">Error:</span>
                <span class="ml-1 sm:ml-2 text-blue-300 font-medium break-words">{{ alarm.error_detail }}</span>
              </div>
              
              <div>
                <span class="text-gray-400">Location:</span>
                <span class="ml-1 sm:ml-2 text-white break-words">{{ alarm.location }}</span>
              </div>
              
              <div>
                <span class="text-gray-400">Time:</span>
                <span class="ml-1 sm:ml-2 text-white text-xs sm:text-sm">
                  {{ new Date(alarm.timestamp || alarm.created_at).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Employee ID Input -->
        <div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-600 flex-shrink-0">
          <input
            v-model="confirmCode"
            placeholder="Enter your employee ID (e.g., V1234567)"
            class="p-2 sm:p-3 w-full border border-gray-600 rounded-lg text-white text-xs sm:text-sm uppercase placeholder-gray-400 placeholder:text-xs sm:placeholder:text-sm bg-gray-800/50"
          />
          <div v-if="confirmCode && !isConfirmCodeValid" class="text-xs sm:text-sm text-red-400 mt-1">
            Invalid employee ID format! (Expected format: V1234567)
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 w-full">
          <span class="text-xs sm:text-sm text-gray-400 order-2 sm:order-1">
            <!-- Selected: {{ selectedAlarms.size }} / {{ alarmList.length }} -->
          </span>
          <Button 
            :disabled="isFormIncomplete" 
            @click="confirmAlarm" 
            :label="`Confirm Errors!`"
            :unstyled="true"
            :class="[ 
              'text-white font-medium px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors duration-400 border-none cursor-pointer text-sm sm:text-base order-1 sm:order-2 w-full sm:w-auto',
              isFormIncomplete 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-400 hover:brightness-110'
            ]"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGridStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { fetchWrapper } from '@/helper'
import 'primeicons/primeicons.css'

// Import Icons and Child Components
import SingleLayout from '@/assets/icons/1.vue'
import quad from '@/assets/icons/4.vue'
import six from '@/assets/icons/1_6.vue'
import nine from '@/assets/icons/9.vue'
import CameraCard from '@/components/cctv/CCTV_CameraCard.vue'
import CameraChosingDrawer from '@/components/cctv/CCTV_CameraChosingDrawer.vue'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
// import ToggleButton from 'primevue/togglebutton'

// =========================

// Computed Property để kiểm tra regex
const isConfirmCodeValid = computed(() => {
  const regex = /^[vgfah]\d{7}$/i;
  return regex.test(confirmCode.value);
});

const alarmSound = '/sounds/1140044.mp3'
const started = ref(false);
let intervalId = null;
let previousTotalAlarms = null;
let apiUrls = []; // ← Chuyển từ const sang let để gán sau

function playSound(audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play().catch(err => {
    console.warn('Error playing sound:' , err);
  });
}

const isConfirming = ref(false);

async function checkTotalAlarmsAndPlay(apiUrls, audioUrl) {
  try {
    // Đếm trực tiếp trong JS thay vì gọi API
    const currentAlarmCount = alarmList.value.length;
    
    if (previousTotalAlarms !== null && currentAlarmCount > previousTotalAlarms) {
      console.log('📢 Có cảnh báo mới:', currentAlarmCount);
      playSound(audioUrl);
      await fetchAlarms();
    }
    
    previousTotalAlarms = currentAlarmCount;
  } catch (err) {
    console.error('Lỗi khi check alarms:', err);
  }
}

function checkAlarms() {
  checkTotalAlarmsAndPlay(apiUrls, alarmSound);
}

async function startMonitoring() {
  if (!started.value) {
    started.value = true;

    // ✅ Lấy danh sách apiUrls từ fetchAllCameras
    apiUrls = await fetchAllCameras_Url();
    // console.log('apiUrls :::', apiUrls);

    if (apiUrls.length === 0) {
      console.warn('Không có camera nào hợp lệ để giám sát.');
      return;
    }

    checkAlarms();
    intervalId = setInterval(checkAlarms, 4000);
  }
}

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
});

//////////////////////////////////////////////////////

// --- Store Setup ---
const gridStore = useGridStore()
const { gridState } = storeToRefs(gridStore) // Reactive state for template
const { initializeGrid, saveToLocalStorage, loadPersistedIds, setGridSlot, removeCamera } =
  gridStore // Actions/Helpers

// --- Component State ---
const isInitializing = ref(true) // Flag to prevent watcher during setup
const currentLayout = ref('quad') // Default, will be overwritten
const layouts = [
  { id: 'single', icon: SingleLayout, count: 1 },
  { id: 'quad', icon: quad, count: 4 },
  { id: 'six', icon: six, count: 6 },
  { id: 'nine', icon: nine, count: 9 },
]
const preferredGridSize = ref(4) // Default, will be overwritten
const selectedCameraCount = ref(4) // For settings modal
const cameraCountOptions = ref([
  { label: '1 Camera', value: 1 },
  { label: '4 Cameras', value: 4 },
  { label: '6 Cameras', value: 6 },
  { label: '9 Cameras', value: 9 },
  { label: '16 Cameras', value: 16 },
])

const allCameras = ref([]) // Holds fresh camera data from API
const liveTimestamp = ref('')
const settingsVisible = ref(false)
const isDrawerVisible = ref(false)
const targetGridIndex = ref(null) // Index for adding camera from drawer
const enableAlarms = ref(true) // Mặc định bật noti

// Alarm State
const alarmList = ref([]) // Danh sách các alarm chưa được confirm
const selectedAlarms = ref(new Set()) // Set các alarm đã được chọn
// giữ nguyên
const alarmPopupVisible = ref(false)
const currentAlarm = ref(null)
const confirmCode = ref('')
const alarmAudio = ref(new Audio('/sounds/1140044.mp3'))
const clientIp = ref('') // Lưu IP của client

// Thêm flag mới vào script setup
const userHasHiddenPopup = ref(false); // Flag theo dõi user đã tự ẩn popup

// Computed để kiểm tra có alarm nào đang phát âm thanh không
const hasActiveAlarms = computed(() => alarmList.value.length > 0)

// Lấy IP của client
const getClientIp = async () => {
  try {
    // Sử dụng WebRTC để lấy IP nội bộ
    const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
    if (!RTCPeerConnection) {
      console.error('WebRTC không được hỗ trợ trên trình duyệt này')
      clientIp.value = 'Unknown'
      return
    }

    const pc = new RTCPeerConnection({ iceServers: [] })
    pc.createDataChannel('') // Tạo kênh dữ liệu giả
    pc.createOffer().then(offer => pc.setLocalDescription(offer))

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate
        const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
        if (ipMatch) {
          const ip = ipMatch[1]
          if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
            clientIp.value = ip // Lưu IP nội bộ
            pc.close()
          }
        }
      }
    }

    // Fallback nếu không tìm thấy IP sau 5 giây
    setTimeout(() => {
      if (!clientIp.value) {
        clientIp.value = 'Unknown'
        pc.close()
      }
    }, 5000)
  } catch (err) {
    console.error('Error fetching client IP:', err)
    clientIp.value = 'Unknown'
  }
}

// Computed để kiểm tra form và selection
const isFormIncomplete = computed(() => {
  return !confirmCode.value.trim() || 
         !isConfirmCodeValid.value || 
         selectedAlarms.value.size === 0
})

// Cập nhật hàm fetchAlarms() - thay thế hàm hiện tại
async function fetchAlarms() {
  // Thêm isConfirming.value vào điều kiện có sẵn
  if (!enableAlarms.value || isConfirming.value) return;
  
  try {
    const response = await fetchWrapper.get(
      `${window.appConfig.apiUrl}/v1/cameras/alarms/unconfirmed`
    );
    
    if (response && Array.isArray(response) && response.length > 0) {
      const processedAlarms = response.map(alarm => {
        if (alarm.img_error && alarm.img_error !== 'null' && alarm.img_error !== null) {
          alarm.img_error = window.appConfig.apiUrl + '/' + alarm.img_error;
        }
        return alarm;
      });
      
      // Sửa logic so sánh - dùng ID thay vì length
      const currentIds = new Set(alarmList.value.map(a => a.id));
      const hasNewAlarms = processedAlarms.some(alarm => !currentIds.has(alarm.id));
      
      alarmList.value = processedAlarms;
      
      if (hasNewAlarms) {
        playSound(alarmSound);
        if (!userHasHiddenPopup.value) {
          alarmPopupVisible.value = true;
        }
        startAlarmAudio();
      }
      
    } else {
      alarmList.value = [];
      selectedAlarms.value.clear();
      stopAlarmAudio();
      alarmPopupVisible.value = false;
      userHasHiddenPopup.value = false;
    }
    
  } catch (err) {
    console.error('Error fetching alarms:', err);
  }
}

// Cập nhật hàm toggleAlarmPopup
const toggleAlarmPopup = () => {
  alarmPopupVisible.value = !alarmPopupVisible.value;
  userHasHiddenPopup.value = !alarmPopupVisible.value;
};

// ✅ 7. HOẶC nếu vẫn có vấn đề, dùng cách này (aggressive):
const confirmAlarmAggressive = async () => {
  if (isFormIncomplete.value) return;
  
  try {
    const selectedAlarmIds = Array.from(selectedAlarms.value);
    const employeeId = confirmCode.value;
    
    // 1. Tắt interval tạm thời
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmInterval = null;
    }
    
    // 2. Clear UI ngay
    alarmList.value = [];
    selectedAlarms.value.clear();
    confirmCode.value = '';
    stopAlarmAudio();
    alarmPopupVisible.value = false;
    userHasHiddenPopup.value = false;
    
    // 3. Gọi API
    const confirmPromises = selectedAlarmIds.map(alarmId => {
      return fetchWrapper.patch(
        `${window.appConfig.apiUrl}/v1/cameras/alarms/${alarmId}/confirm`, 
        {
          employee_confirm_id: employeeId,
          client_ip: 'Browser-Client'
        }
      );
    });
    
    await Promise.all(confirmPromises);
    console.log(`Confirmed ${selectedAlarmIds.length} alarms`);
    
    // 4. Delay trước khi restart interval
    setTimeout(() => {
      startAlarmSimulation();
    }, 2000); // Wait 2s cho server kip process
    
  } catch (err) {
    console.error('Error confirming alarms:', err);
    // Restart interval ngay kể cả khi lỗi
    startAlarmSimulation();
  }
};

// Hàm bắt đầu phát âm thanh
const startAlarmAudio = () => {
  if (hasActiveAlarms.value) {
    alarmAudio.value.loop = true;
    alarmAudio.value.play().catch(err => {
      console.warn('Audio autoplay blocked by browser. User interaction required:', err);
      // Có thể hiển thị notification yêu cầu user click để enable sound
    });
  }
}

// Hàm dừng âm thanh
const stopAlarmAudio = () => {
  alarmAudio.value.pause();
  alarmAudio.value.currentTime = 0;
  alarmAudio.value.loop = false;
}

// Alarm Monitoring
let alarmInterval = null

const simulateAlarms = () => {
  if (!enableAlarms.value) {
    const alarm = getMockAlarm();
    console.log('Logged alarm without popup:', alarm);
    return;
  }
  const alarm = getMockAlarm();
  currentAlarm.value = { ...alarm, timestamp: new Date().toISOString() };
  // Use img_error directly (URL from API or mock data)
  console.log('Image URL:', currentAlarm.value.img_error); // Debug
  alarmPopupVisible.value = true;
  alarmAudio.value.play().catch(err => console.warn('Audio error:', err));
}

const startAlarmSimulation = () => {
  if (alarmInterval) return; // Tránh double interval
  
  // Gọi ngay lần đầu
  fetchAlarms();
  
  // Interval đơn giản
  alarmInterval = setInterval(fetchAlarms, 5000);
}

// Cập nhật hàm stopAlarmSimulation
const stopAlarmSimulation = () => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  stopAlarmAudio();
  alarmPopupVisible.value = false;
  confirmCode.value = '';
  alarmList.value = [];
  selectedAlarms.value.clear();
}

// Hàm toggle selection của alarm
const toggleAlarmSelection = (alarmId) => {
  if (selectedAlarms.value.has(alarmId)) {
    selectedAlarms.value.delete(alarmId);
  } else {
    selectedAlarms.value.add(alarmId);
  }
}

// Hàm select all alarms
const selectAllAlarms = () => {
  if (selectedAlarms.value.size === alarmList.value.length) {
    selectedAlarms.value.clear();
  } else {
    selectedAlarms.value.clear();
    alarmList.value.forEach(alarm => selectedAlarms.value.add(alarm.id));
  }
}

// Thêm hàm này để lấy IP công khai, đáng tin cậy hơn WebRTC
const getPublicIp = async () => {
  try {
    // Tạo AbortController để control timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Chỉ 2 giây thôi
    
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
      timeout: 2000 // Backup timeout
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error('Failed to fetch public IP');
    }
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('IP fetch timeout after 2s');
    } else {
      console.error('Error fetching public IP:', err);
    }
    return 'Unknown';
  }
}

const confirmAlarm = async () => {
  if (isFormIncomplete.value || isConfirming.value) return;
  
  isConfirming.value = true;
  
  try {
    const selectedAlarmIds = Array.from(selectedAlarms.value);
    const employeeId = confirmCode.value;
    
    // 🔒 BACKUP DATA trước khi xóa (để rollback nếu cần)
    const backupAlarms = alarmList.value.filter(alarm => 
      selectedAlarmIds.includes(alarm.id)
    );
    
    // // ⏱️ TIMEOUT ĐỂ GIỐNG THẬT HƠN
    // await new Promise(resolve => setTimeout(resolve, 350));
    
    // ✅ CẬP NHẬT UI SAU TIMEOUT
    const confirmedIds = new Set(selectedAlarmIds);
    alarmList.value = alarmList.value.filter(alarm => !confirmedIds.has(alarm.id));
    
    // Clear form
    selectedAlarms.value.clear();
    confirmCode.value = '';
    
    // Hide popup if no more alarms
    if (alarmList.value.length === 0) {
      stopAlarmAudio();
      alarmPopupVisible.value = false;
      userHasHiddenPopup.value = false;
    }
    
    // 🚫 TẠM DỪNG fetchAlarms() để tránh race condition
    const originalInterval = alarmInterval;
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmInterval = null;
    }
    
    // 🌐 API CALLS với better error handling
    const confirmPromises = selectedAlarmIds.map(alarmId => {
      return fetchWrapper.patch(
        `${window.appConfig.apiUrl}/v1/cameras/alarms/${alarmId}/confirm`, 
        {
          employee_confirm_id: employeeId,
          client_ip: 'Browser-Client'
        }
      ).catch(err => {
        console.error(`Failed to confirm alarm ${alarmId}:`, err);
        return { error: true, alarmId }; // Return error info thay vì null
      });
    });
    
    Promise.all(confirmPromises).then(responses => {
      const failedAlarms = responses.filter(r => r && r.error);
      const successCount = responses.length - failedAlarms.length;
      
      console.log(`Successfully confirmed ${successCount}/${selectedAlarmIds.length} alarms`);
      
      // 🔄 ROLLBACK failed alarms nếu cần
      if (failedAlarms.length > 0) {
        const failedIds = failedAlarms.map(r => r.alarmId);
        const alarmsToRestore = backupAlarms.filter(alarm => 
          failedIds.includes(alarm.id)
        );
        
        if (alarmsToRestore.length > 0) {
          alarmList.value = [...alarmList.value, ...alarmsToRestore];
          console.warn(`Restored ${alarmsToRestore.length} failed confirmations`);
          
          // Show popup lại nếu có alarm restore
          if (!alarmPopupVisible.value && alarmList.value.length > 0) {
            alarmPopupVisible.value = true;
            userHasHiddenPopup.value = false;
          }
        }
      }
      
      // 🔄 RESTART interval sau delay
      setTimeout(() => {
        if (!alarmInterval) {
          startAlarmSimulation();
        }
      }, 2000);
    });
    
  } catch (err) {
    console.error('Error confirming alarms:', err);
    alert('Không thể xác nhận cảnh báo. Vui lòng thử lại.');
  } finally {
    // 🔓 DELAY reset isConfirming để prevent spam
    setTimeout(() => {
      isConfirming.value = false;
    }, 1000);
  }
};

const getLocalIP = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Local IP timeout'));
    }, 1000); // Chỉ 1 giây

    try {
      const RTCPeerConnection = window.RTCPeerConnection || 
                               window.mozRTCPeerConnection || 
                               window.webkitRTCPeerConnection;
                               
      if (!RTCPeerConnection) {
        clearTimeout(timeout);
        reject(new Error('WebRTC not supported'));
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            const ip = ipMatch[1];
            clearTimeout(timeout);
            pc.close();
            resolve(ip);
          }
        }
      };
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

// ✅ 6. HOẶC đơn giản nhất: Không cần IP thực, dùng browser info
const confirmAlarmSimple = async () => {
  if (isFormIncomplete.value) {
    console.error('Form is incomplete or no alarms selected.');
    return;
  }
  
  try {
    const selectedAlarmIds = Array.from(selectedAlarms.value);
    if (selectedAlarmIds.length === 0) return;
    
    // ✅ Cập nhật UI ngay lập tức
    const confirmedIds = new Set(selectedAlarmIds);
    alarmList.value = alarmList.value.filter(alarm => !confirmedIds.has(alarm.id));
    
    const employeeId = confirmCode.value;
    selectedAlarms.value.clear();
    confirmCode.value = '';
    
    if (alarmList.value.length === 0) {
      stopAlarmAudio();
      alarmPopupVisible.value = false;
      userHasHiddenPopup.value = false;
    }
    
    // ✅ Dùng thông tin có sẵn thay vì fetch IP
    const browserInfo = `${navigator.userAgent.slice(0, 50)}...`;
    const timestamp = new Date().toISOString();
    const clientId = `Browser-${timestamp.slice(-8)}`; // Unique ID từ timestamp
    
    // API call background
    const confirmPromises = selectedAlarmIds.map(alarmId => {
      return fetchWrapper.patch(
        `${window.appConfig.apiUrl}/v1/cameras/alarms/${alarmId}/confirm`, 
        {
          employee_confirm_id: employeeId,
          client_ip: clientId, // Dùng clientId thay vì IP thực
        }
      ).catch(err => {
        console.error(`Failed to confirm alarm ${alarmId}:`, err);
        return null;
      });
    });
    
    Promise.all(confirmPromises).then(responses => {
      const successCount = responses.filter(r => r && r.alarm).length;
      console.log(`Successfully confirmed ${successCount}/${selectedAlarmIds.length} alarms`);
      setTimeout(fetchAlarms, 1000);
    });
    
  } catch (err) {
    console.error('Error confirming alarms:', err);
    alert(`Không thể xác nhận cảnh báo. Vui lòng thử lại.`);
  }
}


// --- Computed Properties ---
const targetGridSize = computed(() => {
  // Size based on current layout button OR preferred size if no layout matches (e.g., 16)
  const layout = layouts.find((l) => l.id === currentLayout.value)
  return layout ? layout.count : preferredGridSize.value
})

const availableCameras = computed(() => {
  // Cameras from API not currently displayed in the grid
  const displayedIds = new Set(
    gridState.value.filter((item) => item.status === 'filled').map((item) => item.id),
  )
  return allCameras.value.filter((cam) => !displayedIds.has(cam.id))
})

// --- Methods ---
const getGridClass = () => {
  // Dynamic CSS grid classes based on target size
  const count = targetGridSize.value
  const baseClass = 'grid gap-3 max-h-full max-w-full h-full w-full'
  let gridLayoutClass = 'grid-cols-2 grid-rows-2' // Default to 4
  if (count === 1) gridLayoutClass = 'grid-cols-1 grid-rows-1'
  else if (count <= 4) gridLayoutClass = 'grid-cols-2 grid-rows-2'
  else if (count <= 6) gridLayoutClass = 'grid-cols-3 grid-rows-3'
  else if (count <= 9) gridLayoutClass = 'grid-cols-3 grid-rows-3'
  else if (count <= 16) gridLayoutClass = 'grid-cols-4 grid-rows-4'

  return `${baseClass} ${gridLayoutClass}`
}

const updateLiveTimestamp = () => {
  liveTimestamp.value = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

// Fetches all camera data from the API - *Does NOT initialize grid*
const fetchAllCameras = async () => {
  try {
    // console.log('Fetching all cameras...')
    const response = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`) // Adjust limit if needed
    
    // Get existing cameras from local storage to preserve webrtc_ip_low if needed
    // eslint-disable-next-line no-unused-vars
    const savedIds = loadPersistedIds()
    const existingCameras = gridState.value
      .filter(item => item.status === 'filled' && item.webrtc_ip_low)
      .reduce((acc, item) => ({...acc, [item.id]: item}), {})

    // Process response to preserve webrtc_ip_low values
    allCameras.value = (response || []).map(camera => {
      const existing = existingCameras[camera.id]
      if (existing && !camera.webrtc_ip_low) {
        // If backend didn't return webrtc_ip_low, preserve the existing one
        return { ...camera, webrtc_ip_low: existing.webrtc_ip_low }
      }
      return camera
    })

    // console.log(`Fetched ${allCameras.value.length} cameras.`)
    if (response?.length > 0 && !response[0].webrtc_ip_low) {
      console.warn('Backend API did not return webrtc_ip_low field. Some features may be limited.')
    }
  } catch (err) {
    console.error('Error fetching cameras:', err)
    allCameras.value = [] // Set to empty on error to avoid issues
    // Consider showing an error message to the user
  }
}

async function fetchAllCameras_Url() {
  try {
    // console.log('Fetching all cameras...');
    const response = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);
    const cameras = response || [];

    const apiUrls = [];
    cameras.forEach(camera => {
      try {
        if (!camera.statistic_api_url) return;
        let apiUrl = camera.statistic_api_url.trim();
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
          apiUrl = 'http://' + apiUrl;
        }
        const baseUrl = new URL(apiUrl).origin;
        apiUrls.push(`${baseUrl}/update_status`);
      } catch (error) {
        console.error(`Invalid URL in camera ${camera.name}:`, camera.statistic_api_url, error);
      }
    });

    // console.log('Generated API URLs:::', apiUrls);
    return apiUrls;
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // console.error('Error fetching cameras:', err);
    return [];
  }
}

// Determines initial layout/size based on saved IDs - Returns config object
const determineInitialLayoutConfig = () => {
  // Load the full (16 element) persisted array
  const savedIds = loadPersistedIds()
  // Count actual cameras within the persisted state
  const actualCameraCount = savedIds.filter((id) => id !== null).length

  // *** Decide initial size logic: ***
  // Option A: Base size on number of actual cameras (like before)
  let size = 4
  let layoutId = 'quad'
  if (actualCameraCount === 1) {
    size = 1
    layoutId = 'single'
  } else if (actualCameraCount > 1 && actualCameraCount <= 4) {
    size = 4
    layoutId = 'quad'
  } else if (actualCameraCount > 4 && actualCameraCount <= 6) {
    size = 6
    layoutId = 'six'
  } else if (actualCameraCount > 6 && actualCameraCount <= 9) {
    size = 9
    layoutId = 'nine'
  } else if (actualCameraCount > 9) {
    size = 16
    layoutId = null
  } // Or cap at 9 if 16 isn't a standard layout

  // Option B: Try to restore last *used* layout/size (Requires saving size separately)
  // const savedSize = parseInt(localStorage.getItem('preferredGridSize') || '4');
  // size = savedSize;
  // const matchingLayout = layouts.find(l => l.count === size);
  // layoutId = matchingLayout ? matchingLayout.id : null;

  // --- Let's stick with Option A for now unless specified otherwise ---
  // console.log(`Found ${actualCameraCount} actual saved cameras in persisted state.`)
  // console.log(`Determined initial config: size=${size}, layoutId=${layoutId}`)
  return { initialSize: size, initialLayoutId: layoutId }
}

// --- User Interaction Handlers ---
const setCurrentLayout = (layoutId) => {
  const layout = layouts.find((l) => l.id === layoutId)
  if (layout) {
    // Update state - watcher will trigger grid refresh
    currentLayout.value = layoutId
    preferredGridSize.value = layout.count
    selectedCameraCount.value = layout.count
  }
}

const applyCameraSettings = () => {
  // Update state based on modal selection - watcher will trigger grid refresh
  preferredGridSize.value = selectedCameraCount.value
  const matchingLayout = layouts.find((l) => l.count === preferredGridSize.value)
  currentLayout.value = matchingLayout ? matchingLayout.id : null // Update layout button state if matches
  localStorage.setItem('enableAlarms', enableAlarms.value) // Lưu setting
  closeSettings()
}

const handleSlotClick = (item, index) => {
  // Open drawer if an empty slot is clicked
  if (item.status === 'empty') {
    targetGridIndex.value = index
    isDrawerVisible.value = true
  } else {
    // console.log('Clicked on filled slot:', item);
    // startMonitoring(); // Gọi hàm giám sát
    startAlarmSimulation() // Thay startMonitoring() bằng startAlarmSimulation()
    // console.log("đã tương tác");
  }
}

// Assumes @deletecamera passes the full camera object
const handleDeleteCamera = (cameraToDelete) => {
  if (!cameraToDelete || !cameraToDelete.id) {
    console.error('Invalid data received for delete camera event.')
    return
  }
  console.log('Removing camera:', cameraToDelete.id)
  removeCamera(cameraToDelete.id) // Call store action
}

const handleCameraSelectedFromList = (selectedCam) => {
  // Add selected camera from drawer to the target grid slot
  if (targetGridIndex.value !== null && targetGridIndex.value < gridState.value.length) {
    setGridSlot(targetGridIndex.value, selectedCam)
    closeDrawer()
  }
}

const openSettings = () => {
  selectedCameraCount.value = preferredGridSize.value // Sync modal with current setting
  settingsVisible.value = true
}
const closeSettings = () => (settingsVisible.value = false)
const closeDrawer = () => {
  isDrawerVisible.value = false
  targetGridIndex.value = null
}

// --- Lifecycle Hooks ---
let timestampInterval
onMounted(async () => {
  // console.log('Component Mounting...')
  try {
    // 1. Determine target size & layout ID from storage
    const { initialSize, initialLayoutId } = determineInitialLayoutConfig()

    // 2. Set the reactive refs (watcher will see change but ignore due to flag)
    preferredGridSize.value = initialSize
    currentLayout.value = initialLayoutId
    selectedCameraCount.value = initialSize // Sync modal select too

    // 3. Fetch camera data
    await fetchAllCameras()

    // 4. *Explicitly* initialize the grid using determined size and fetched data
    //    This is the *single point* of initial grid creation.
    // console.log(`Initializing grid with size ${initialSize} after fetching cameras.`)
    initializeGrid(initialSize, allCameras.value) // Call store action directly
    
    enableAlarms.value = localStorage.getItem('enableAlarms') === 'true' // Load from localStorage

    // 5. Start timestamp updates
    updateLiveTimestamp()
    timestampInterval = setInterval(updateLiveTimestamp, 1000)

    // await getClientIp() // Thêm để lấy IP
    startAlarmSimulation() // Thêm để bắt đầu simulation
    await startMonitoring()
  } catch (error) {
    console.error('Error during component mount:', error)
    // Handle initialization error (e.g., show error message to user)
  } finally {
    // 6. Allow watcher to function for user interactions now
    isInitializing.value = false
    // console.log('Initialization complete, watcher enabled.')
  }
})

onBeforeUnmount(() => {
  clearInterval(timestampInterval);
  stopAlarmSimulation() // Thêm dòng này
})

// --- Watchers ---

// Watch for changes in the *calculated* target grid size (triggered by layout/settings changes)
watch(targetGridSize, (newSize, oldSize) => {
  // Prevent running during initial setup OR if size didn't actually change
  if (isInitializing.value || newSize === oldSize) {
    // console.log(`Watcher skipped: isInitializing=${isInitializing.value}, newSize=${newSize}, oldSize=${oldSize}`);
    return
  }

  // Only run for manual changes AFTER initialization
  console.log(
    `Watcher triggered: Grid size changed from ${oldSize} to ${newSize}, re-initializing grid.`,
  )
  // Re-initialize the grid using the new size and the *already fetched* camera data
  initializeGrid(newSize, allCameras.value) // Call store action directly
})

// Watch for changes in the gridState (add/remove cameras) to save the layout (IDs)
watch(
  gridState,
  (newState, oldState) => {
    // Prevent saving during the very initial grid population if needed,
    // but usually okay to save immediately after load. Also prevent saving if state didn't actually change refs.
    if (!isInitializing.value && newState !== oldState) {
      console.log('Grid state changed, saving camera IDs to localStorage.')
      saveToLocalStorage() // Call store action
    }
  },
  { deep: true },
) // Deep watch is crucial here

// Cập nhật watcher để theo dõi hasActiveAlarms
watch(hasActiveAlarms, (newValue) => {
  if (newValue) {
    startAlarmAudio();
  } else {
    stopAlarmAudio();
  }
});


// Thêm watcher này vào script setup
watch(enableAlarms, (newValue) => {
  if (!newValue) {
    // Khi tắt alarm, clear tất cả và ẩn popup
    alarmList.value = [];
    selectedAlarms.value.clear();
    stopAlarmAudio();
    alarmPopupVisible.value = false;
    userHasHiddenPopup.value = false;
  }
});
</script>

<style scoped>
.grid>div {
  /* Ensure grid cells have a minimum height */
  min-height: 150px;
  /* Adjust as needed */
}

select {
  /* Custom select dropdown arrow style */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  /* Make space for the arrow */
}

.p-togglebutton {
  border: none !important;
  /* background: transparent !important; */
  padding: 0.25rem !important;
}

/*  */

.p-togglebutton.p-togglebutton-checked {
    background: none!important;
    border-color: var(--p-togglebutton-checked-border-color);
    color: var(--p-togglebutton-checked-color);
}

.p-dialog.p-component::-webkit-scrollbar {
  display: none; /* Chrome, Edge, Safari */
}
.p-dialog.p-component {
  min-width: 10rem !important; /* Đặt chiều rộng tối thiểu */
  min-height: 10rem !important; /* Đặt chiều cao tối thiểu */
}
button.p-togglebutton.p-component.p-togglebutton-checked.p-button-rounded.p-button-success .p-togglebutton-checked .p-togglebutton-content {
    background: var(--p-togglebutton-content-checked-background);
    background: #4B4DF6!important;
}
.p-button-success {
  background-color: #4B4DF6 !important;
  border: none !important;
  color: white;
  &:hover {
    background-color: #5275FF !important;
    color: white!important;
  }
}
.no-bg {
  background: transparent !important;
  border: none !important;
  padding: 0.5rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

button.p-3.rounded-full.transition-colors.duration-300.focus\:outline-none.focus\:ring-4.focus\:ring-opacity-50.bg-transparent.hover\:bg-white\/10.focus\:ring-gray-300 {
    padding: 4px;
    border-radius: 8px;
    &:focus {
      --tw-ring-shadow: NONE; 
    }
}
button.p-button.p-component.p-button-sm.p-button-sm {
    background-color: #4B5464;
    border: none;
    color: #fff;
    &:hover {
      background-color: #6B7181 !important;
      color: white!important;
    }
}
button.p-button.p-component.text-white.font-medium.px-4.py-2.rounded-lg.transition-colors.duration-300.hover\:brightness-110 {
    border: none;
    color: white;
}

button.p-button.p-component.text-white.font-medium.px-4.py-2.rounded-lg.transition-colors.duration-300.bg-gray-400.cursor-not-allowed {
    background-color: #4B5464;
    border: none;
}
span.p-button-label {
    color: white;
}
div[class*='max-h-']::-webkit-scrollbar {
  width: 6px;
}
div[class*='max-h-']::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
div[class*='max-h-']::-webkit-scrollbar-thumb {
  background-color: rgba(37, 99, 235, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Style for select arrow */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Custom checkbox styles (from original, ensure they are as intended) */
input[type='checkbox'].flex-shrink-0 {
  /* More specific selector for tag checkboxes */
  appearance: none;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0;
  display: inline-block;
  position: relative;
  transition: background-color 0.2s ease-in-out;
}
input[type='checkbox'].flex-shrink-0:checked {
  background-color: #2563eb; /* Tailwind blue-600 */
  border-color: #2563eb;
}
input[type='checkbox'].flex-shrink-0:checked::before {
  content: '✓';
  display: block;
  position: absolute;
  top: -2px;
  left: 1px; /* Adjust checkmark */
  font-size: 0.8em;
  color: white;
  line-height: 1;
}
input[type='checkbox'].flex-shrink-0:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  --tw-ring-color: #3b82f6; /* Tailwind blue-500 */
  box-shadow: 0 0 0 2px var(--tw-ring-color);
}

/* Ensure scrollbar for tag list is styled */
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