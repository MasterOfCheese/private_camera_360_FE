<template>
  <div class="minimap-wrapper">
    <!-- Minimap Toggle Button -->
    <div class="minimap-toggle" @click="toggleMinimap">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3M10,5.47L14,6.87V18.53L10,17.13V5.47M5,6.46L8,5.45V17.15L5,18.31V6.46M16,18.55L19,17.54V5.84L16,6.87V18.55Z" />
      </svg>
      Map
    </div>

    <!-- Minimap Container -->
    <div v-show="minimapVisible" class="minimap-container" :class="{ expanded: minimapExpanded }">
      <div class="minimap-header">
        <span>{{ currentMapInfo?.name || 'Floor Plan' }}</span>
        <div class="minimap-controls">
          <button @click="toggleMinimapSize" class="expand-btn">
            {{ minimapExpanded ? '−' : '+' }}
          </button>
          <button @click="closeMinimap" class="close-btn">×</button>
        </div>
      </div>

      <div class="minimap-content" ref="minimapContainer">
        <img :src="mapImageUrl" alt="Floor Plan" class="minimap-image" @load="onMapImageLoaded" @click="onMapClick" />

        <!-- Scene Markers -->
        <div v-for="(scene, sceneId) in sceneMarkers" :key="sceneId" v-show="shouldShowMarker(sceneId)" :class="[
          'scene-marker',
          { active: currentSceneId === sceneId },
          { visited: visitedScenes.includes(sceneId) },
        ]" :style="{
          left: scene.x + '%',
          top: scene.y + '%',
        }" @click="jumpToScene(sceneId)" :title="getSceneTitle(sceneId)">
          <div class="marker-dot"></div>
          <div class="marker-label">{{ scene.label || sceneId }}</div>
        </div>

        <!-- Current Position Indicator -->
        <div v-if="currentSceneMarker" class="current-position" :style="{
          left: currentSceneMarker.x + '%',
          top: currentSceneMarker.y + '%',
        }">
          <div class="position-ring"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props từ parent component
const props = defineProps({
  currentSceneId: {
    type: String,
    default: 'scene001'
  },
  visitedScenes: {
    type: Array,
    default: () => []
  },
  scenesConfig: {
    type: Object,
    default: () => null
  }
})

// Events emit về parent
const emit = defineEmits(['jump-to-scene'])

// Minimap state
const minimapVisible = ref(false)
const minimapExpanded = ref(false)
const mapImageUrl = ref('')

// Map configuration
const minimapConfig = ref({
  showAllMarkers: true,
  showVisitedMarkers: true,
  showActiveMarker: true,
  showUnvisitedMarkers: true
})

// Multi-floor map support
const mapsConfig = ref({})
const currentMapId = ref('')
const sceneMarkers = ref({})

// Computed properties
const currentSceneMarker = computed(() => {
  // Tìm scene trong tất cả các floors
  for (const floorScenes of Object.values(mapsConfig.value.scenes || {})) {
    if (floorScenes[props.currentSceneId]) {
      return floorScenes[props.currentSceneId]
    }
  }
  return sceneMarkers.value[props.currentSceneId] // Fallback cho cấu trúc cũ
})

// Computed cho current map info
const currentMapInfo = computed(() => {
  if (!currentMapId.value || !mapsConfig.value.maps) return null
  return mapsConfig.value.maps[currentMapId.value]
})

// Computed cho scenes của map hiện tại
const currentMapScenes = computed(() => {
  if (!currentMapInfo.value) return {}

  const allScenes = {}

  // Duyệt qua tất cả floors và lấy scenes thuộc map hiện tại
  for (const [floorName, floorScenes] of Object.entries(mapsConfig.value.scenes || {})) {
    for (const [sceneId, sceneData] of Object.entries(floorScenes)) {
      if (sceneData.mapId === currentMapId.value) {
        allScenes[sceneId] = sceneData
      }
    }
  }

  return allScenes
})

