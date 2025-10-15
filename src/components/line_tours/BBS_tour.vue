<template>
  <div class="tour-wrapper relative">
    <!-- Video overlay -->
    <div id="videoScene" class="video-scene">

      <!-- WebRTC pano -->
      <webrtcStreamCard
        v-show="isRtspMode && currentRtspHotspot"
        :key="currentRtspHotspot?.rtspUrl || 'default'"
        :camera="{ id: 'rtsp', panorama: true }"
        :url="rtsp_url"
        class="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
        :pano="1"
        :hotspots="stream_hotspot"
        @hotspotclicked="handleHotspotClickFromStream"
      />
    </div>

    <!-- Loading config indicator -->
    <div id="loading-config" class="loading-config" v-show="showLoading">
      <div class="spinner"></div>
      <p>Loading configuration...</p>
    </div>

    <!-- Sidebar Toggle Button -->
    <button 
      class="sidebar-toggle-namdeptrai" 
      @click="toggleSidebar"
      :class="{ 'sidebar-open': isSidebarOpen }"
    >
      <span class="toggle-icon">{{ isSidebarOpen ? '›' : '‹' }}</span>
    </button>

    <!-- Mini Map Sidebar -->
    <div class="map-sidebar" :class="{ 'sidebar-open': isSidebarOpen-namdeptrai }">
      <div class="sidebar-header">
        <h3>BBS Route Map</h3>
        
        <!-- Bọc thẻ select trong một div container -->
        <div class="select-container">
          <select 
            v-model="selectedMapId" 
            @change="handleMapChange"
            class="floor-selector"
          >
            <option 
              v-for="(map, mapId) in availableMaps" 
              :key="mapId" 
              :value="mapId"
            >
              {{ map.name }}
            </option>
          </select>
        </div>

      </div>
      <div class="sidebar-content">
        <MiniMap
          :current-scene-id="currentSceneId"
          :visited-scenes="visitedScenes"
          :scenes-config="scenesConfig"
          @jump-to-scene="handleJumpToScene"
          ref="miniMapRef"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import webrtcStreamCard from '../stream/webrtcStreamCard.vue'
import MiniMap from '../map/BBS_mini-map.vue'

// Reactive variables
let scenesConfig = null
const rtsp_url = ref('')
const stream_hotspot = ref([])

// pano settings
const isRtspMode = ref(false)
const currentRtspHotspot = ref(null)

const showLoading = ref(false)

// Scene tracking for mini-map
const currentSceneId = ref('scene001')
const visitedScenes = ref([])

// Sidebar state
const isSidebarOpen = ref(true)

// Floor selector
const selectedMapId = ref('map1')
const availableMaps = ref({})

// Component refs
const miniMapRef = ref(null)

// Toggle sidebar
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Handle map change from selector
function handleMapChange() {
  if (miniMapRef.value) {
    miniMapRef.value.switchToMap(selectedMapId.value)
  }
}

// Handler for mini-map jump to scene
function handleJumpToScene(sceneId) {
  if (scenesConfig?.scenes[sceneId]) {
    console.log('Jumping to scene from minimap:', sceneId)
    updateCurrentScene(sceneId)
    
    // Tìm và hiển thị stream/video tương ứng với scene
    const scene = scenesConfig.scenes[sceneId]
    if (scene) {
      // Tìm hotspot có rtspUrl trong scene
      const streamHotspot = scene.hotSpots?.find(h => 
        h.rtspUrl
      )
      
      if (streamHotspot) {
        console.log('Found stream hotspot for scene:', sceneId, streamHotspot)
        showVideoScene(streamHotspot)
      } else {
        console.log('No stream hotspot found for scene:', sceneId)
        // Nếu không có hotspot stream, reset về trạng thái rỗng
        resetVideoStates()
      }
    }
  }
}

function updateCurrentScene(sceneId) {
  currentSceneId.value = sceneId

  if (!visitedScenes.value.includes(sceneId)) {
    visitedScenes.value.push(sceneId)
  }

  // Update mini-map
  if (miniMapRef.value) {
    miniMapRef.value.updateCurrentMap(sceneId)
  }
}

async function loadConfiguration() {
  showLoading.value = true

  try {
    const configUrl = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/BBS-B08.json`
    const response = await fetch(configUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    scenesConfig = await response.json()
    console.log('Configuration loaded successfully:', scenesConfig)

    // Load available maps từ scene markers
    await loadAvailableMaps()

    // Sau khi load config, tự động hiển thị scene đầu tiên
    const firstScene = scenesConfig.default?.firstScene || 'scene001'
    handleJumpToScene(firstScene)

    showLoading.value = false
  } catch (error) {
    console.error('Error loading configuration:', error)
    showLoading.value = false
  }
}

async function loadAvailableMaps() {
  try {
    const markersUrl = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/BBS-scene-markers.json`
    const response = await fetch(markersUrl)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    
    if (data.maps) {
      availableMaps.value = data.maps
      // Set default selected map
      if (!selectedMapId.value && Object.keys(data.maps).length > 0) {
        selectedMapId.value = Object.keys(data.maps)[0]
      }
    }
  } catch (error) {
    console.error('Error loading maps:', error)
  }
}

