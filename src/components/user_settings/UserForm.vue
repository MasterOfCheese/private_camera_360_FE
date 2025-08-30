<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
    :class="show ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    @click.self="closeModal"
  >
    <div
      class="bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out"
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
            {{ submitError }}
          </div>

          <div class="space-y-5 mb-6">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-blue-300 mb-1"
                >Username *</label
              >
              <input
                type="text"
                id="username"
                v-model.trim="formData.username"
                required
                :disabled="isSubmitting"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-70"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-blue-300 mb-1">
                {{ mode === 'add' ? 'Password *' : 'New Password (leave blank to keep current)' }}
              </label>
              <input
                type="password"
                id="password"
                v-model="formData.password"
                :required="mode === 'add'"
                :disabled="isSubmitting"
                autocomplete="new-password"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-70"
              />
              <!-- Basic validation message for add mode -->
              <p
                v-if="mode === 'add' && !formData.password && formAttempted"
                class="text-xs text-red-400 mt-1"
              >
                Password is required.
              </p>
            </div>

            <!-- Confirm Password (Optional but recommended when setting/changing) -->
            <div v-if="formData.password || mode === 'add'">
              <label for="confirmPassword" class="block text-sm font-medium text-blue-300 mb-1"
                >Confirm Password *</label
              >
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                :required="formData.password || mode === 'add'"
                :disabled="isSubmitting"
                autocomplete="new-password"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-70"
              />
              <p
                v-if="passwordsMismatch && (formData.password || confirmPassword)"
                class="text-xs text-red-400 mt-1"
              >
                Passwords do not match.
              </p>
            </div>

            <!-- Config Access -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-sm font-medium text-blue-300">Enable Configuration Access?</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="formData.config"
                  class="sr-only peer"
                  :disabled="isSubmitting"
                />
                <div
                  class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </label>
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
              :disabled="
                isSubmitting || (passwordsMismatch && (formData.password || confirmPassword))
              "
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
import { fetchWrapper } from '@/helper' // Adjust path if needed

const props = defineProps({
  show: Boolean,
  userData: Object, // Expects { id?, username, password(empty), config }
  mode: {
    type: String, // 'add' or 'edit'
    default: 'add',
  },
})

const emit = defineEmits(['close', 'save', 'error'])

// Form State
const formData = ref({ username: '', password: '', config: false })
const confirmPassword = ref('')
const isSubmitting = ref(false)
const submitError = ref(null)
const formAttempted = ref(false) // To show validation only after trying to submit

// --- Watch for modal opening/data changes ---
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      formAttempted.value = false // Reset validation trigger
      submitError.value = null // Clear previous errors
      confirmPassword.value = '' // Clear confirm password
      if (props.mode === 'edit' && props.userData) {
        // Initialize form with existing data (excluding password hash)
        formData.value = {
          id: props.userData.id,
          username: props.userData.username || '',
          password: '', // Password field is for NEW password only
          config: props.userData.config ?? false,
        }
      } else {
        // Initialize form with defaults for adding
        formData.value = { username: '', password: '', config: false }
      }
    }
  },
  { immediate: true },
)

// --- Computed Properties ---
const formTitle = computed(() => (props.mode === 'add' ? 'Add New User' : 'Edit User'))
const saveButtonText = computed(() => {
  if (isSubmitting.value) {
    return props.mode === 'add' ? 'Adding...' : 'Saving...'
  }
  return props.mode === 'add' ? 'Add User' : 'Save Changes'
})

const passwordsMismatch = computed(() => {
  // Only check if a password has been entered in the main field or confirm field
  if (formData.value.password || confirmPassword.value) {
    return formData.value.password !== confirmPassword.value
  }
  return false // Don't show mismatch if both are empty
})

// --- API URL Helper ---
const getApiUrl = (userId = null) => {
  const baseApiUrl = window.appConfig?.apiUrl
  if (!baseApiUrl) {
    throw new Error('API URL configuration is missing.')
  }
  let url = `${baseApiUrl}/v1/users/`
  if (userId) {
    url += `${userId}`
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
  formAttempted.value = true // Mark that submission was attempted
  submitError.value = null

  // Basic Validations
  if (!formData.value.username) {
    submitError.value = 'Username is required.'
    return
  }
  if (props.mode === 'add' && !formData.value.password) {
    submitError.value = 'Password is required.'
    return
  }
  if (formData.value.password && passwordsMismatch.value) {
    submitError.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true

  // Prepare Payload
  const payload = {
    username: formData.value.username,
    config: formData.value.config,
  }

  // Only include password if it's being set (add mode) or changed (edit mode)
  if (formData.value.password) {
    payload.hash_password = formData.value.password
  }

  try {
    let url
    let responseData

    if (props.mode === 'add') {
      url = getApiUrl()
      console.log('Submitting POST to:', url, 'Payload:', payload)
      responseData = await fetchWrapper.post(url, payload)
    } else {
      // mode === 'edit'
      if (!formData.value.id) throw new Error('User ID is missing for update.')
      url = getApiUrl(formData.value.id)
      // Use PATCH for partial updates, PUT if your API expects the full resource
      // If using PATCH and password wasn't changed, payload doesn't include it.
      console.log('Submitting PATCH to:', url, 'Payload:', payload)
      responseData = await fetchWrapper.patch(url, payload) // Or .put
    }

    console.log('API Response:', responseData)
    emit('save') // Signal success to parent (which will refetch)
    // emit('close'); // Parent now closes modal in handleSaveUser
  } catch (error) {
    console.error('Failed to submit user form:', error)
    submitError.value = error.message || 'An unexpected error occurred.'
    emit('error', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Add styles for the toggle switch if needed, Tailwind classes handle it */
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
