<!-- CaptureErrorForm.vue -->
<template>
  <transition name="slide-fade">
    <div v-if="isVisible" class="absolute top-0 right-0 h-full w-125 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl z-50 flex flex-col">
      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
        <p class="text-white font-bold text-2xl">Detail</p>
        <!-- Image Preview -->
        <div v-if="capturedImage" class="relative">
          <label class="block text-gray-300 text-sm font-medium mb-2">Captured Image</label>
          <div class="relative overflow-hidde">
            <img 
              :src="capturedImage" 
              alt="Captured frame" 
              class="w-full h-48 object-cover"
            />
          </div>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Location</label>
          <input 
            type="text" 
            v-model="formData.location"
            readonly
            class="w-full px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none"
          />
        </div>

        <!-- Owner -->
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Owner</label>
          <input 
            type="text" 
            v-model="formData.owner"
            readonly
            class="w-full px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none"
          />
        </div>

        <!-- Error Name -->
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">
            Error Name
          </label>
          <input 
            type="text" 
            v-model="formData.errorName"
            placeholder="Enter error description"
            class="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none placeholder-gray-400"
          />
        </div>

        <!-- Timestamp -->
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Time</label>
          <input 
            type="text" 
            v-model="formattedTimestamp"
            readonly
            class="w-full px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none"
          />
        </div>

        <!-- Footer Actions -->
      <div class="pt-20 flex gap-3">
        <button 
          @click="handleCancel"
          class="flex-1 px-4 py-2.5 cursor-pointer bg-gray-400 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleSave"
          :disabled="isSaving || !formData.errorName"
          class="flex-1 px-4 py-2.5 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span v-if="isSaving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  capturedImage: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: ''
  },
  owner: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const isSaving = ref(false)
const formData = ref({
  location: '',
  owner: '',
  errorName: '',
  timestamp: '',
  imageFile: null
})

// Watch for prop changes to update form
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    formData.value = {
      location: props.location || '',
      owner: props.owner || '',
      errorName: '',
      timestamp: new Date().toISOString(),
      imageFile: props.capturedImage
    }
  }
})

watch(() => props.capturedImage, (newVal) => {
  if (newVal) {
    formData.value.capturedImage = newVal
    formData.value.timestamp = new Date().toISOString()
  }
})

watch(() => props.location, (newVal) => {
  formData.value.location = newVal || ''
})

watch(() => props.owner, (newVal) => {
  formData.value.owner = newVal || ''
})

const formattedTimestamp = computed(() => {
  // Nếu chưa có timestamp thì trả về chuỗi rỗng
  if (!formData.value.timestamp) {
    return '';
  }

  // Chuyển chuỗi ISO thành đối tượng Date
  const date = new Date(formData.value.timestamp);

  // Tùy chọn định dạng để hiển thị theo kiểu Việt Nam (ngày/tháng/năm, 24h)
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Sử dụng định dạng 24 giờ
  };

  // Trả về chuỗi đã được định dạng theo múi giờ của trình duyệt người dùng
  return date.toLocaleString('vi-VN', options);
});

const handleCancel = () => {
  formData.value = {
    location: '',
    owner: '',
    errorName: '',
    timestamp: '',
    imageFile: null
  }
  emit('close')
}

const handleSave = async () => {
  if (!formData.value.errorName) {
    alert('Please enter an error name')
    return
  }

  isSaving.value = true

  try {
    // Convert base64 image to blob
    const base64Data = formData.value.imageFile.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/png' })

    // Create FormData
    const formDataToSend = new FormData()
    formDataToSend.append('location', formData.value.location)
    formDataToSend.append('owner', formData.value.owner || '')
    formDataToSend.append('error_name', formData.value.errorName)
    formDataToSend.append('timestamp', formData.value.timestamp)
    formDataToSend.append('image_file', blob, 'capture.png')

    // Send to API
    const apiUrl = `${window.appConfig?.apiUrl || ''}/v1/cameras/error-detail`
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formDataToSend
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Save successful:', result)
    
    emit('save', result)
    handleCancel()
  } catch (error) {
    console.error('Error saving:', error)
    alert('Failed to save error report. Please try again.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* .slide-fade-enter-active {
  transition: all 0.3s ease-out;
} */

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>