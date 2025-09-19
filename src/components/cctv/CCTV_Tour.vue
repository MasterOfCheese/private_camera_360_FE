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
            :pano=1
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
        
        <!-- Grid container for multiple videos -->
        <div v-if="isGridMode" class="grid-container">
            <div v-for="(url, index) in gridUrls" :key="index" class="grid-wrapper">
                <video 
                    :class="`grid-video grid-video-${index}`"
                    controls
                    :src="url || ''"
                    @error="handleGridVideoError(index)"
                    @loadstart="handleVideoLoadStart(index)"
                >
                    Video not supported
                </video>
            </div>
        </div>
        
        <div id="videoBack" class="video-back" @click="closeVideo">← Back to Tour</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick, ref } from "vue";
import webrtcStreamCard from "../stream/webrtcStreamCard.vue";
import 'pannellum/build/pannellum.css'
import 'pannellum/build/pannellum.js'

// Import helper if available
// import { getAssetUrl } from "@/helper/virtual";

let isTransitioning = false;
let viewer = null;
let scenesConfig = null;
let firstLoad = false;
const rtsp_url = ref('')

// Video state
const currentVideoUrl = ref('')
const isGridMode = ref(false)
const gridUrls = ref([])

// pano settings
const isRtspMode = ref(false);
const currentRtspHotspot = ref(null);

// Reactive debug variables
const debugInfo = ref(false);
const pannellumLoaded = ref(false);
const showLoading = ref(false);

function toggleDebug() {
  debugInfo.value = !debugInfo.value;
}

// Video error handlers
function handleVideoError(event) {
  console.error('Video error:', event.target.error);
  console.error('Failed to load video:', currentVideoUrl.value);
}

function handleGridVideoError(index) {
  console.error(`Grid video ${index} error:`, gridUrls.value[index]);
}

function handleVideoLoadStart(index) {
  console.log(`Grid video ${index} started loading:`, gridUrls.value[index]);
}

// Helper function - replace with your actual helper if different
function getAssetUrl(path) {
  return `${window.appConfig?.apiUrl || ''}/static/virtual_tour/${path}`;
}

