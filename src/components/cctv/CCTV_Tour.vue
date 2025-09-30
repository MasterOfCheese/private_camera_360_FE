<template>
  <div class="tour-wrapper relative">
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

    <!-- Mini Map Component -->
    <MiniMap :current-scene-id="currentSceneId" :visited-scenes="visitedScenes" :scenes-config="scenesConfig"
      @jump-to-scene="handleJumpToScene" ref="miniMapRef" />

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

      <!-- Live Badge - hiển thị khi isRtspMode = true -->
      <div v-if="isRtspMode" class="live-badge">
        <span class="live-dot"></span>
        LIVE
      </div>

      <img v-if="currentImageUrl && !isGridMode && !isThumbnailMode && !singleIframeUrl && !isSwiperMode && !isRtspMode"
        :src="currentImageUrl" class="image-viewer" @error="handleImageError" alt="Full screen image" />

      <!-- WebRTC pano -->
      <webrtcStreamCard v-if="isRtspMode && currentRtspHotspot" :key="currentRtspHotspot.rtspUrl"
        :camera="{ id: 'rtsp', panorama: true }" :url="rtsp_url"
        class="w-full h-full object-cover absolute inset-0 transition-opacity duration-300" :pano=1
        :hotspots="stream_hotspot" @hotspotclicked="handleHotspotClickFromStream" />

      <!-- Video element -->
      <video
        v-else-if="currentVideoUrl && !currentImageUrl && !isGridMode && !isThumbnailMode && !singleIframeUrl && !isSwiperMode"
        id="videoPlayer" class="video-player" controls autoplay :src="currentVideoUrl" @error="handleVideoError">
        Your browser does not support the video tag.
      </video>

      <!-- Thumbnail grid -->
      <div v-if="isThumbnailMode" class="grid-container">
        <div v-for="(thumbnail, index) in gridThumbnails" :key="index" class="grid-wrapper">
          <img :src="thumbnail" alt="System Thumbnail" class="thumbnail-image" @click="showSingleIframe(index)"
            @error="handleThumbnailError(index)" />
        </div>
        <!-- Placeholder cho ô trống nếu gridThumbnails.length < 9 -->
        <div v-for="n in (9 - gridThumbnails.length)" :key="'empty-' + n" class="grid-wrapper placeholder">
          <div class="placeholder-text">No Thumbnail</div>
        </div>
      </div>

      <!-- Single iframe mode -->
      <iframe v-if="singleIframeUrl" class="single-iframe" :src="singleIframeUrl" frameBorder="0"
        allowfullscreen></iframe>

      <!-- Grid container for multiple videos or web pages -->
      <div v-if="isGridMode" class="grid-container">
        <div v-for="(url, index) in gridUrls" :key="index" class="grid-wrapper">
          <!-- Video grid -->
          <video v-if="gridType === 'video'" :class="`grid-video grid-video-${index}`" controls :src="url || ''"
            @error="handleGridVideoError(index)" @loadstart="handleVideoLoadStart(index)">
            Video not supported
          </video>

          <!-- Web grid (iframe) -->
          <iframe v-else :class="`grid-iframe grid-iframe-${index}`" :src="url || 'about:blank'" frameBorder="0"
            allowfullscreen>
          </iframe>
        </div>
      </div>

      <!-- Video Swiper Component -->
      <VideoSwiper v-if="isSwiperMode" :videos="swiperVideos" :show-video-info="false" :swiper-options="swiperOptions"
        @hotspot-clicked="handleHotspotClickFromStream" @video-error="handleVideoError"
        @swiper-initialized="onSwiperInitialized" ref="videoSwiperRef" />

      <div id="videoBack" class="video-back" @click="closeVideo">← Back to Tour</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick, ref } from 'vue'
import webrtcStreamCard from '../stream/webrtcStreamCard.vue'
import MiniMap from '../map/mini-map.vue'
import VideoSwiper from '../carousel/VideoSwiper.vue'
import 'pannellum/build/pannellum.css'
import 'pannellum/build/pannellum.js'

// Reactive variables
const isSwiperMode = ref(false)
const swiperVideos = ref([])
const swiperOptions = ref({
  effect: 'slide',
  speed: 600,
  loop: false,
  autoHeight: true
})

