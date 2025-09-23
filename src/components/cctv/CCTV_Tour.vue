<template>
  <div class="tour-wrapper">
    <!-- Debug info -->
    <div v-if="debugInfo" class="debug-info">
      <p>Pannellum loaded: {{ pannellumLoaded }}</p>
      <p>Config loaded: {{ !!scenesConfig }}</p>
      <p>Viewer initialized: {{ !!viewer }}</p>
      <button @click="toggleDebug">Hide Debug</button>
      <button @click="forceInit">Force Init</button>
    </div>
    <div v-else class="debug-toggle">
      <!-- <button @click="toggleDebug">Show Debug</button> -->
    </div>

    <!-- Minimap Toggle Button -->
    <div class="minimap-toggle" @click="toggleMinimap">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3M10,5.47L14,6.87V18.53L10,17.13V5.47M5,6.46L8,5.45V17.15L5,18.31V6.46M16,18.55L19,17.54V5.84L16,6.87V18.55Z"
        />
      </svg>
      Map
    </div>

    <!-- Minimap Container -->
    <div v-show="minimapVisible" class="minimap-container" :class="{ expanded: minimapExpanded }">
      <div class="minimap-header">
        <span>Floor Plan: B08-1F</span>
        <div class="minimap-controls">
          <button @click="toggleMinimapSize" class="expand-btn">
            {{ minimapExpanded ? '−' : '+' }}
          </button>
          <button @click="closeMinimap" class="close-btn">×</button>
        </div>
      </div>

      <div class="minimap-content" ref="minimapContainer">
        <img
          :src="mapImageUrl"
          alt="Floor Plan"
          class="minimap-image"
          @load="onMapImageLoaded"
          @click="onMapClick"
        />

        <!-- Scene Markers -->
        <div
          v-for="(scene, sceneId) in sceneMarkers"
          :key="sceneId"
          v-show="shouldShowMarker(sceneId)"
          :class="[
            'scene-marker',
            { active: currentSceneId === sceneId },
            { visited: visitedScenes.includes(sceneId) },
          ]"
          :style="{
            left: scene.x + '%',
            top: scene.y + '%',
          }"
          @click="jumpToScene(sceneId)"
          :title="getSceneTitle(sceneId)"
        >
          <div class="marker-dot"></div>
          <div class="marker-label">{{ scene.label || sceneId }}</div>
        </div>

        <!-- Current Position Indicator -->
        <div
          v-if="currentSceneMarker"
          class="current-position"
          :style="{
            left: currentSceneMarker.x + '%',
            top: currentSceneMarker.y + '%',
          }"
        >
          <div class="position-ring"></div>
        </div>
      </div>
    </div>

    <!-- Panorama viewer -->
    <div id="panorama" class="panorama-container"></div>

    <!-- Loading config indicator -->
    <div id="loading-config" class="loading-config" v-show="showLoading">
      <div class="spinner"></div>
      <p>Loading configuration...</p>
    </div>

    <!-- Transition effects -->
    <div id="transition-overlay" class="transition-overlay"></div>
    <div id="loading-indicator" class="loading-indicator">
      <div class="spinner"></div>
    </div>

    <!-- Scene info -->
    <div id="scene-info" class="scene-info">Loading...</div>

    <!-- Video overlay -->
    <div id="videoScene" class="video-scene">
      <!-- WebRTC pano -->
      <webrtcStreamCard
        v-if="isRtspMode && currentRtspHotspot"
        :key="currentRtspHotspot.rtspUrl"
        :camera="{ id: 'rtsp', panorama: true }"
        :url="rtsp_url"
        class="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
        :pano="1"
      />

      <!-- Video element thay vì iframe -->
      <video
        v-else-if="currentVideoUrl && !isGridMode"
        id="videoPlayer"
        class="video-player"
        controls
        autoplay
        :src="currentVideoUrl"
        @error="handleVideoError"
      >
        Your browser does not support the video tag.
      </video>

      <!-- Grid container for multiple videos or web pages -->
      <div v-if="isGridMode" class="grid-container">
        <div v-for="(url, index) in gridUrls" :key="index" class="grid-wrapper">
          <!-- Video grid -->
          <video
            v-if="gridType === 'video'"
            :class="`grid-video grid-video-${index}`"
            controls
            :src="url || ''"
            @error="handleGridVideoError(index)"
            @loadstart="handleVideoLoadStart(index)"
          >
            Video not supported
          </video>

          <!-- Web grid (iframe) -->
          <iframe
            v-else
            :class="`grid-iframe grid-iframe-${index}`"
            :src="url || 'about:blank'"
            frameBorder="0"
            allowfullscreen
          >
          </iframe>
        </div>
      </div>

      <div id="videoBack" class="video-back" @click="closeVideo">← Back to Tour</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick, ref, computed } from 'vue'
