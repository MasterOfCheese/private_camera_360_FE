<template>
  <div class="h-full flex flex-col p-4 md:p-6 relative">
    <div class="flex justify-end mb-4 flex-shrink-0">
      <div
        class="flex items-center bg-gray-800/60 backdrop-blur-lg rounded-lg overflow-hidden border border-white/10 shadow-md p-1 space-x-1">
        <button v-for="layout in layouts" :key="layout.id" :class="[
          'p-1.5 rounded-md transition-colors duration-150',
          currentLayout === layout.id
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-400 hover:bg-white/10 hover:text-gray-100',
        ]" :title="`${layout.id} layout`" @click="setCurrentLayout(layout.id)">
          <component :is="layout.icon" class="w-5 h-5"
            :class="currentLayout === layout.id ? 'fill-blue-300' : 'fill-transparent'" />
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
        @click="handleSlotClick(item, index)" @deletecamera="handleDeleteCamera" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGridStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { fetchWrapper } from '@/helper'
import 'primeicons/primeicons.css'

// Import Icons and Child Components
import SingleLayout from '@/assets/icons/1.vue'
import quad from '@/assets/icons/4.vue'
import nine from '@/assets/icons/9.vue'
import CameraCard from '@/components/cctv/CCTV_CameraCard.vue'
import CameraChosingDrawer from '@/components/cctv/CCTV_CameraChosingDrawer.vue'

// =========================
const alarmSound = '/sounds/1140044.mp3';
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

async function checkTotalAlarmsAndPlay(apiUrls, audioUrl) {
  try {
    const responses = await Promise.all(
      apiUrls.map((url) =>
        fetch(url).then((res) => {
          if (!res.ok) throw new Error(`Failed: ${url}`);
          return res.json();
        })
      )
    );

    const totalAlarms = responses.reduce((sum, data) => {
      return sum + (data?.today?.alarms || 0);
    }, 0);

    if (
      previousTotalAlarms !== null &&
      totalAlarms > previousTotalAlarms
    ) {
      console.log('📢 Có cảnh báo mới:', totalAlarms);
      playSound(audioUrl);
    }

    previousTotalAlarms = totalAlarms;
  } catch (err) {
    console.error('Lỗi khi gọi API:', err);
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
  else if (count <= 6) gridLayoutClass = 'grid-cols-1 grid-rows-5'
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
    allCameras.value = response || []
    // console.log(`Fetched ${allCameras.value.length} cameras.`)
    // console.log('Error fetching cameras :::', response)
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
    layoutId = 'quad'
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
  console.log(`Found ${actualCameraCount} actual saved cameras in persisted state.`)
  console.log(`Determined initial config: size=${size}, layoutId=${layoutId}`)
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
  closeSettings()
}

const handleSlotClick = (item, index) => {
  // Open drawer if an empty slot is clicked
  if (item.status === 'empty') {
    targetGridIndex.value = index
    isDrawerVisible.value = true
  } else {
    // Optional: Handle click on filled slot (e.g., maximize?)
    // console.log('Clicked on filled slot:', item);
    startMonitoring(); // Gọi hàm giám sát
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
  console.log('Component Mounting...')
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

    // 5. Start timestamp updates
    updateLiveTimestamp()
    timestampInterval = setInterval(updateLiveTimestamp, 1000)

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
</style>