// Methods
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
  if (currentMapInfo.value) {
    mapImageUrl.value = `${window.appConfig?.apiUrl || ''}${currentMapInfo.value.image}`
    console.log('Loading map image:', mapImageUrl.value)
  } else {
    // Fallback to default map
    mapImageUrl.value = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/3f_template_img/map.png`
  }
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
  console.log('Jumping to scene from minimap:', sceneId)
  const marker = sceneMarkers.value[sceneId]
  console.log('Scene coordinates:', { x: marker.x, y: marker.y })
  
  // Emit event về parent component
  emit('jump-to-scene', sceneId)
}

// Method để tìm mapId từ sceneId
function getMapIdForScene(sceneId) {
  // Tìm trong structure mới (floors)
  for (const floorScenes of Object.values(mapsConfig.value.scenes || {})) {
    if (floorScenes[sceneId]) {
      return floorScenes[sceneId].mapId || 'map1'
    }
  }

  // Fallback cho structure cũ
  const sceneData = sceneMarkers.value[sceneId]
  return sceneData?.mapId || 'map1'
}

function getSceneInfo(sceneId) {
  // Tìm trong structure mới (floors)
  for (const floorScenes of Object.values(mapsConfig.value.scenes || {})) {
    if (floorScenes[sceneId]) {
      return floorScenes[sceneId]
    }
  }

  // Fallback cho structure cũ
  return sceneMarkers.value[sceneId] || null
}

// Method to determine if a marker should be shown
function shouldShowMarker(sceneId) {
  // Chỉ hiển thị markers thuộc map hiện tại
  const sceneMapId = getMapIdForScene(sceneId)
  if (sceneMapId !== currentMapId.value) {
    return false
  }

  const isActive = props.currentSceneId === sceneId
  const isVisited = props.visitedScenes.includes(sceneId)
  const isUnvisited = !isVisited && !isActive

  // If showAllMarkers is true, show all markers of current map
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

// Method để chuyển đổi map
function switchToMap(mapId) {
  if (currentMapId.value !== mapId && mapsConfig.value.maps[mapId]) {
    currentMapId.value = mapId
    loadMapImage() // Reload map image
    console.log(`Switched to map: ${mapId}`)
  }
}

function getSceneTitle(sceneId) {
  const sceneInfo = getSceneInfo(sceneId)
  return sceneInfo?.label || props.scenesConfig?.sceneInfo?.[sceneId] || sceneId
}

// Watch for scene changes to auto-switch maps
function updateCurrentMap(sceneId) {
  // Tự động chuyển map nếu scene thuộc map khác
  const newMapId = getMapIdForScene(sceneId)
  if (newMapId !== currentMapId.value) {
    console.log(`Auto switching from map ${currentMapId.value} to ${newMapId} for scene ${sceneId}`)
    switchToMap(newMapId)
  }
}

async function loadSceneMarkers() {
  try {
    const markersUrl = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/scene-markers.json`
    const response = await fetch(markersUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Kiểm tra cấu trúc mới với floors
    if (data.maps && data.scenes && typeof data.scenes === 'object') {
      // Check nếu scenes có cấu trúc floor (nested objects)
      const firstSceneKey = Object.keys(data.scenes)[0]
      if (firstSceneKey && typeof data.scenes[firstSceneKey] === 'object' && !data.scenes[firstSceneKey].x) {
        // Cấu trúc floors (scenes.floor1.scene001, scenes.floor3.scene002...)
        // console.log('Loading scenes with floor structure')
        mapsConfig.value = data

        // Flatten scenes để tương thích với code cũ
        const flatScenes = {}
        for (const floorScenes of Object.values(data.scenes)) {
          Object.assign(flatScenes, floorScenes)
        }
        sceneMarkers.value = flatScenes
      } else {
        // Cấu trúc flat cũ (scenes.scene001, scenes.scene002...)
        console.log('Loading scenes with flat structure')
        mapsConfig.value = data
        sceneMarkers.value = data.scenes
      }

      // Tìm map đầu tiên để set làm default
      const firstMapId = Object.keys(data.maps)[0]
      if (firstMapId) {
        currentMapId.value = firstMapId
        // console.log('Set default map to:', firstMapId)
      }
    } else {
      // Cấu trúc cũ hoàn toàn - tạo map mặc định
      console.log('Using legacy structure, creating default map')
      sceneMarkers.value = data
      mapsConfig.value = {
        maps: {
          'map1': {
            name: 'Default Floor Plan',
            image: '/static/virtual_tour/3f_template_img/map-1f.png',
            scenes: Object.keys(data)
          }
        },
        scenes: {
          'floor1': data
        }
      }
      currentMapId.value = 'map1'
    }

    // console.log('Scene markers loaded successfully:', mapsConfig.value)
  } catch (error) {
    console.error('Error loading scene markers:', error)
    // Fallback configuration
    mapsConfig.value = {
      maps: {
        'map1': {
          name: 'Default Floor Plan',
          image: '/static/virtual_tour/3f_template_img/map-1f.png',
          scenes: []
        }
      },
      scenes: {
        'floor1': {}
      }
    }
    sceneMarkers.value = {}
    currentMapId.value = 'map1'
  }
}

// Exposed methods for parent component
defineExpose({
  updateCurrentMap,
  switchToMap
})

// Watch currentSceneId changes from props
import { watch } from 'vue'
watch(() => props.currentSceneId, (newSceneId) => {
  updateCurrentMap(newSceneId)
})

onMounted(async () => {
  await loadSceneMarkers()
  
  // Load minimap configuration from parent's scenesConfig if available
  if (props.scenesConfig?.minimap) {
    minimapConfig.value = { ...minimapConfig.value, ...props.scenesConfig.minimap }
    console.log('Minimap config loaded:', minimapConfig.value)
  }
})
</script>

<style scoped>
/* Minimap Toggle Button */
.minimap-toggle {
  position: fixed;
  top: 5em;
  right: 1em;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 2;
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
  top: 7.5em;
  right: 1em;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  width: 27%;
  max-height: fit-content;
  animation: slideInRight 0.3s ease-out;
}

.minimap-container.expanded {
  width: 63%;
  /* max-height: 500px; */
  user-select: none;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
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

.minimap-hidden :deep(.minimap-container) {
  z-index: -1 !important;
  pointer-events: none;
  opacity: 0;
}
</style>
