<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
    :class="show ? 'opacity-100' : 'opacity-0 pointer-events-none'"
  >
    <div
      class="bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out"
      :class="show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
    >
      <div class="p-6 md:p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">{{ formTitle }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-white transition-colors text-3xl px-4 py-2 cursor-pointer">
            ×
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div
            v-if="submitError"
            class="mb-4 p-3 bg-red-900/40 text-red-300 border border-red-700 rounded-md text-sm"
          >
            {{ submitError }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label for="name" class="block text-sm font-medium text-blue-300 mb-1">Name *</label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                required
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label for="location" class="block text-sm font-medium text-blue-300 mb-1"
                >Location</label
              >
              <input
                type="text"
                id="location"
                v-model="formData.location"
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div class="md:col-span-2">
              <label for="preview_image_url" class="block text-sm font-medium text-blue-300 mb-1"
                >Preview Image URL</label
              >
              <input
                type="url"
                id="preview_image_url"
                v-model="formData.preview_image_url"
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label for="webrtc_ip" class="block text-sm font-medium text-blue-300 mb-1"
                >WebRTC IP (Default quality) *</label
              >
              <input
                type="url"
                id="webrtc_ip"
                v-model="formData.webrtc_ip"
                required
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label for="webrtc_ip_low" class="block text-sm font-medium text-blue-300 mb-1"
                >WebRTC IP (Low Quality)</label
              >
              <input
                type="url"
                id="webrtc_ip_low"
                v-model="formData.webrtc_ip_low"
                :disabled="isSubmitting"
                placeholder="e.g., http://localhost:8889/LowIP"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label for="panorama" class="block text-sm font-medium text-blue-300 mb-1"
                >Panorama</label
              >
              <select
                id="panorama"
                v-model.number="formData.panorama"
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
              >
                <option :value="0" class="bg-gray-700">Disabled</option>
                <option :value="1" class="bg-gray-700">Enabled</option>
              </select>
            </div>
            <div class="md:col-span-2 flex items-center justify-between pt-2">
              <span class="text-md font-medium text-blue-300">Is this a Gate Camera?</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="formData.isGate"
                  class="sr-only peer"
                  :disabled="isSubmitting"
                />
                <div
                  class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>

            <div class="md:col-span-2" v-if="formData.isGate">
              <label
                for="gate_disable_alarm_url"
                class="block text-sm font-medium text-blue-300 mb-1"
                >Gate Disable Alarm URL</label
              >
              <input
                type="url"
                id="gate_disable_alarm_url"
                v-model="formData.gate_disable_alarm_url"
                :disabled="isSubmitting || !formData.isGate"
                placeholder="e.g., http://api.example.com/disable-alarm"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div class="md:col-span-2">
              <label for="statistic_api_url" class="block text-sm font-medium text-blue-300 mb-1"
                >Statistic API URL</label
              >
              <input
                type="url"
                id="statistic_api_url"
                v-model="formData.statistic_api_url"
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div class="md:col-span-2">
              <label for="eventlog_api_url" class="block text-sm font-medium text-blue-300 mb-1"
                >Event Log API URL</label
              >
              <input
                type="url"
                id="eventlog_api_url"
                v-model="formData.eventlog_api_url"
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div class="md:col-span-2">
              <label for="fallback_video_url" class="block text-sm font-medium text-blue-300 mb-1"
                >Fallback Video URL</label
              >
              <input
                type="url"
                id="fallback_video_url"
                v-model="formData.fallback_video_url"
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-blue-300 mb-2">Tags</label>
              <div v-if="isLoadingTags" class="text-gray-400">Loading tags...</div>
              <div v-else-if="fetchTagsError" class="text-red-400">{{ fetchTagsError }}</div>
              <div v-else-if="availableTags.length === 0" class="text-gray-400">
                No tags available.
              </div>
              <div
                v-else
                class="max-h-40 overflow-y-auto p-3 bg-white/5 rounded-lg border border-white/10 grid gap-x-4 gap-y-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 scrollbar-thin scrollbar-thumb-blue-700/50 scrollbar-track-transparent"
              >
                <div v-for="tag in availableTags" :key="tag.id" class="flex items-center">
                  <input
                    type="checkbox"
                    :id="`tag-${tag.id}`"
                    :value="tag"
                    :checked="isTagSelected(tag.id)"
                    @change="handleTagChange(tag, $event)"
                    :disabled="isSubmitting"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/20 cursor-pointer flex-shrink-0"
                  />
                  <label
                    :for="`tag-${tag.id}`"
                    class="ml-2 block text-sm text-gray-200 cursor-pointer truncate"
                  >
                    {{ tag.tag_name }}
                  </label>
                </div>
              </div>
              <div
                class="mt-3 flex flex-wrap gap-2"
                v-if="formData.tags && formData.tags.length > 0"
              >
                <span class="text-xs font-medium text-blue-300 mr-1">Selected:</span>
                <span
                  v-for="selectedTag in formData.tags"
                  :key="selectedTag.id"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-800/60 text-blue-200"
                >
                  {{ selectedTag.tag_name }}
                </span>
              </div>
            </div>
          </div>

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
              :disabled="isSubmitting || isLoadingTags"
              class="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
  cameraData: Object,
  mode: {
    type: String,
    default: 'add',
  },
})