import webrtcStreamCard from '../stream/webrtcStreamCard.vue'
import 'pannellum/build/pannellum.css'
import 'pannellum/build/pannellum.js'

let isTransitioning = false
let viewer = null
let scenesConfig = null
let firstLoad = false
const rtsp_url = ref('')

// Video state
const currentVideoUrl = ref('')
const isGridMode = ref(false)
const gridUrls = ref([])
const gridType = ref('video') // 'video' or 'web'

// pano settings
const isRtspMode = ref(false)
const currentRtspHotspot = ref(null)

// Reactive debug variables
const debugInfo = ref(false)
const pannellumLoaded = ref(false)
const showLoading = ref(false)

// Minimap state
const minimapVisible = ref(false)
const minimapExpanded = ref(false)
const currentSceneId = ref('scene001')
const visitedScenes = ref(['scene001'])
const mapImageUrl = ref('')

// Minimap configuration from JSON
const minimapConfig = ref({
  showAllMarkers: true,
  showVisitedMarkers: true,
  showActiveMarker: true,
  showUnvisitedMarkers: true
})

// Scene coordinates trên map (% từ top-left)
const sceneMarkers = ref({
  scene001: { x: 66.7, y: 25.4, label: 'Entrance' },
  scene002: { x: 63, y: 25.4, label: 'Walkway 1' },
  'scene003': { x: 63, y: 14, label: 'Walkway 2' },
  'scene004': { x: 58.25, y: 14, label: 'Walkway 3' },
  'scene005': { x: 53.5, y: 14, label: 'Walkway 4' },
  'scene006': { x: 48.75, y: 14, label: 'Walkway 5' },
  'scene007': { x: 44, y: 14, label: 'Walkway 6' },
  'scene008': { x: 39.25, y: 14, label: 'Walkway 7' },
  'scene009': { x: 34.5, y: 14, label: 'Walkway 8' },
  'scene010': { x: 29.75, y: 14, label: 'Walkway 9' },
  'scene011': { x: 25, y: 14, label: 'Walkway 10' },
  'scene012': { x: 20.25, y: 14, label: 'Walkway 11' },
  'scene013': { x: 15.5, y: 14, label: 'Walkway 12' },
  'scene014': { x: 10.75, y: 14, label: 'Walkway 13' },
  'scene015': { x: 6, y: 14, label: 'Walkway 14' },
  'scene016': { x: 4, y: 6.5, label: 'WarRoom' },
  'scene017': { x: 2, y: 14, label: 'Walkway 15' }
});

const currentSceneMarker = computed(() => {
  return sceneMarkers.value[currentSceneId.value]
})

// Method to determine if a marker should be shown
function shouldShowMarker(sceneId) {
  const isActive = currentSceneId.value === sceneId
  const isVisited = visitedScenes.value.includes(sceneId)
  const isUnvisited = !isVisited && !isActive
  
  // If showAllMarkers is true, show all markers
  if (minimapConfig.value.showAllMarkers) {
    return true
  }
  
  // Otherwise, check individual settings
  if (isActive && minimapConfig.value.showActiveMarker) {
    return true
  }
  
  if (isVisited && minimapConfig.value.showVisitedMarkers) {
    return true
  }
  
  if (isUnvisited && minimapConfig.value.showUnvisitedMarkers) {
    return true
  }
  
  return false
}

function toggleDebug() {
  debugInfo.value = !debugInfo.value
}

