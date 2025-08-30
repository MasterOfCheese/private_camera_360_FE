import { defineStore } from 'pinia'
import { ref } from 'vue'

const PANO_SETTINGS_KEY = 'panoSettings'
const MAX_GRID_SIZE = 16
export const usePanoSettingStore = defineStore('panoSetting', () => {
  const defaultPanoSettings = {
    autoRotate: -2, // Optional: slow rotation
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    hfov: 100,
  }

  function loadPersistedPanoSettings() {
    const data = localStorage.getItem(PANO_SETTINGS_KEY)
    let loadedPanoSettings = {}
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (typeof parsed === 'object' && parsed !== null) {
          loadedPanoSettings = parsed
        }
      } catch (e) {
        console.error('Failed to parse panoSettings from localStorage', e)
      }
    }
    return loadedPanoSettings
  }

  function getPanoSettingFromID(id) {
    const panoSettings = loadPersistedPanoSettings()
    return panoSettings[id] || defaultPanoSettings
  }

  function setPanoSettingFromID(id, setting) {
    const panoSettings = loadPersistedPanoSettings()
    if (!panoSettings[id]) {
      panoSettings[id] = { ...defaultPanoSettings }
    }
    panoSettings[id] = { ...panoSettings[id], ...setting }
    localStorage.setItem(PANO_SETTINGS_KEY, JSON.stringify(panoSettings))
  }

  function saveToLocalStorage() {
    localStorage.setItem(PANO_SETTINGS_KEY, JSON.stringify(panoSettings.value))
  }

  return {
    defaultPanoSettings,
    loadPersistedPanoSettings,
    getPanoSettingFromID,
    setPanoSettingFromID,
    saveToLocalStorage,
  }
})