async function loadConfiguration() {
  showLoading.value = true;

  try {
    console.log('Starting to load configuration...');
    console.log('API URL:', window.appConfig?.apiUrl || 'undefined');
    
    const configUrl = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/B08-3F.json`;
    console.log('Config URL:', configUrl);
    
    const response = await fetch(configUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    scenesConfig = await response.json();
    console.log("Configuration loaded successfully:", scenesConfig);

    // Process the panorama URLs to use full paths
    for (const sceneId in scenesConfig.scenes) {
      const scene = scenesConfig.scenes[sceneId];
      if (scene.panorama && !scene.panorama.startsWith('http')) {
        const oldPanorama = scene.panorama;
        scene.panorama = getAssetUrl(scene.panorama);
        console.log(`Updated panorama URL for ${sceneId}: ${oldPanorama} -> ${scene.panorama}`);
      }
    }

    processHotspots();
    await initializePanorama();

    showLoading.value = false;
  } catch (error) {
    console.error("Error loading configuration:", error);
    showLoading.value = false;
    console.log('Falling back to default config...');
    loadFallbackConfig();
  }
}

async function forceInit() {
  console.log('Force initializing...');
  if (typeof window.pannellum !== 'undefined') {
    pannellumLoaded.value = true;
    await loadConfiguration();
  } else {
    console.error('Pannellum still not loaded');
  }
}

function processHotspots() {
  for (const sceneId in scenesConfig.scenes) {
    const scene = scenesConfig.scenes[sceneId];
    if (scene.hotSpots) {
      scene.hotSpots.forEach((hotspot) => {
        if (hotspot.targetScene) {
          // Fix: Truyền chính hotspot object thay vì 'this'
          hotspot.clickHandlerFunc = function () {
            streetViewTransition(hotspot.targetScene, hotspot);
          };
        } else if (hotspot.action === "video") {
          hotspot.clickHandlerFunc = function () {
            showVideoScene(hotspot);
          };
        } else if (hotspot.action === "grid") {
          hotspot.clickHandlerFunc = function () {
            showVideoScene({ ...hotspot, action: "webgrid" });
          };
        }
      });
    }
  }
}

async function initializePanorama() {
  if (!scenesConfig) {
    console.error('No configuration available');
    return;
  }
  
  if (typeof window.pannellum === 'undefined') {
    console.error('Pannellum not loaded');
    return;
  }

  const config = {
    default: scenesConfig.default,
    scenes: scenesConfig.scenes,
  };

  console.log('Initializing Pannellum with config:', config);

  try {
    // Make sure the panorama element exists and is visible
    const panoramaEl = document.getElementById("panorama");
    if (!panoramaEl) {
      console.error('Panorama element not found');
      return;
    }

    console.log('Panorama element dimensions:', {
      width: panoramaEl.offsetWidth,
      height: panoramaEl.offsetHeight,
      display: getComputedStyle(panoramaEl).display
    });

    viewer = window.pannellum.viewer("panorama", config);
    console.log('Pannellum viewer created:', viewer);
    
    viewer.on("scenechange", (scene_id) => {
      console.log("Scene changed to:", scene_id);
      setTimeout(() => updateSceneInfo(scene_id), 500);
    });

    viewer.on("load", () => {
      console.log('Panorama loaded, firstLoad:', firstLoad);
      if (firstLoad) return;
      setTimeout(() => {
        updateSceneInfo(scenesConfig.default.firstScene);
      }, 500);
      firstLoad = true;
    });

    viewer.on('error', (error) => {
      console.error('Pannellum error:', error);
    });

    // Debug mouse events (optional)
    viewer.on('mousedown', (event) => {
      console.log("pitch:", viewer.getPitch());
      console.log("yaw:", viewer.getYaw());
      console.log("hfov:", viewer.getHfov());
    });

  } catch (error) {
    console.error('Error initializing panorama:', error);
  }
}

function loadFallbackConfig() {
  scenesConfig = {
    default: {
      firstScene: "scene1",
      autoLoad: true,
      sceneFadeDuration: 600,
      showZoomCtrl: false,
      showFullscreenCtrl: false,
      showControls: true,
      mouseZoom: true,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
    },
    sceneInfo: {
      scene1: "Scene 1 - Living Room",
      scene2: "Scene 2 - Kitchen",
    },
    scenes: {
      scene1: {
        panorama: getAssetUrl("3f_template_img/vlcsnap-00001.jpg"),
        hfov: 100,
        pitch: 0,
        yaw: 180,
        hotSpots: [
          {
            pitch: 1.75,
            yaw: 140,
            cssClass: "link-hotspot",
            targetScene: "scene2",
          },
          {
            pitch: 0,
            yaw: -40,
            cssClass: "video-hotspot",
            action: "video",
            videoUrl: getAssetUrl("3f_template_img/video001.mp4"),
          },
        ],
      },
      scene2: {
        panorama: getAssetUrl("3f_template_img/vlcsnap-00004.jpg"),
        hfov: 110,
        pitch: 0,
        yaw: 180,
        hotSpots: [
          {
            pitch: 0,
            yaw: 140,
            cssClass: "link-hotspot",
            targetScene: "scene1",
          },
        ],
      },
    },
  };

  processHotspots();
  initializePanorama();
}

function updateSceneInfo(sceneId) {
  const infoElement = document.getElementById("scene-info");
  if (infoElement) {
    const sceneTitle = scenesConfig?.sceneInfo?.[sceneId] || sceneId;
    infoElement.textContent = sceneTitle;
    setTimeout(() => infoElement.classList.add("show"), 500);
  }
}

function hideSceneInfo() {
  const infoElement = document.getElementById("scene-info");
  if (infoElement) {
    infoElement.classList.remove("show");
  }
}

function streetViewTransition(sceneId, hotspot) {
  if (isTransitioning || !viewer) return;
  isTransitioning = true;

  hideSceneInfo();
  const overlay = document.getElementById("transition-overlay");
  const loader = document.getElementById("loading-indicator");

  if (hotspot) {
    console.log('Hotspot coords:', hotspot.pitch, hotspot.yaw);
    
    // Bước 1: Xoay camera đến hotspot (hotspot vẫn ở vị trí cũ)
    viewer.lookAt(hotspot.pitch, hotspot.yaw, viewer.getHfov(), 300);
    
    // Bước 2: Zoom vào hotspot (hotspot giờ di chuyển về giữa màn hình)
    setTimeout(() => {
      viewer.lookAt(hotspot.pitch, hotspot.yaw, 30, 500);
    }, 300);
    
    // Bước 3: Hiện loading ở giữa ngay khi zoom xong
    setTimeout(() => {
      if (overlay) overlay.classList.add("active");
      if (loader) loader.classList.add("active");
    }, 800); // Sau khi zoom hoàn thành
  } else {
    // Không có hotspot thì hiện loading ngay
    if (overlay) overlay.classList.add("active");
    if (loader) loader.classList.add("active");
  }

  // Bước 4: Chuyển scene
  setTimeout(() => {
    const yaw = hotspot ? hotspot.yaw : viewer.getYaw();
    const pitch = hotspot ? hotspot.pitch : viewer.getPitch();

    viewer.loadScene(sceneId, pitch, yaw, 100, {
      transitionDuration: 600,
    });
  }, 700);

  // Bước 5: Kết thúc transition
  setTimeout(() => {
    if (overlay) overlay.classList.remove("active");
    if (loader) loader.classList.remove("active");
    updateSceneInfo(sceneId);
    isTransitioning = false;
  }, 800);
}

function showVideoScene(hotspot) {
  const videoScene = document.getElementById("videoScene");
  
  if (!videoScene) return;

  // Reset states
  isRtspMode.value = false;
  currentRtspHotspot.value = null;
  currentVideoUrl.value = '';
  isGridMode.value = false;
  gridUrls.value = [];

  if (hotspot && hotspot.action === "webgrid") {
    // Grid mode with multiple videos
    isGridMode.value = true;
    gridUrls.value = hotspot.urls || hotspot.gridUrls || Array(9).fill('');
    console.log('Grid mode activated with URLs:', gridUrls.value);
    
  } else if (hotspot && hotspot.videoType === "rtsp" && (hotspot.rtspUrl && !/\.[^/]+$/.test(hotspot.rtspUrl))) {
    // RTSP mode
    console.log("RTSP hotspot:", hotspot);
    rtsp_url.value = hotspot.rtspUrl + '/whep';
    isRtspMode.value = true;
    currentRtspHotspot.value = hotspot;
    
  } else {
    // Regular video mode
    const videoUrl = hotspot?.videoUrl || hotspot?.rtspUrl || "https://www.w3schools.com/html/mov_bbb.mp4";
    currentVideoUrl.value = videoUrl;
    console.log('Video mode activated with URL:', videoUrl);
  }

  // Show video scene
  videoScene.style.display = "flex";
  setTimeout(() => {
    videoScene.style.opacity = "1";
  }, 50);
}

function closeVideo() {
  const videoScene = document.getElementById("videoScene");
  const panorama = document.getElementById("panorama");

  // Reset all video states
  isRtspMode.value = false;
  currentRtspHotspot.value = null;
  currentVideoUrl.value = '';
  isGridMode.value = false;
  gridUrls.value = [];

  // Hide video scene with transition
  if (videoScene) videoScene.style.opacity = "0";

  setTimeout(() => {
    if (videoScene) videoScene.style.display = "none";
    if (panorama && viewer) {
      // Restore panorama view
      viewer.lookAt(viewer.getPitch(), viewer.getYaw(), viewer.getHfov(), 0);
    }
  }, 300);
}

onMounted(async () => {
  console.log('Component mounted');
  
  // Wait for next tick to ensure DOM is ready
  await nextTick();
  console.log('DOM ready');
  
  // Check if Pannellum is loaded
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max
  
  const checkPannellum = () => {
    attempts++;
    console.log(`Checking Pannellum... attempt ${attempts}`);
    
    if (typeof window.pannellum !== 'undefined') {
      console.log('Pannellum found!');
      pannellumLoaded.value = true;
      loadConfiguration();
    } else if (attempts < maxAttempts) {
      console.log('Pannellum not found, retrying...');
      setTimeout(checkPannellum, 100);
    } else {
      console.error('Pannellum library not loaded after 5 seconds. Make sure to include it in your index.html');
      pannellumLoaded.value = false;
    }
  };
  
  checkPannellum();
});
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(66, 165, 245, 0.8) 0%, rgba(33, 150, 243, 0.6) 70%, transparent 100%);
    border: 3px solid rgba(255, 255, 255, 0.9);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    /* position: relative; */
    /* overflow: hidden; */
}

.link-hotspot:hover {
      transform: scale(1.3);
      background: radial-gradient(circle, rgba(76, 175, 80, 0.9) 0%, rgba(56, 142, 60, 0.7) 70%, transparent 100%);
      border-color: rgba(255, 255, 255, 1);
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
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
      transform: translate(-50%, -60%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 16px solid white;
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
    transition: all 0.3s 
cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}


</style>