// Minimap methods
function toggleMinimap() {
  minimapVisible.value = !minimapVisible.value
  if (minimapVisible.value && !mapImageUrl.value) {
    loadMapImage()
  }
}

function toggleMinimapSize() {
  minimapExpanded.value = !minimapExpanded.value
}

function closeMinimap() {
  minimapVisible.value = false
}

function loadMapImage() {
  mapImageUrl.value = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/3f_template_img/map.png`
}

function onMapImageLoaded() {
  console.log('Map image loaded successfully')
}

function onMapClick(event) {
  // Optional: Allow clicking on empty areas of map for debugging coordinates
  const rect = event.target.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  console.log('Clicked map at coordinates:', { x: x.toFixed(1), y: y.toFixed(1) })
}

function jumpToScene(sceneId) {
  if (viewer && scenesConfig?.scenes[sceneId]) {
    console.log('Jumping to scene from minimap:', sceneId)
    const marker = sceneMarkers.value[sceneId]
    console.log('Scene coordinates:', { x: marker.x, y: marker.y })
    streetViewTransition(sceneId)
  }
}

function updateCurrentScene(sceneId) {
  currentSceneId.value = sceneId
  if (!visitedScenes.value.includes(sceneId)) {
    visitedScenes.value.push(sceneId)
  }
  console.log('Updated current scene to:', sceneId, 'Visited:', visitedScenes.value)
}

function getSceneTitle(sceneId) {
  return scenesConfig?.sceneInfo?.[sceneId] || sceneId
}

// Video error handlers
function handleVideoError(event) {
  console.error('Video error:', event.target.error)
  console.error('Failed to load video:', currentVideoUrl.value)
}

function handleGridVideoError(index) {
  console.error(`Grid video ${index} error:`, gridUrls.value[index])
}

function handleVideoLoadStart(index) {
  console.log(`Grid video ${index} started loading:`, gridUrls.value[index])
}

async function loadConfiguration() {
  showLoading.value = true

  try {
    const configUrl = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/B08-3F.json`
    const response = await fetch(configUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    scenesConfig = await response.json()
    console.log('Configuration loaded successfully:', scenesConfig)

    // Load minimap configuration from JSON
    if (scenesConfig.minimap) {
      minimapConfig.value = { ...minimapConfig.value, ...scenesConfig.minimap }
      console.log('Minimap config loaded:', minimapConfig.value)
    }

    // Process the panorama URLs to use full paths
    for (const sceneId in scenesConfig.scenes) {
      const scene = scenesConfig.scenes[sceneId]
      if (scene.panorama && !scene.panorama.startsWith('http')) {
        const oldPanorama = scene.panorama
        console.log(`Updated panorama URL for ${sceneId}: ${oldPanorama} -> ${scene.panorama}`)
      }
    }

    processHotspots()
    await initializePanorama()

    showLoading.value = false
  } catch (error) {
    console.error('Error loading configuration:', error)
    showLoading.value = false
    console.log('Falling back to default config...')
  }
}

async function forceInit() {
  console.log('Force initializing...')
  if (typeof window.pannellum !== 'undefined') {
    pannellumLoaded.value = true
    await loadConfiguration()
  } else {
    console.error('Pannellum still not loaded')
  }
}

function processHotspots() {
  for (const sceneId in scenesConfig.scenes) {
    const scene = scenesConfig.scenes[sceneId]
    if (scene.hotSpots) {
      scene.hotSpots.forEach((hotspot) => {
        if (hotspot.targetScene) {
          hotspot.clickHandlerFunc = function () {
            streetViewTransition(hotspot.targetScene, hotspot)
          }
        } else if (hotspot.action === 'video') {
          hotspot.clickHandlerFunc = function () {
            showVideoScene(hotspot)
          }
        } else if (hotspot.action === 'grid') {
          hotspot.clickHandlerFunc = function () {
            showVideoScene({ ...hotspot, action: 'webgrid' })
          }
        }
      })
    }
  }
}

