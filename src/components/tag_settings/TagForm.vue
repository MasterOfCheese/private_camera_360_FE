<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
    :class="show ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    @click.self="closeModal"
  >
    <div
      class="bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out"
      :class="show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
    >
      <div class="p-6 md:p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">{{ formTitle }}</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <!-- Submission Error Display -->
          <div
            v-if="submitError"
            class="mb-4 p-3 bg-red-900/40 text-red-300 border border-red-700 rounded-md text-sm"
          >
            {{ getSubmitErrorMessage(submitError) }}
          </div>

          <div class="space-y-5 mb-6">
            <!-- Tag Name -->
            <div>
              <label for="tag_name" class="block text-sm font-medium text-blue-300 mb-1">
                Tag Name *
              </label>
              <input
                type="text"
                id="tag_name"
                v-model.trim="formData.tag_name"
                required
                :disabled="isSubmitting"
                placeholder="Enter tag name"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-70"
              />
              <p v-if="!formData.tag_name && formAttempted" class="text-xs text-red-400 mt-1">
                Tag name is required.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              @click="closeModal"
              :disabled="isSubmitting"
              class="py-2 px-5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg font-medium transition duration-200 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ saveButtonText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { fetchWrapper } from '@/helper'

const props = defineProps({
  show: Boolean,
  tagData: Object, // Expects { id?, tag_name }
  mode: {
    type: String, // 'add' or 'edit'
    default: 'add',
  },
})

const emit = defineEmits(['close', 'save', 'error'])

// Form State
const formData = ref({ tag_name: '' })
const isSubmitting = ref(false)
const submitError = ref(null)
const formAttempted = ref(false)

// --- Watch for modal opening/data changes ---
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      formAttempted.value = false
      submitError.value = null
      if (props.mode === 'edit' && props.tagData) {
        formData.value = { ...props.tagData }
      } else {
        formData.value = { tag_name: '' }
      }
    }
  },
  { immediate: true },
)

// --- Computed Properties ---
const formTitle = computed(() => (props.mode === 'add' ? 'Add New Tag' : 'Edit Tag'))

const saveButtonText = computed(() => {
  if (isSubmitting.value) {
    return props.mode === 'add' ? 'Adding...' : 'Saving...'
  }
  return props.mode === 'add' ? 'Add Tag' : 'Save Changes'
})

// --- Error Message Handler ---
const getSubmitErrorMessage = (err) => {
  if (!err) return ''
  if (typeof err === 'object' && err.code) {
    switch (err.code) {
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.'
      case 'UNAUTHORIZED':
        return 'Unauthorized access.'
      case 'UNKNOWN':
      default:
        return err.message || 'Unknown error occurred.'
    }
  }
  return typeof err === 'string' ? err : (err.message || 'Unknown error.')
}

// --- API URL Helper ---
const getApiUrl = (tagId = null) => {
  const baseApiUrl = window.appConfig?.apiUrl
  if (!baseApiUrl) {
    throw new Error('API URL configuration is missing.')
  }
  let url = `${baseApiUrl}/v1/tags/`
  if (tagId) {
    url += `${tagId}`
  }
  return url
}

// --- Modal Actions ---
const closeModal = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}

// --- Form Submission ---
const submitForm = async () => {
  formAttempted.value = true
  submitError.value = null

  if (!formData.value.tag_name) {
    submitError.value = 'Tag name is required.'
    return
  }

  isSubmitting.value = true
  const payload = { tag_name: formData.value.tag_name }

  try {
    let url
    let responseData

    if (props.mode === 'add') {
      url = getApiUrl()
      console.log('Submitting POST to:', url, 'Payload:', payload)
      responseData = await fetchWrapper.post(url, payload)
    } else {
      if (!formData.value.id) throw new Error('Tag ID is missing for update.')
      url = getApiUrl(formData.value.id)
      console.log('Submitting PATCH to:', url, 'Payload:', payload)
      responseData = await fetchWrapper.patch(url, payload)
    }

    console.log('API Response:', responseData)
    emit('save')
  } catch (error) {
    console.error('Failed to submit tag form:', error)
    submitError.value = error
    emit('error', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>


<style scoped>
/* Custom scrollbar styles from CameraForm1 can be added here if needed */
div[class*='max-h-']::-webkit-scrollbar {
  width: 6px;
}
div[class*='max-h-']::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
div[class*='max-h-']::-webkit-scrollbar-thumb {
  background-color: rgba(37, 99, 235, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>