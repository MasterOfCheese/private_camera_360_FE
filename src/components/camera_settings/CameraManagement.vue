<template>
  <div>
    <div class="mb-6 text-right">
      <button
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        {{ $t('Add_New_Camera') }}
      </button>
    </div>

    <CameraList
      :cameras="cameras"
      @edit-camera="openEditModal"
      @delete-camera="handleDeleteCamera"
    />

    <CameraForm
      v-if="isModalOpen"
      :show="isModalOpen"
      :camera-data="currentCamera"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSaveCamera"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// Adjust paths according to your project structure
import CameraList from '@/components/camera_settings/CameraList.vue'
import CameraForm from '@/components/camera_settings/CameraForm1.vue'
import { fetchWrapper } from '@/helper'
import { useAuthStore } from '@/stores/authStore'

const cameras = ref([])
const authStore = useAuthStore()

const readCameraSetings = async () => {
  // Basic check, enhance as needed
  if (!authStore.user) {
    console.warn('Attempting to fetch cameras without authenticated user. Trying login...')
    try {
      await authStore.login('admin', 'admin') // Consider making credentials dynamic or handling errors better
      console.log('Login successful, fetching cameras...')
    } catch (error) {
      console.error('Auto-login failed:', error)
      // Maybe show an error message to the user here
      return // Stop fetching if login fails
    }
  }

  // Ensure apiUrl is available
  const apiUrl = window.appConfig?.apiUrl
  if (!apiUrl) {
    console.error('API URL configuration is missing.')
    // Handle this error appropriately, maybe show a message
    return
  }

  try {
    const response = await fetchWrapper.get(`${apiUrl}/v1/cameras/`)
    cameras.value = response
    console.log('Cameras fetched:', cameras.value)
  } catch (error) {
    console.error('Failed to fetch cameras:', error)
    // Display error to the user, e.g., using a toast notification
  }
}

// Trạng thái modal
const isModalOpen = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const currentCamera = ref(null) // Dữ liệu camera cho form edit

// Hàm mở modal để thêm camera
const openAddModal = () => {
  modalMode.value = 'add'
  currentCamera.value = {
    name: '',
    location: '',
    preview_image_url: '',
    webrtc_ip: '',
    panorama: 0,
    statistic_api_url: '',
    eventlog_api_url: '',
    fallback_video_url: null,
    tags: [],
  }
  isModalOpen.value = true
}

// Hàm mở modal để sửa camera
const openEditModal = (camera) => {
  modalMode.value = 'edit'
  currentCamera.value = JSON.parse(JSON.stringify(camera))
  isModalOpen.value = true
}

// Hàm đóng modal
const closeModal = () => {
  isModalOpen.value = false
  currentCamera.value = null
}

// Hàm xử lý lưu camera (Thêm hoặc Cập nhật)
const handleSaveCamera = async (/* cameraData */) => {
  // The CameraForm now handles the API call directly.
  // We just need to refresh the list after the modal closes successfully.
  // The 'save' event in the original code was emitting the *form* data,
  // but the actual save happened inside the form component.
  // So, we just need to reload the list.
  console.log('Camera save operation completed by form, refreshing list...')
  closeModal() // Close modal first
  await readCameraSetings() // Fetch the updated list
}

// Hàm xử lý xóa camera
const handleDeleteCamera = async (cameraId) => {
  if (confirm(`Are you sure you want to delete camera with ID ${cameraId}?`)) {
    const apiUrl = window.appConfig?.apiUrl
    if (!apiUrl) {
      console.error('API URL configuration is missing for delete.')
      return
    }
    try {
      await fetchWrapper.delete(`${apiUrl}/v1/cameras/${cameraId}`)
      console.log('Camera deleted successfully, refreshing list...')
      // Refresh the list instead of filtering manually
      await readCameraSetings()
    } catch (error) {
      console.error('Failed to delete camera:', error)
      // Optionally show an error message to the user
    }
  }
}

// Fetch cameras when the component is mounted
onMounted(() => {
  readCameraSetings()
})
</script>

<style scoped>
/* No specific styles needed here unless you want to override */
</style>