async function initializePanorama() {
  if (!scenesConfig) {
    console.error('No configuration available')
    return
  }

  if (typeof window.pannellum === 'undefined') {
    console.error('Pannellum not loaded')
    return
  }

  const config = {
    default: scenesConfig.default,
    scenes: scenesConfig.scenes,
  }

  try {
    const panoramaEl = document.getElementById('panorama')
    if (!panoramaEl) {
      console.error('Panorama element not found')
      return
    }

    viewer = window.pannellum.viewer('panorama', config)
    console.log('Pannellum viewer created:', viewer)

    viewer.on('scenechange', (scene_id) => {
      console.log('Scene changed to:', scene_id)
      updateCurrentScene(scene_id) // Update minimap
      setTimeout(() => updateSceneInfo(scene_id), 500)
    })

    viewer.on('load', () => {
      if (firstLoad) return
      setTimeout(() => {
        updateSceneInfo(scenesConfig.default.firstScene)
        updateCurrentScene(scenesConfig.default.firstScene) // Initialize minimap
      }, 500)
      firstLoad = true
    })

    viewer.on('error', (error) => {
      console.error('Pannellum error:', error)
    })

    // Debug mouse events (optional)
    viewer.on('mousedown', (event) => {
      const canvas = document.querySelector('#panorama canvas')
      if (canvas && event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        const coords = viewer.mouseEventToCoords(event)
        if (coords && coords.length >= 2) {
          console.log('Clicked coordinates:')
          console.log('  pitch:', coords[0])
          console.log('  yaw:', coords[1])
          console.log('Current camera position:')
          console.log('  pitch:', viewer.getPitch())
          console.log('  yaw:', viewer.getYaw())
          console.log('  hfov:', viewer.getHfov())
        }
      }
    })
  } catch (error) {
    console.error('Error initializing panorama:', error)
  }
}

function updateSceneInfo(sceneId) {
  const infoElement = document.getElementById('scene-info')
  if (infoElement) {
    const sceneTitle = scenesConfig?.sceneInfo?.[sceneId] || sceneId
    infoElement.textContent = sceneTitle
    setTimeout(() => infoElement.classList.add('show'), 500)
  }
}

function hideSceneInfo() {
  const infoElement = document.getElementById('scene-info')
  if (infoElement) {
    infoElement.classList.remove('show')
  }
}

function streetViewTransition(sceneId, hotspot) {
  if (isTransitioning || !viewer) return
  isTransitioning = true

  hideSceneInfo()
  const overlay = document.getElementById('transition-overlay')
  const loader = document.getElementById('loading-indicator')

  if (hotspot) {
    console.log('Hotspot coords:', hotspot.pitch, hotspot.yaw)

    viewer.lookAt(hotspot.pitch, hotspot.yaw, viewer.getHfov(), 300)

    setTimeout(() => {
      viewer.lookAt(hotspot.pitch, hotspot.yaw, 30, 500)
    }, 300)

    setTimeout(() => {
      if (overlay) overlay.classList.add('active')
      if (loader) loader.classList.add('active')
    }, 800)
  } else {
    if (overlay) overlay.classList.add('active')
    if (loader) loader.classList.add('active')
  }

  setTimeout(() => {
    const targetScene = scenesConfig.scenes[sceneId]
    const targetYaw = hotspot?.targetYaw || targetScene?.yaw || viewer.getYaw()
    const targetPitch = hotspot?.targetPitch || targetScene?.pitch || viewer.getPitch()

    console.log('Loading scene with angles:', { targetPitch, targetYaw })

    viewer.loadScene(sceneId, targetPitch, targetYaw, 100, {
      transitionDuration: 600,
    })

    // Minimap sẽ tự update qua event listener "scenechange"
  }, 700)

  setTimeout(() => {
    if (overlay) overlay.classList.remove('active')
    if (loader) loader.classList.remove('active')
    updateSceneInfo(sceneId)
    isTransitioning = false
  }, 800)
}

