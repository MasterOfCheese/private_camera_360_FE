<template>
  <div class="minimap-wrapper">
    <!-- Minimap Container -->
    <div class="minimap-container" :class="{ expanded: minimapExpanded }">
      <div class="minimap-header">
        <!-- Nhóm tiêu đề mới -->
        <div class="header-title-group">
          <span>{{ currentMapInfo?.name || 'Floor Plan' }}</span>
          <!-- Hiển thị tên của scene hiện tại ở đây -->
          <span class="active-scene-label" v-if="activeSceneTitle">: {{ activeSceneTitle }}</span>
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
import { ref, computed, onMounted, watch } from 'vue'

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

// Minimap state - Mặc định hiển thị và phóng to
const minimapExpanded = ref(true)
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
  for (const floorScenes of Object.values(mapsConfig.value.scenes || {})) {
    if (floorScenes[props.currentSceneId]) {
      return floorScenes[props.currentSceneId]
    }
  }
  return sceneMarkers.value[props.currentSceneId]
})

const currentMapInfo = computed(() => {
  if (!currentMapId.value || !mapsConfig.value.maps) return null
  return mapsConfig.value.maps[currentMapId.value]
})

// *** THÊM MỚI: Computed property để lấy tên scene hiện tại ***
const activeSceneTitle = computed(() => {
  if (!props.currentSceneId) return '';
  return getSceneTitle(props.currentSceneId);
});

// Methods
function loadMapImage() {
  if (currentMapInfo.value) {
    mapImageUrl.value = `${window.appConfig?.apiUrl || ''}${currentMapInfo.value.image}`
  } else {
    mapImageUrl.value = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/3f_template_img/map.png`
  }
}

function onMapImageLoaded() {
  console.log('Map image loaded successfully')
}

function onMapClick(event) {
  const rect = event.target.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  console.log('Clicked map at coordinates:', { x: x.toFixed(1), y: y.toFixed(1) })
}

function jumpToScene(sceneId) {
  emit('jump-to-scene', sceneId)
}

function getMapIdForScene(sceneId) {
  for (const floorScenes of Object.values(mapsConfig.value.scenes || {})) {
    if (floorScenes[sceneId]) {
      return floorScenes[sceneId].mapId || 'map1'
    }
  }
  const sceneData = sceneMarkers.value[sceneId]
  return sceneData?.mapId || 'map1'
}

function getSceneInfo(sceneId) {
  for (const floorScenes of Object.values(mapsConfig.value.scenes || {})) {
    if (floorScenes[sceneId]) {
      return floorScenes[sceneId]
    }
  }
  return sceneMarkers.value[sceneId] || null
}

function shouldShowMarker(sceneId) {
  const sceneMapId = getMapIdForScene(sceneId)
  if (sceneMapId !== currentMapId.value) {
    return false
  }
  if (minimapConfig.value.showAllMarkers) {
    return true
  }
  const isActive = props.currentSceneId === sceneId
  const isVisited = props.visitedScenes.includes(sceneId)
  const isUnvisited = !isVisited && !isActive
  if ((isActive && minimapConfig.value.showActiveMarker) ||
      (isVisited && minimapConfig.value.showVisitedMarkers) ||
      (isUnvisited && minimapConfig.value.showUnvisitedMarkers)) {
    return true
  }
  return false
}

function switchToMap(mapId) {
  if (currentMapId.value !== mapId && mapsConfig.value.maps[mapId]) {
    currentMapId.value = mapId
    loadMapImage()
  }
}

function getSceneTitle(sceneId) {
  const sceneInfo = getSceneInfo(sceneId)
  return sceneInfo?.label || props.scenesConfig?.sceneInfo?.[sceneId] || sceneId
}

function updateCurrentMap(sceneId) {
  const newMapId = getMapIdForScene(sceneId)
  if (newMapId !== currentMapId.value) {
    switchToMap(newMapId)
  }
}

async function loadSceneMarkers() {
  try {
    const markersUrl = `${window.appConfig?.apiUrl || ''}/static/virtual_tour/BBS-scene-markers.json`
    const response = await fetch(markersUrl)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()

    if (data.maps && data.scenes && typeof data.scenes === 'object') {
      const firstSceneKey = Object.keys(data.scenes)[0]
      if (firstSceneKey && typeof data.scenes[firstSceneKey] === 'object' && !data.scenes[firstSceneKey].x) {
        mapsConfig.value = data
        const flatScenes = {}
        for (const floorScenes of Object.values(data.scenes)) {
          Object.assign(flatScenes, floorScenes)
        }
        sceneMarkers.value = flatScenes
      } else {
        mapsConfig.value = data
        sceneMarkers.value = data.scenes
      }
      const firstMapId = Object.keys(data.maps)[0]
      if (firstMapId) currentMapId.value = firstMapId
    } else {
      sceneMarkers.value = data
      mapsConfig.value = {
        maps: { 'map1': { name: 'Default Floor Plan', image: '/static/virtual_tour/3f_template_img/map-1f.png', scenes: Object.keys(data) } },
        scenes: { 'floor1': data }
      }
      currentMapId.value = 'map1'
    }
  } catch (error) {
    console.error('Error loading scene markers:', error)
    mapsConfig.value = { maps: { 'map1': { name: 'Default Floor Plan', image: '/static/virtual_tour/3f_template_img/map-1f.png', scenes: [] } }, scenes: { 'floor1': {} } }
    sceneMarkers.value = {}
    currentMapId.value = 'map1'
  }
}

defineExpose({ updateCurrentMap, switchToMap })

watch(() => props.currentSceneId, (newSceneId) => {
  updateCurrentMap(newSceneId)
})

onMounted(async () => {
  await loadSceneMarkers()
  loadMapImage()
  if (props.scenesConfig?.minimap) {
    minimapConfig.value = { ...minimapConfig.value, ...props.scenesConfig.minimap }
  }
})
</script>

<style scoped>
/* Minimap Container */
.minimap-container {
  position: fixed;
  top: 3em;
  right: 2.3%;
  background: rgb(89 34 81 / 40%);
  z-index: 3;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  width: 27%;
  max-height: fit-content;
  animation: slideInRight 0.3s ease-out;
}

.minimap-container.expanded {
  width: 95%;
  user-select: none;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
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

/* *** THÊM MỚI: Style cho nhóm tiêu đề *** */
.header-title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
  overflow: hidden;
}

.active-scene-label {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.minimap-controls {
  display: flex;
  gap: 8px;
}

/* Minimap Content */
.minimap-content {
  position: relative;
  height: fit-content;
  overflow: hidden;
}

.minimap-image {
  width: 100%;
  height: 17em;
  object-fit: unset;
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
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
</style>