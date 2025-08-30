// src/stores/gridStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

const LOCAL_STORAGE_KEY = 'gridCameraIds' // Use a specific key
const MAX_GRID_SIZE = 16

export const useGridStore = defineStore('grid', () => {
  // gridState still holds the full objects for rendering, or empty placeholders
  const gridState = ref([])

  // Loads ONLY the array of IDs/nulls from localStorage
  function loadPersistedIds() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    let loadedIds = []
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          loadedIds = parsed
        }
      } catch (e) {
        console.error('Failed to parse gridCameraIds from localStorage', e)
      }
    }

    // Ensure the array has exactly MAX_GRID_SIZE elements
    const persistedIds = new Array(MAX_GRID_SIZE).fill(null)
    for (let i = 0; i < MAX_GRID_SIZE; i++) {
      if (i < loadedIds.length && loadedIds[i] !== undefined) {
        persistedIds[i] = loadedIds[i] // Copy loaded ID if available
      }
    }
    // console.log('Loaded Persisted IDs (fixed size):', persistedIds);
    return persistedIds
  }

  // Saves the state by updating the full persisted array
  function saveToLocalStorage() {
    // 1. Load the *current* full persisted state (16 elements)
    const fullPersistedState = loadPersistedIds()

    // 2. Update the persisted state based on the *currently visible* gridState
    //    Only update slots that are currently visible (index < gridState.value.length)
    gridState.value.forEach((item, index) => {
      if (index < MAX_GRID_SIZE) {
        // Safety check, though index should be < gridState.length <= MAX_GRID_SIZE
        fullPersistedState[index] = item.status === 'filled' ? item.id : null
      }
    })

    // 3. Save the *entire updated* full state (16 elements) back
    // console.log('Saving Full Persisted State:', fullPersistedState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullPersistedState))
  }

  /**
   * Initializes or updates the gridState.
   * Uses persisted IDs to find and place cameras from the fresh allCamerasData list.
   * @param {number} count - The desired number of grid slots.
   * @param {Array} allCamerasData - The complete, fresh list of camera objects fetched from the backend.
   */
  function initializeGrid(count, allCamerasData = []) {
    const savedIds = loadPersistedIds()
    const newVisibleGrid = []
    const cameraMap = new Map(allCamerasData.map((cam) => [cam.id, cam])) // Create a Map for efficient lookup
    // console.log('all cameras: ', allCamerasData)

    const visibleCount = Math.min(count, MAX_GRID_SIZE)

    for (let i = 0; i < visibleCount; i++) {
      const savedId = savedIds[i] // Get the ID saved for this slot index

      if (savedId !== null && savedId !== undefined) {
        const matchingCamera = cameraMap.get(savedId) // Find the camera in the fresh data

        if (matchingCamera) {
          // Found the camera in the fresh data, use its latest details
          newVisibleGrid.push({ ...matchingCamera, status: 'filled' })
        } else {
          // ID was saved, but camera no longer exists in fresh data
          //   console.warn(`Camera ID ${savedId} from localStorage not found in fetched camera list.`)
          newVisibleGrid.push({ id: `empty-${i}`, status: 'empty' })
        }
      } else {
        // No ID saved for this slot, or it was explicitly null
        newVisibleGrid.push({ id: `empty-${i}`, status: 'empty' })
      }
    }
    gridState.value = newVisibleGrid
    // Note: We don't save here automatically. Saving happens via the watcher in the component.
  }

  // setGridSlot remains largely the same - it receives the full camera object
  function setGridSlot(index, cameraData) {
    if (index >= 0 && index < gridState.value.length && cameraData) {
      // 1. Create a shallow copy of the current grid array
      const newGrid = [...gridState.value]
      // 2. Modify the copy at the specific index
      newGrid[index] = { ...cameraData, status: 'filled' }
      // 3. Assign the new array back to gridState.value, changing the reference
      gridState.value = newGrid
    } else {
      console.warn(`Attempted to set invalid slot index ${index} or missing camera data.`)
    }
  }

  // removeCamera remains largely the same
  function removeCamera(cameraId) {
    const index = gridState.value.findIndex(
      (item) => item.status === 'filled' && item.id === cameraId,
    )
    if (index !== -1) {
      // 1. Create a shallow copy
      const newGrid = [...gridState.value]
      // 2. Modify the copy
      newGrid[index] = { id: `empty-${index}`, status: 'empty' }
      // 3. Assign the new array back, changing the reference
      gridState.value = newGrid
    }
  }

  // Explicitly expose only what's needed
  return {
    gridState,
    initializeGrid,
    setGridSlot,
    removeCamera,
    saveToLocalStorage, // The watcher calls this *new* version
    loadPersistedIds,
  }
})