function showVideoScene(hotspot) {
  const videoScene = document.getElementById('videoScene')

  if (!videoScene) return

  // Reset states
  isRtspMode.value = false
  currentRtspHotspot.value = null
  currentVideoUrl.value = ''
  isGridMode.value = false
  gridUrls.value = []
  gridType.value = 'video'

  if (hotspot && hotspot.action === 'grid') {
    isGridMode.value = true
    gridUrls.value = hotspot.urls || hotspot.gridUrls || Array(9).fill('')
    gridType.value = hotspot.gridType === 'web' ? 'web' : 'video'
    console.log(`Grid mode activated (${gridType.value}) with URLs:`, gridUrls.value)
  } else if (hotspot && hotspot.action === 'webgrid') {
    isGridMode.value = true
    gridUrls.value = hotspot.urls || hotspot.gridUrls || Array(9).fill('')
    gridType.value = 'web'
    console.log('Web grid mode activated with URLs:', gridUrls.value)
  } else if (
    hotspot &&
    hotspot.videoType === 'rtsp' &&
    hotspot.rtspUrl &&
    !/\.[^/]+$/.test(hotspot.rtspUrl)
  ) {
    console.log('RTSP hotspot:', hotspot)
    rtsp_url.value = hotspot.rtspUrl + '/whep'
    isRtspMode.value = true
    currentRtspHotspot.value = hotspot
  } else {
    const videoUrl =
      hotspot?.videoUrl || hotspot?.rtspUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'
    currentVideoUrl.value = videoUrl
    console.log('Video mode activated with URL:', videoUrl)
  }

  // Show video scene
  videoScene.style.display = 'flex'
  setTimeout(() => {
    videoScene.style.opacity = '1'
  }, 50)
}

function closeVideo() {
  const videoScene = document.getElementById('videoScene')
  const panorama = document.getElementById('panorama')

  // Reset all video states
  isRtspMode.value = false
  currentRtspHotspot.value = null
  currentVideoUrl.value = ''
  isGridMode.value = false
  gridUrls.value = []
  gridType.value = 'video'

  // Hide video scene with transition
  if (videoScene) videoScene.style.opacity = '0'

  setTimeout(() => {
    if (videoScene) videoScene.style.display = 'none'
    if (panorama && viewer) {
      viewer.lookAt(viewer.getPitch(), viewer.getYaw(), viewer.getHfov(), 0)
    }
  }, 300)
}

onMounted(async () => {
  await nextTick()

  let attempts = 0
  const maxAttempts = 50

  const checkPannellum = () => {
    attempts++

    if (typeof window.pannellum !== 'undefined') {
      console.log('Pannellum found!')
      pannellumLoaded.value = true
      loadConfiguration()
    } else if (attempts < maxAttempts) {
      console.log('Pannellum not found, retrying...')
      setTimeout(checkPannellum, 100)
    } else {
      console.error(
        'Pannellum library not loaded after 5 seconds. Make sure to include it in your index.html',
      )
      pannellumLoaded.value = false
    }
  }

  checkPannellum()
})
</script>

<style scoped>
.tour-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.debug-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 10001;
  font-size: 12px;
}

.debug-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10001;
}

.debug-info button,
.debug-toggle button {
  margin: 2px;
  padding: 4px 8px;
  font-size: 11px;
}

.panorama-container {
  width: 100%;
  height: 100%;
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

.transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  opacity: 0;
  visibility: hidden;
  transition: all 0.6s ease;
  z-index: 1000;
}

.transition-overlay.active {
  opacity: 1;
  visibility: visible;
}

.loading-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.loading-indicator.active {
  opacity: 1;
  visibility: visible;
}

.scene-info {
  position: fixed;
  bottom: 30px;
  left: 260px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.5s ease;
  z-index: 100;
}

.scene-info.show {
  opacity: 1;
  transform: translateY(0);
}

#videoScene {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgb(166 166 166 / 0%), rgb(96 52 52 / 0%));
  z-index: 9999;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
}

.video-iframe {
  width: 100%;
  height: calc(100% - 60px);
  border: none;
  display: none;
}

.video-back {
  position: absolute;
  top: 30px;
  right: 30px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(21, 101, 192, 0.9));
  color: white;
  border-radius: 25px;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.video-back:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, rgba(21, 101, 192, 0.9), rgba(13, 71, 161, 0.9));
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.5);
}

.video-scene {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1000;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.video-player {
  max-width: 90%;
  max-height: 80%;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
}

/* Grid styles */
:deep(.grid-container) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  width: 86%;
  height: 100%;
  /* background: #000; */
  margin: 0 auto;
  transform: translateY(0);
  scale: 0.8;
}