const emit = defineEmits(['close', 'save', 'error'])

const formData = ref({})
const availableTags = ref([])
const isLoadingTags = ref(false)
const fetchTagsError = ref(null)
const isSubmitting = ref(false)
const submitError = ref(null)

// --- Default Form Structure (Updated) ---
const defaultFormData = () => ({
  name: '',
  location: '',
  preview_image_url: '',
  webrtc_ip: '',
  webrtc_ip_low: '',
  panorama: 0,
  statistic_api_url: '',
  eventlog_api_url: '',
  fallback_video_url: '',
  isGate: false,
  gate_disable_alarm_url: '',
  tags: [],
})

// --- Fetch Available Tags ---
const fetchAvailableTags = async () => {
  // No change from your version, but ensure the API endpoint is /v1/tags/ (with trailing slash if needed)
  if (availableTags.value.length > 0 || isLoadingTags.value) return
  isLoadingTags.value = true
  fetchTagsError.value = null
  try {
    const apiUrl = window.appConfig?.apiUrl
    if (!apiUrl) throw new Error('API URL configuration is missing.')
    const tagsData = await fetchWrapper.get(`${apiUrl}/v1/tags/`) // Ensure trailing slash if your API needs it
    availableTags.value = tagsData
  } catch (error) {
    console.error('Failed to fetch available tags:', error)
    fetchTagsError.value = `Could not load tags: ${error.message || error}`
    availableTags.value = []
  } finally {
    isLoadingTags.value = false
  }
}

// --- Watcher (Updated for new fields) ---
watch(
  () => props.show,
  (newShow) => {
    submitError.value = null
    if (newShow) {
      if (!availableTags.value.length && !isLoadingTags.value) {
        // Fetch only if not already loading
        fetchAvailableTags()
      }
      if (props.mode === 'edit' && props.cameraData) {
        // Deep clone and ensure defaults for new fields if not present
        const clonedData = JSON.parse(JSON.stringify(props.cameraData))
        formData.value = {
          ...defaultFormData(), // Start with defaults to ensure all keys exist
          ...clonedData, // Override with actual data
        }
        // Ensure tags is an array
        if (!Array.isArray(formData.value.tags)) formData.value.tags = []
        // Normalize URL fields and panorama (as before)
        for (const key in formData.value) {
          if (key.endsWith('_url') && formData.value[key] === null) {
            formData.value[key] = ''
          }
          if (key === 'panorama' && typeof formData.value[key] === 'string') {
            formData.value[key] = parseInt(formData.value[key], 10) || 0
          }
        }
        // Ensure isGate is a boolean
        if (typeof formData.value.isGate !== 'boolean') {
          formData.value.isGate = !!formData.value.isGate // Coerce to boolean
        }
      } else {
        formData.value = defaultFormData()
      }
    }
  },
  { immediate: true },
)

