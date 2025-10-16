<!-- BBS_tour.vue -->
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
        :initrotate="shouldAutoRotate"
        @autorotatehotspotfinished="handleAutoRotateFinished"
        @capture="handleCaptureFrame"
        :capture="capture_signal"
        ref="webrtcStreamRef"
      />
    </div>

    <!-- Loading config indicator -->
    <div id="loading-config" class="loading-config" v-show="showLoading">
      <div class="spinner"></div>
      <p>Loading configuration...</p>
    </div>

    <!-- Sidebar Toggle Button -->
    <button 
      class="sidebar-toggle" 
      @click="toggleSidebar"
      :class="{ 'sidebar-open': isSidebarOpen }"
    >
      <span class="toggle-icon">{{ isSidebarOpen ? '›' : '‹' }}</span>
    </button>

    <!-- Mini Map Sidebar -->
    <div class="map-sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-header">
        <h3>BBS Route Map</h3>
        
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

    <!-- Control Buttons (Bottom Left) -->
    <div class="absolute bottom-6 left-6 z-20 flex gap-3">
      <!-- Start/Stop Button -->
      <button 
        @click="toggleAutoSequence"
        class="px-6 py-2.5 cursor-pointer rounded-lg font-semibold text-white shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
        :class="isAutoSequenceRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
      >
        {{ isAutoSequenceRunning ? 'Stop' : 'Start' }}
      </button>

      <!-- Capture Button -->
      <button 
        @click="handleCapture"
        :disabled="!currentRtspHotspot"
        class="px-6 py-2.5 cursor-pointer rounded-lg font-semibold text-white shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        :class="currentRtspHotspot ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-600'"
      >
        Capture
      </button>
    </div>

    <!-- Capture Error Form -->
    <CaptureErrorForm
      :is-visible="showCaptureForm"
      :captured-image="capture_frame"
      :location="currentSceneLocation"
      :owner="currentSceneOwner"
      @close="closeCaptureForm"
      @save="handleSaveCapture"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import webrtcStreamCard from '../stream/webrtcStreamCard.vue'
import MiniMap from '../map/BBS_mini-map.vue'
import CaptureErrorForm from './CaptureErrorForm.vue'

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
const isSidebarOpen = ref(false)

// Floor selector
const selectedMapId = ref('map1')
const availableMaps = ref({})

// Component refs
const miniMapRef = ref(null)
const webrtcStreamRef = ref(null)

// Capture state
const capture_signal = ref(false)
const capture_frame = ref(null)
const showCaptureForm = ref(false)

// Auto sequence state
const isAutoSequenceRunning = ref(false)
const shouldAutoRotate = ref(false)
const currentStreamIndex = ref(0)
const allRtspStreams = ref([])

// Current scene info for capture form
const currentSceneLocation = ref('')
const currentSceneOwner = ref('')

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
    
    const scene = scenesConfig.scenes[sceneId]
    if (scene) {
      const streamHotspot = scene.hotSpots?.find(h => h.rtspUrl)
      
      if (streamHotspot) {
        console.log('Found stream hotspot for scene:', sceneId, streamHotspot)
        showVideoScene(streamHotspot, scene)
      } else {
        console.log('No stream hotspot found for scene:', sceneId)
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

    // Extract all RTSP streams from configuration
    extractAllRtspStreams()

    await loadAvailableMaps()

    const firstScene = scenesConfig.default?.firstScene || 'scene001'
    handleJumpToScene(firstScene)

    showLoading.value = false
  } catch (error) {
    console.error('Error loading configuration:', error)
    showLoading.value = false
  }
}

function extractAllRtspStreams() {
  allRtspStreams.value = []
  
  if (!scenesConfig?.scenes) return

  for (const [sceneId, scene] of Object.entries(scenesConfig.scenes)) {
    if (scene.hotSpots) {
      const rtspHotspots = scene.hotSpots.filter(h => 
        h.rtspUrl && h.videoType === 'rtsp'
      )
      
      rtspHotspots.forEach(hotspot => {
        allRtspStreams.value.push({
          sceneId,
          hotspot,
          scene
        })
      })
    }
  }
  
  console.log('Found RTSP streams:', allRtspStreams.value.length)
}