:deep(.grid-wrapper) {
  position: relative;
  overflow: hidden;
}

:deep(.grid-iframe) {
  width: 1280px;
  height: 800px;
  transform: scale(0.375); /* từ 0.25 (nhỏ) -> 0.375 (vừa) -> 0.5 (to) */
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
  border: none;
}

/* Global hotspot styles - these need to be global to work with Pannellum */
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
  /* background: radial-gradient(circle, rgba(152, 160, 167, 0.8) 0%, rgba(148, 155, 160, 0.6) 70%, transparent 100%); */
  background: rgb(255 255 255 / 22%);
  /* border: 3px solid rgba(255, 255, 255, 0.9); */
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  position: absolute;
}

.link-hotspot:hover {
  transform: scale(1.3);
  /* background: radial-gradient(circle, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.7) 70%, transparent 100%); */
  /* border-color: rgba(255, 255, 255, 1); */
  /* box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6); */
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
  height: 20px; /* thấp hơn để mũi tên bẹt */
  background: white;
  clip-path: polygon(50% 0, 0 100%, 20% 100%, 50% 40%, 80% 100%, 100% 100%);
  pointer-events: none;
}

.video-hotspot {
  width: 40px;
  height: 40px;
  background: rgba(255, 0, 0, 0.8);
  border: 3px solid #ff4444;
  border-radius: 8px;
  /* transition: all 0.3s ease; */
}

.video-hotspot:hover {
  background: #ff4444;
  transform: scale(1.2);
}

.video-hotspot::before {
  content: '▶';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 16px;
  font-weight: bold;
}

#panorama {
  width: 100%;
  height: 100%;
}

/* Hide Pannellum's default loading box */
.pnlm-load-box {
  display: none !important;
}

:deep(#videoBack) {
  position: absolute;
  top: 30px;
  right: 30px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(21, 101, 192, 0.9));
  color: white;
  border-radius: 25px;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* Minimap Toggle Button */
.minimap-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  user-select: none;
}

.minimap-toggle:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

/* Minimap Container */
.minimap-container {
  position: fixed;
  top: 80px;
  left: 20px;
  background: rgba(0, 0, 0, 0.9);
  /* border-radius: 12px; */
  /* border: 2px solid rgba(255, 255, 255, 0.2); */
  z-index: 10;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  width: 27%;
  max-height: fit-content;
  animation: slideInLeft 0.3s ease-out;
}

.minimap-container.expanded {
  width: 63%;
  /* max-height: 500px; */
  user-select: none;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Minimap Header */
.minimap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

.minimap-controls {
  display: flex;
  gap: 8px;
}

.minimap-controls button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.minimap-controls button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Minimap Content */
.minimap-content {
  position: relative;
  /* padding: 16px; */
  height: fit-content;
  overflow: hidden;
}

.minimap-image {
  width: 100%;
  height: auto;
  object-fit: unset;
  /* border-radius: 8px; */
  cursor: crosshair;
}

/* Scene Markers */
.scene-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.scene-marker .marker-dot {
  width: 12px;
  height: 12px;
  background: rgb(164 243 33);
  border: 2px solid white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.scene-marker.visited .marker-dot {
  background: rgba(76, 175, 80, 0.8);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.scene-marker.active .marker-dot {
  background: rgb(30 17 208 / 83%);
  box-shadow: 0 3px 12px rgba(255, 193, 7, 0.6);
  width: 18px;
  height: 18px;
  border-width: 3px;
}

.scene-marker:hover .marker-dot {
  transform: scale(1.3);
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.8);
}

.scene-marker.active:hover .marker-dot {
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.8);
}

/* Marker Labels */
.marker-label {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  backdrop-filter: blur(2px);
}

.scene-marker:hover .marker-label,
.scene-marker.active .marker-label {
  opacity: 1;
}

/* Current Position Indicator */
.current-position {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 15;
  pointer-events: none;
}

.position-ring {
  width: 30px;
  height: 30px;
  border: 3px solid rgb(53 48 214 / 49%);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
/* 
.minimap-content .scene-marker {
  display: none;
}

.minimap-content .scene-marker.active {
  display: block;
} */
</style>