let isTransitioning = false
let viewer = null
let scenesConfig = null
let firstLoad = false
const rtsp_url = ref('')
const stream_hotspot = ref([])
const videoStack = ref([])

// Video state
const currentVideoUrl = ref('')
const isGridMode = ref(false)
const gridUrls = ref([])
const gridType = ref('video') // 'video' or 'web'
const isThumbnailMode = ref(false) // New state for thumbnail grid
const gridThumbnails = ref([]) // Store thumbnail URLs
const singleIframeUrl = ref('') // Store single iframe URL for enlarged view
const currentImageUrl = ref('')

// pano settings
const isRtspMode = ref(false)
const currentRtspHotspot = ref(null)

// Reactive debug variables
const debugInfo = ref(false)
const pannellumLoaded = ref(false)
const showLoading = ref(false)

// Scene tracking for mini-map
const currentSceneId = ref('scene001')
const visitedScenes = ref([])

// Component refs
const miniMapRef = ref(null)
const videoSwiperRef = ref(null)

function toggleDebug() {
  debugInfo.value = !debugInfo.value
}

// Handler for mini-map jump to scene
function handleJumpToScene(sceneId) {
  if (viewer && scenesConfig?.scenes[sceneId]) {
    console.log('Jumping to scene from minimap:', sceneId)
    streetViewTransition(sceneId)
  }
}

function updateCurrentScene(sceneId) {
  const oldSceneId = currentSceneId.value
  currentSceneId.value = sceneId

  if (!visitedScenes.value.includes(sceneId)) {
    visitedScenes.value.push(sceneId)
  }

  // Update mini-map
  if (miniMapRef.value) {
    miniMapRef.value.updateCurrentMap(sceneId)
  }

  // console.log('Updated current scene to:', sceneId, 'Visited:', visitedScenes.value)
}

// Video error handlers
function handleVideoError(event) {
  console.error('Video error:', event.target.error)
  console.error('Failed to load video:', currentVideoUrl.value)
}

function handleImageError(event) {
  console.error('Image error:', event.target.error)
  console.error('Failed to load image:', currentImageUrl.value)
}

function handleGridVideoError(index) {
  console.error(`Grid video ${index} error:`, gridUrls.value[index])
}

function handleVideoLoadStart(index) {
  console.log(`Grid video ${index} started loading:`, gridUrls.value[index])
}