async function loadAvailableMaps() {
  try {
    const markersUrl = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/BBS-scene-markers.json`
    const response = await fetch(markersUrl)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    
    if (data.maps) {
      availableMaps.value = data.maps
      if (!selectedMapId.value && Object.keys(data.maps).length > 0) {
        selectedMapId.value = Object.keys(data.maps)[0]
      }
    }
  } catch (error) {
    console.error('Error loading maps:', error)
  }
}

function showVideoScene(hotspot, scene) {
  const videoScene = document.getElementById('videoScene')
  if (!videoScene) return

  resetVideoStates()

  if (hotspot.videoType === 'rtsp' && hotspot.rtspUrl && !/\.[^/]+$/.test(hotspot.rtspUrl)) {
    rtsp_url.value = hotspot.rtspUrl + '/whep'
    if (hotspot.hotSpots?.length > 0) {
      stream_hotspot.value = hotspot.hotSpots
    }
    isRtspMode.value = true
    currentRtspHotspot.value = hotspot
    
    // Update current scene info
    currentSceneLocation.value = scene?.location || ''
    currentSceneOwner.value = scene?.owner || ''
    
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
  currentSceneLocation.value = ''
  currentSceneOwner.value = ''
}

// Auto sequence functions
function toggleAutoSequence() {
  if (isAutoSequenceRunning.value) {
    stopAutoSequence()
  } else {
    startAutoSequence()
  }
}

function startAutoSequence() {
  if (allRtspStreams.value.length === 0) {
    alert('No RTSP streams found in configuration')
    return
  }

  isAutoSequenceRunning.value = true
  currentStreamIndex.value = 0
  playNextStream()
}

function stopAutoSequence() {
  isAutoSequenceRunning.value = false
  shouldAutoRotate.value = false
  currentStreamIndex.value = 0
}

function playNextStream() {
  if (!isAutoSequenceRunning.value) return
  
  if (currentStreamIndex.value >= allRtspStreams.value.length) {
    // Loop back to start
    currentStreamIndex.value = 0
  }

  const streamData = allRtspStreams.value[currentStreamIndex.value]
  
  // Update scene
  updateCurrentScene(streamData.sceneId)
  
  // Show video scene with auto rotate enabled
  shouldAutoRotate.value = true
  showVideoScene(streamData.hotspot, streamData.scene)
  
  console.log(`Playing stream ${currentStreamIndex.value + 1}/${allRtspStreams.value.length}:`, streamData.sceneId)
}

function handleAutoRotateFinished() {
  console.log('Auto rotate finished for current stream')
  
  if (!isAutoSequenceRunning.value) {
    shouldAutoRotate.value = false
    return
  }

  // Move to next stream
  currentStreamIndex.value++
  
  // Add a small delay before next stream
  setTimeout(() => {
    playNextStream()
  }, 1000)
}

// Capture functions
function handleCapture() {
  if (!currentRtspHotspot.value) {
    alert('No stream active to capture')
    return
  }
  
  capture_signal.value = true
}

function handleCaptureFrame(frame) {
  capture_frame.value = frame
  capture_signal.value = false
  showCaptureForm.value = true
}

function closeCaptureForm() {
  showCaptureForm.value = false
  capture_frame.value = null
}

function handleSaveCapture(result) {
  console.log('Capture saved successfully:', result)
  alert('Error report saved successfully!')
}

watch(isRtspMode, (newRtsp, oldRtsp) => {
  if (oldRtsp && !newRtsp) {
    // Component will auto unmount due to v-show and key
  }
})

onMounted(async () => {
  loadConfiguration()
})

const handleHotspotClickFromStream = (hotspot) => {
  console.log('Stream hotspot clicked:', hotspot)

  if (hotspot.rtspUrl) {
    console.log('RTSP hotspot clicked from stream')
    showVideoScene(hotspot, scenesConfig.scenes[currentSceneId.value])
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

.select-container {
  position: relative;
  display: inline-block;
}

.floor-selector {
  padding: 4px 8px;
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
  appearance: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.3px;
}

.select-container::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid white;
  pointer-events: none;
  transition: all 0.3s ease;
}

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