function showVideoScene(hotspot) {
  const videoScene = document.getElementById('videoScene')
  if (!videoScene) return

  // Reset tất cả states trước khi set state mới
  resetVideoStates()

  // Set new state based on hotspot
  if (hotspot.videoType === 'rtsp' && hotspot.rtspUrl && !/\.[^/]+$/.test(hotspot.rtspUrl)) {
    rtsp_url.value = hotspot.rtspUrl + '/whep'
    if (hotspot.hotSpots?.length > 0) {
      stream_hotspot.value = hotspot.hotSpots
    }
    isRtspMode.value = true
    currentRtspHotspot.value = hotspot
    console.log('RTSP mode activated:', hotspot)
  }

  videoScene.style.display = 'flex'
  setTimeout(() => {
    videoScene.style.opacity = '1'
  }, 50)
}

function resetVideoStates() {
  isRtspMode.value = false
  currentRtspHotspot.value = null
  stream_hotspot.value = []
}

// Watch để cleanup resources khi chuyển scene
watch(isRtspMode, (newRtsp, oldRtsp) => {
  // Cleanup RTSP cũ
  if (oldRtsp && !newRtsp) {
    // Component sẽ tự unmount do v-show và key
  }
})

onMounted(async () => {
  loadConfiguration()
})

const handleHotspotClickFromStream = (hotspot) => {
  console.log('Stream hotspot clicked:', hotspot)

  if (hotspot.rtspUrl) {
    console.log('RTSP hotspot clicked from stream')
    showVideoScene(hotspot)
  } else {
    console.log('Unknown hotspot action from stream:', hotspot)
  }
}
</script>

<style scoped>
.tour-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading-config {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

#videoScene {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #000;
}

/* Sidebar styles */
.sidebar-toggle {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 80px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.95), rgba(21, 101, 192, 0.95));
  border: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, rgba(21, 101, 192, 0.95), rgba(13, 71, 161, 0.95));
  width: 45px;
}

.sidebar-toggle.sidebar-open {
  right: 500px;
}

.toggle-icon {
  color: white;
  font-size: 24px;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.map-sidebar {
  position: absolute;
  top: 0;
  right: -500px;
  width: 500px;
  height: 100%;
  background: linear-gradient(270deg, rgb(98 98 226 / 43%), rgb(146 146 186 / 13%));
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
  z-index: 10;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.map-sidebar.sidebar-open {
  right: 0;
}

.sidebar-header {
  padding: 5px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.sidebar-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* Thêm container để định vị mũi tên */
.select-container {
  position: relative;
  display: inline-block; /* Giúp container chỉ chiếm độ rộng cần thiết */
}

.floor-selector {
  padding: 4px 8px; /* Giữ padding bên phải để có không gian cho mũi tên */
  background: #578AE6;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  min-width: 85px;
  appearance: none; /* Bắt buộc phải có để ẩn mũi tên mặc định của trình duyệt */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.3px;
}

/* Tạo mũi tên mới bằng pseudo-element ::after */
.select-container::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 12px; /* Vị trí của mũi tên */
  transform: translateY(-50%);
  width: 0;
  height: 0;
  /* Tạo hình tam giác bằng border */
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid white; /* Đây là phần sẽ hiển thị */
  pointer-events: none; /* Cho phép click xuyên qua mũi tên để mở select box */
  transition: all 0.3s ease;
}

/* (Tùy chọn) Thêm hiệu ứng xoay mũi tên khi select box được mở */
.select-container:focus-within::after {
    transform: translateY(-50%) rotate(180deg);
}

.floor-selector:hover {
  box-shadow: 0 4px 12px rgba(74, 111, 165, 0.4);
}

.floor-selector:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.floor-selector option {
  background: #2d3e5f;
  color: white;
  padding: 10px;
  font-weight: 500;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Scrollbar styling */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(33, 150, 243, 0.5);
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(33, 150, 243, 0.7);
}

</style>

<style>
/* Global styles for Pannellum hotspots */
.pnlm-hotspot-base {
  cursor: pointer;
}

.link-hotspot {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgb(255 255 255 / 22%);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  position: absolute;
}

.link-hotspot:hover {
  transform: scale(1.3);
}

.link-hotspot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s ease;
}

.link-hotspot:hover::before {
  width: 100%;
  height: 100%;
  animation: ripple 0.6s ease-out;
}

.link-hotspot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 20px;
  background: white;
  clip-path: polygon(50% 0, 0 100%, 20% 100%, 50% 40%, 80% 100%, 100% 100%);
  pointer-events: none;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
</style>