<template>
  <div>
    <div
      v-if="error"
      class="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6 text-center"
    >
    <h2 class="text-2xl font-semibold mb-4 text-blue-300">
      {{ $t('userManagement.title') }}
    </h2>
    <p class="text-gray-400">
      {{ $t('userManagement.description') }}
    </p>
      <!-- TODO: Add User list, add/edit/delete buttons, and potentially a modal -->
    </div>
    <!-- Add User Button -->

    <!-- Loading/Error State -->
    <div v-if="isLoading" class="text-center py-10 text-gray-400">Loading users...</div>
    <div
      v-if="error"
      class="mb-4 text-center p-4 bg-red-900/30 text-red-300 border border-red-700 rounded-lg"
    >
      {{ getErrorMessage(error) }}
    </div>
    <template v-if="!isLoading && !error">
      <div class="mb-6 text-right">
        <button
          @click="openAddModal"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Add New User
        </button>
      </div>
      <!-- User List -->
      <div v-if="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="user in users"
          :key="user.id"
          class="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden border border-white/20 transform transition duration-300 hover:scale-105 hover:shadow-xl flex flex-col"
        >
          <div class="p-5 flex-grow">
            <h3 class="text-xl font-semibold text-white mb-2 truncate" :title="user.username">
              {{ user.username }}
            </h3>
            <p class="text-sm text-blue-300 mb-3">ID: {{ user.id }}</p>

            <div class="text-xs mb-4">
              <span
                :class="[
                  'font-bold px-2 py-1 rounded-full inline-block',
                  user.config ? 'bg-green-200 text-green-900' : 'bg-gray-300 text-gray-800',
                ]"
              >
                Config Access: {{ user.config ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <!-- Note: Password hash is intentionally not displayed -->
          </div>
          <div class="p-5 border-t border-white/10 flex justify-end space-x-3 bg-white/5">
            <button
              @click="openEditModal(user)"
              class="text-sm bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-1 px-3 rounded-md transition duration-200"
            >
              Edit
            </button>
            <button
              @click="handleDeleteUser(user.id)"
              class="text-sm bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded-md transition duration-200"
              :disabled="isDeleting === user.id"
            >
              {{ isDeleting === user.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>

        <!-- No Users Found -->
        <div
          v-if="!users || users.length === 0"
          class="col-span-full text-center py-10 bg-white/5 backdrop-blur-md rounded-lg border border-white/10"
        >
          <p class="text-gray-400">{{ $t('userManagement.no_users') }}</p>
        </div>
      </div>
    </template>

    <!-- User Form Modal -->
    <UserForm
      v-if="isModalOpen"
      :show="isModalOpen"
      :user-data="currentUser"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSaveUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { fetchWrapper } from '@/helper' // Adjust path if needed
// Assuming useAuthStore might be needed for permissions later, but not strictly for basic CRUD yet
// import { useAuthStore } from '@/stores/authStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const UserForm = defineAsyncComponent(() => import('./UserForm.vue')) // Adjust path if needed

const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const isDeleting = ref(null) // Track which user ID is being deleted

// Modal State
const isModalOpen = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const currentUser = ref(null) // User data for the form

const getApiUrl = () => {
  const url = window.appConfig?.apiUrl
  if (!url) {
    console.error('API URL configuration is missing.')
    error.value = 'API URL configuration is missing.'
    return null
  }
  return `${url}/v1/users/`
}

// --- Error Message Handler ---
const getErrorMessage = (err) => {
  if (!err) return ''
  
  // Handle structured error from fetch-wrapper
  if (err.code) {
    switch (err.code) {
      case 'FORBIDDEN':
        return t('errors.forbidden')
      case 'UNAUTHORIZED':
        return t('errors.unauthorized')
      case 'UNKNOWN':
      default:
        // For unknown errors, show the message with translated prefix
        return `${t('errors.load_users')} ${err.message || t('errors.unknown')}`
    }
  }
  
  // Handle simple string errors (fallback)
  return typeof err === 'string' ? err : (err.message || t('errors.unknown'))
}

// --- Fetch Users ---
const fetchUsers = async () => {
  isLoading.value = true
  error.value = null
  const apiUrl = getApiUrl()
  if (!apiUrl) {
    isLoading.value = false
    return
  }

  try {
    const response = await fetchWrapper.get(apiUrl)
    users.value = response
  } catch (err) {
    console.error('Failed to fetch users:', err)
    error.value = err // Store the full error object
    users.value = [] // Clear users on error
  } finally {
    isLoading.value = false
  }
}

// --- Modal Handling ---
const openAddModal = () => {
  modalMode.value = 'add'
  currentUser.value = { username: '', password: '', config: false } // Default structure for add
  isModalOpen.value = true
}

const openEditModal = (user) => {
  modalMode.value = 'edit'
  // Clone user data, exclude password hash for the form
  currentUser.value = { ...user, password: '' } // Password field in form is for *new* password
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  currentUser.value = null
}

// --- Save User (Triggered by UserForm's @save event) ---
const handleSaveUser = async () => {
  // The actual API call (POST/PATCH) is now handled within UserForm.
  // We just need to close the modal and refresh the list.
  console.log('User save operation completed by form, refreshing list...')
  closeModal()
  await fetchUsers() // Fetch the updated list
}

// --- Delete User ---
const handleDeleteUser = async (userId) => {
  if (!confirm(`Are you sure you want to delete user with ID ${userId}? This cannot be undone.`)) {
    return
  }

  const apiUrl = getApiUrl()
  if (!apiUrl) return // Error already handled by getApiUrl

  isDeleting.value = userId // Set loading state for the specific button
  error.value = null // Clear previous errors

  try {
    await fetchWrapper.delete(`${apiUrl}${userId}`)
    console.log(`User ${userId} deleted successfully.`)
    // Refresh list - could also filter locally for slightly faster UI update
    await fetchUsers()
    // users.value = users.value.filter(u => u.id !== userId); // Alternative: local filter
  } catch (err) {
    console.error(`Failed to delete user ${userId}:`, err)
    error.value = err // Store the full error object
  } finally {
    isDeleting.value = null // Clear loading state
  }
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Add specific styles if needed, but Tailwind classes should cover most */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