// Swiper event handlers
function onSwiperInitialized(swiperInstance) {
  console.log('VideoSwiper initialized:', swiperInstance)
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
    // console.log('Configuration loaded successfully:', scenesConfig)

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
        } else if (hotspot.action === 'swiper') {
          hotspot.clickHandlerFunc = function () {
            console.log('Swiper hotspot clicked:', hotspot)
            showVideoScene(hotspot)
          }
        } else if (hotspot.action === 'grid') {
          hotspot.clickHandlerFunc = function () {
            showVideoScene({ ...hotspot, action: 'thumbnail' })
          }
        }

        // Xử lý hotspots bên trong stream hotspots
        if (hotspot.hotSpots && Array.isArray(hotspot.hotSpots)) {
          hotspot.hotSpots.forEach((streamHotspot) => {
            if (streamHotspot.targetScene) {
              streamHotspot.clickHandlerFunc = function () {
                streetViewTransition(streamHotspot.targetScene, streamHotspot);
              }
            } else if (streamHotspot.action === 'video') {
              streamHotspot.clickHandlerFunc = function () {
                showVideoScene(streamHotspot);
              }
            } else if (streamHotspot.action === 'swiper') {
              streamHotspot.clickHandlerFunc = function () {
                console.log('Stream swiper hotspot clicked:', streamHotspot)
                showVideoScene(streamHotspot);
              }
            }
          })
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
    // console.log('Pannellum viewer created:', viewer)

    viewer.on('scenechange', (scene_id) => {
      console.log('Scene changed to:', scene_id)
      updateCurrentScene(scene_id) // Update current scene and mini-map
      setTimeout(() => updateSceneInfo(scene_id), 500)
    })

    viewer.on('load', () => {
      if (firstLoad) return
      setTimeout(() => {
        updateSceneInfo(scenesConfig.default.firstScene)
        updateCurrentScene(scenesConfig.default.firstScene) // Initialize current scene
      }, 500)
      firstLoad = true
    })

    viewer.on('error', (error) => {
      console.error('Pannellum error:', error)
    })

    // Thay đổi Pannellum credit
    await nextTick()

    const updatePannellumCredit = () => {
      const label = panoramaEl.querySelector('.pnlm-about-msg')
      if (label) {
        label.innerHTML = `
          <a href="#" target="_blank" rel="noopener noreferrer">
            Copyright © 2025 AI Department.
          </a>
        `
        // console.log('Pannellum credit updated successfully.')
      } else {
        if (updatePannellumCredit.attempts < 20) {
          updatePannellumCredit.attempts++
          setTimeout(updatePannellumCredit, 100)
        } else {
          console.warn('Pannellum credit label not found after multiple attempts.')
        }
      }
    }
    updatePannellumCredit.attempts = 0

    setTimeout(updatePannellumCredit, 100)

    // Debug mouse events (optional)
    viewer.on('mousedown', (event) => {
      const canvas = document.querySelector('#panorama canvas')
      if (canvas && event) {
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

  // Push current state if nested
  if (isRtspMode.value || currentVideoUrl.value || currentImageUrl.value || isGridMode.value || isThumbnailMode.value || singleIframeUrl.value || isSwiperMode.value) {
    let currentState = {}
    if (isRtspMode.value) {
      currentState = { type: 'rtsp', data: { hotspot: currentRtspHotspot.value, stream_hotspot: stream_hotspot.value } }
    }
    else if (currentImageUrl.value) {
      currentState = { type: 'image', data: { url: currentImageUrl.value } }
    } else if (currentVideoUrl.value) {
      currentState = { type: 'video', data: { url: currentVideoUrl.value } }
    } else if (isGridMode.value) {
      currentState = { type: 'grid', data: { urls: gridUrls.value, gridType: gridType.value } }
    } else if (isThumbnailMode.value) {
      currentState = { type: 'thumbnail', data: { urls: gridUrls.value, thumbnails: gridThumbnails.value } }
    } else if (singleIframeUrl.value) {
      currentState = { type: 'singleIframe', data: { url: singleIframeUrl.value } }
    } else if (isSwiperMode.value) {
      currentState = { type: 'swiper', data: { videos: swiperVideos.value } }
    }
    videoStack.value.push(currentState)
    console.log('Pushed to stack:', currentState)
  }

  // Reset states
  resetVideoStates()

  // Check if this is a swiper hotspot (multiple videos)
  if (hotspot.action === 'swiper' || (hotspot.videos && Array.isArray(hotspot.videos))) {
    isSwiperMode.value = true
    swiperVideos.value = hotspot.videos || []
    console.log('Swiper mode activated with videos:', swiperVideos.value)
  }

  // check nếu là file ảnh thì sẽ là đuôi như dưới đây
  const isImageFile = hotspot.action === 'image' ||
    hotspot.videoType === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(hotspot.rtspUrl || hotspot.videoUrl || '')

  if (isImageFile) {
    currentImageUrl.value = hotspot.rtspUrl || hotspot.videoUrl || hotspot.imageUrl || ''
    console.log('Image mode activated with URL:', currentImageUrl.value)
  }

  // Set new state based on hotspot
  if (hotspot.action === 'thumbnail' || (hotspot.action === 'grid' && hotspot.gridType === 'web')) {
    const urls = hotspot.urls || hotspot.gridUrls || []
    const thumbnails = hotspot.thumbnailUrl && Array.isArray(hotspot.thumbnailUrl) ? hotspot.thumbnailUrl : []

    if (urls.length === 1) {
      singleIframeUrl.value = urls[0] || ''
      console.log('Single iframe mode activated with URL:', singleIframeUrl.value)
    } else {
      isThumbnailMode.value = true
      gridUrls.value = urls
      gridThumbnails.value = thumbnails.slice(0, 9)
      console.log('Thumbnail mode activated with URLs:', gridUrls.value, 'Thumbnails:', gridThumbnails.value)
    }
  } else if (hotspot.action === 'grid' && hotspot.gridType !== 'web') {
    isGridMode.value = true
    gridUrls.value = hotspot.urls || hotspot.gridUrls || Array(9).fill('')
    gridType.value = hotspot.gridType === 'web' ? 'web' : 'video'
    console.log(`Grid mode activated (${gridType.value}) with URLs:`, gridUrls.value)
  } else if (hotspot.videoType === 'rtsp' && hotspot.rtspUrl && !/\.[^/]+$/.test(hotspot.rtspUrl)) {
    rtsp_url.value = hotspot.rtspUrl + '/whep'
    if (hotspot.hotSpots?.length > 0) {
      stream_hotspot.value = hotspot.hotSpots
    }
    isRtspMode.value = true
    currentRtspHotspot.value = hotspot
    console.log('RTSP mode activated:', hotspot)
  } else {
    const videoUrl = hotspot?.videoUrl || hotspot?.rtspUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'
    currentVideoUrl.value = videoUrl
    console.log('Video mode activated with URL:', videoUrl)
  }

  videoScene.style.display = 'flex'
  setTimeout(() => {
    videoScene.style.opacity = '1'
  }, 50)
}

function resetVideoStates() {
  isRtspMode.value = false
  currentRtspHotspot.value = null
  currentVideoUrl.value = ''
  currentImageUrl.value = ''
  isGridMode.value = false
  gridUrls.value = []
  gridType.value = 'video'
  stream_hotspot.value = []
  isThumbnailMode.value = false
  gridThumbnails.value = []
  singleIframeUrl.value = ''
  isSwiperMode.value = false
  swiperVideos.value = []
}

function showSingleIframe(index) {
  const videoScene = document.getElementById('videoScene')
  if (!videoScene) return

  // Push thumbnail state to stack
  videoStack.value.push({
    type: 'thumbnail',
    data: { urls: gridUrls.value, thumbnails: gridThumbnails.value }
  })
  console.log('Pushed thumbnail state to stack')

  // Set single iframe mode
  isThumbnailMode.value = false
  singleIframeUrl.value = gridUrls.value[index] || 'about:blank'
  console.log('Single iframe mode activated with URL:', singleIframeUrl.value)

  videoScene.style.display = 'flex'
  setTimeout(() => {
    videoScene.style.opacity = '1'
  }, 50)
}

function closeVideo() {
  const videoScene = document.getElementById('videoScene')
  const panorama = document.getElementById('panorama')

  if (videoScene) videoScene.style.opacity = '0'

  // Destroy swiper if exists
  if (videoSwiperRef.value) {
    videoSwiperRef.value.destroySwiper()
  }

  setTimeout(() => {
    if (videoStack.value.length > 0) {
      const prevState = videoStack.value.pop()
      console.log('Popped from stack:', prevState)

      // Reset current states
      resetVideoStates()

      // Restore based on type
      if (prevState.type === 'rtsp') {
        rtsp_url.value = prevState.data.hotspot.rtspUrl + '/whep'
        stream_hotspot.value = prevState.data.stream_hotspot || []
        isRtspMode.value = true
        currentRtspHotspot.value = prevState.data.hotspot
      }
      else if (prevState.type === 'image') {
        currentImageUrl.value = prevState.data.url
      }
      else if (prevState.type === 'video') {
        currentVideoUrl.value = prevState.data.url
      } else if (prevState.type === 'grid') {
        isGridMode.value = true
        gridUrls.value = prevState.data.urls
        gridType.value = prevState.data.gridType
      } else if (prevState.type === 'thumbnail') {
        isThumbnailMode.value = true
        gridUrls.value = prevState.data.urls
        gridThumbnails.value = prevState.data.thumbnails
      } else if (prevState.type === 'singleIframe') {
        singleIframeUrl.value = prevState.data.url
      } else if (prevState.type === 'swiper') {
        isSwiperMode.value = true
        swiperVideos.value = prevState.data.videos
        // VideoSwiper component will auto-initialize via watch
      }

      // Keep videoScene visible for previous layer
      if (videoScene) videoScene.style.display = 'flex'
      setTimeout(() => { videoScene.style.opacity = '1' }, 50)
    } else {
      // No stack: reset all and back to tour
      if (videoScene) videoScene.style.display = 'none'
      resetVideoStates()
      if (panorama && viewer) {
        viewer.lookAt(viewer.getPitch(), viewer.getYaw(), viewer.getHfov(), 0)
      }
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
      // console.log('Pannellum found!')
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

const handleHotspotClickFromStream = (hotspot) => {
  console.log('Stream hotspot clicked:', hotspot);

  // Kiểm tra nếu hotspot có targetScene thì chuyển scene
  if (hotspot.targetScene) {
    console.log('Navigating to scene from stream:', hotspot.targetScene);

    // Đóng video scene trước
    closeVideo();

    // Chờ một chút để video scene đóng hoàn toàn, rồi chuyển scene
    setTimeout(() => {
      streetViewTransition(hotspot.targetScene, hotspot);
    }, 300); // Đợi video scene đóng hoàn toàn

  } else if (hotspot.action === 'image') {  // ← THÊM PHẦN NÀY
    console.log('Image hotspot clicked from stream');
    showVideoScene(hotspot);
  } else if (hotspot.action === 'video') {
    console.log('Video hotspot clicked from stream');
    showVideoScene(hotspot);

  } else if (hotspot.action === 'grid') {
    console.log('Grid hotspot clicked from stream');
    showVideoScene(hotspot);

  } else if (hotspot.action === 'swiper') {
    console.log('Swiper hotspot clicked from stream');
    showVideoScene(hotspot);

  } else if (hotspot.action === 'thumbnail') {
    console.log('Thumbnail hotspot clicked from stream');
    showVideoScene(hotspot);

  } else {
    console.log('Unknown hotspot action from stream:', hotspot);
  }
}

function handleThumbnailError(index) {
  console.error(`Thumbnail ${index} failed to load:`, gridThumbnails.value[index])
}
</script>

<style scoped>
.tour-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
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
  position: absolute;
  bottom: 20px;
  left: 20px;
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
  z-index: 3;
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
  z-index: 100;
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
  width: 75%;
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
  transform: scale(0.375);
  /* từ 0.25 (nhỏ) -> 0.375 (vừa) -> 0.5 (to) */
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
  border: none;
}


.grid-wrapper {
  position: relative;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.thumbnail-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.single-iframe {
  width: 90%;
  height: 80%;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
}

.grid-iframe {
  width: 1280px;
  height: 800px;
  transform: scale(0.375);
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
  height: 20px;
  /* thấp hơn để mũi tên bẹt */
  background: white;
  clip-path: polygon(50% 0, 0 100%, 20% 100%, 50% 40%, 80% 100%, 100% 100%);
  pointer-events: none;
}

.video-hotspot {
  width: 60px;
  height: 40px;
  background: rgba(0, 132, 255, 0.185); /* nền trắng mờ */
  backdrop-filter: blur(6px); /* blur */
  border: 2px solid rgba(0, 162, 255, 0.4);
  border-radius: 6px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff; /* font trắng */
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 140, 255, 0.25);
  cursor: pointer;
}

/* Chân màn hình */
.video-hotspot::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 6px;
  background: rgba(0, 132, 255, 0.473);
  border-radius: 3px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 102, 255, 0.4);
}

/* Icon hiển thị ở giữa màn hình */
.video-hotspot::before {
  content: "▶";
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

/* Hover effect */
.video-hotspot:hover {
  transform: scale(1.1);
  background: rgba(0, 132, 255, 0.473);
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

.image-viewer {
  width: 75%;
  height: auto;
  box-shadow: 0 10px 60px rgba(0, 0, 0, 0.5);
}

.image-hotspot {
  width: 60px;
  height: 40px;
  background: rgba(0, 132, 255, 0.185); /* nền trắng mờ */
  backdrop-filter: blur(6px); /* blur */
  border: 2px solid rgba(0, 162, 255, 0.4);
  border-radius: 6px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff; /* font trắng */
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 140, 255, 0.25);
  cursor: pointer;
}

/* Chân màn hình */
.image-hotspot::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 6px;
  background: rgba(0, 132, 255, 0.473);
  border-radius: 3px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 102, 255, 0.4);
}

/* Icon hiển thị ở giữa màn hình */
.image-hotspot::before {
  content: "▶";
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

/* Hover effect */
.image-hotspot:hover {
  transform: scale(1.1);
  background: rgba(0, 132, 255, 0.473);
}

.live-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgb(220 38 38 / 60%);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}
</style>