// --- Tag Handling Logic (No change) ---
const isTagSelected = (tagId) => formData.value?.tags?.some((tag) => tag.id === tagId) ?? false
const handleTagChange = (tag, event) => {
  const isChecked = event.target.checked
  const currentTags = Array.isArray(formData.value.tags) ? formData.value.tags : []
  if (isChecked) {
    if (!currentTags.some((selectedTag) => selectedTag.id === tag.id)) {
      formData.value.tags = [...currentTags, { id: tag.id, tag_name: tag.tag_name }]
    }
  } else {
    formData.value.tags = currentTags.filter((selectedTag) => selectedTag.id !== tag.id)
  }
}

// --- Computed Properties (No change) ---
const formTitle = computed(() => (props.mode === 'add' ? 'Add New Camera' : 'Edit Camera'))
const saveButtonText = computed(() => {
  if (isSubmitting.value) {
    return props.mode === 'add' ? 'Adding...' : 'Saving...'
  }
  return props.mode === 'add' ? 'Add Camera' : 'Save Changes'
})

const closeModal = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}

// --- submitForm Function (Updated for new fields) ---
const submitForm = async () => {
  submitError.value = null
  isSubmitting.value = true

  const payload = { ...formData.value }
  payload.tag_ids = Array.isArray(payload.tags) ? payload.tags.map((tag) => tag.id) : []
  delete payload.tags

  // Normalize URL fields and panorama
  for (const key in payload) {
    if (key.endsWith('_url') && payload[key] === '') {
      payload[key] = null
    }
  }
  if (typeof payload.panorama !== 'number') {
    payload.panorama = parseInt(payload.panorama, 10) || 0
  }

  // Handle gate_disable_alarm_url: set to null if isGate is false or URL is empty
  if (!payload.isGate || payload.gate_disable_alarm_url === '') {
    payload.gate_disable_alarm_url = null
  }

  const cameraId = payload.id
  if (props.mode === 'add') {
    delete payload.id // ID should not be sent for new records
  }

  console.log('Prepared payload:', payload)

  // API URL determination (no change from your version)
  let apiBaseUrl = window.appConfig?.apiUrl
  if (!apiBaseUrl) {
    submitError.value = 'API URL configuration is missing.'
    isSubmitting.value = false
    return
  }
  let url = `${apiBaseUrl}/v1/cameras/` // Ensure trailing slash if your API needs it
  if (props.mode === 'edit' && cameraId) {
    url = `${url}${cameraId}/` // Ensure trailing slash for edit endpoint too
  } else if (props.mode === 'edit' && !cameraId) {
    submitError.value = 'Cannot edit camera: ID is missing.'
    isSubmitting.value = false
    return
  }

  // API Call (no change from your version, just ensuring payload is correct)
  try {
    let responseData
    if (props.mode === 'add') {
      responseData = await fetchWrapper.post(url, payload)
    } else {
      // mode === 'edit'
      responseData = await fetchWrapper.patch(url, payload) // Or .put
    }
    console.log('API Response:', responseData)
    emit('save', responseData) // Emit the actual response from the API (often the saved/updated object)
    // emit('close'); // Parent CameraManagement now closes the modal on successful save.
  } catch (error) {
    console.error('Failed to submit form:', error)
    submitError.value = `Submission failed: ${error.message || error}`
    emit('error', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Styles remain the same */
/* Style for scrollbar */
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

/* Style for select arrow */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Custom checkbox styles (from original, ensure they are as intended) */
input[type='checkbox'].flex-shrink-0 {
  /* More specific selector for tag checkboxes */
  appearance: none;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0;
  display: inline-block;
  position: relative;
  transition: background-color 0.2s ease-in-out;
}
input[type='checkbox'].flex-shrink-0:checked {
  background-color: #2563eb; /* Tailwind blue-600 */
  border-color: #2563eb;
}
input[type='checkbox'].flex-shrink-0:checked::before {
  content: '✓';
  display: block;
  position: absolute;
  top: -2px;
  left: 1px; /* Adjust checkmark */
  font-size: 0.8em;
  color: white;
  line-height: 1;
}
input[type='checkbox'].flex-shrink-0:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  --tw-ring-color: #3b82f6; /* Tailwind blue-500 */
  box-shadow: 0 0 0 2px var(--tw-ring-color);
}

/* Ensure scrollbar for tag list is styled */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.4);
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(59, 130, 246, 0.6);
}
</style>
