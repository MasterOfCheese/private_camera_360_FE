<!-- UserManagement.vue -->
<template>
  <div>
    <!-- Title -->
    <div
      v-if="error"
      class="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6 text-center"
    >
      <h2 class="text-2xl font-semibold mb-4 text-blue-300">
        {{ t('userManagement.title', 'User Management') }}
      </h2>
      <p class="text-gray-400">
        {{ t('userManagement.description', 'Manage your application users here.') }}
      </p>
    </div>

    <!-- Loading/Error State -->
    <div v-if="isLoading" class="text-center py-10 text-gray-400">
      {{ t('userManagement.loading', 'Loading users...') }}
    </div>

    <div
      v-if="error"
      class="mb-4 text-center p-4 bg-red-900/30 text-red-300 border border-red-700 rounded-lg"
    >
      {{ getErrorMessage(error) }}
    </div>

    <!-- User List -->
    <template v-if="!isLoading && !error">
      <div class="mb-6 text-right">
        <button
          @click="openAddModal"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          {{ t('userManagement.add_user', 'Add New User') }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {{ t('userManagement.config_access', 'Config Access') }}:
                {{ user.config ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled') }}
              </span>
            </div>
          </div>

          <div class="p-5 border-t border-white/10 flex justify-end space-x-3 bg-white/5">
            <button
              @click="openEditModal(user)"
              class="text-sm bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-1 px-3 rounded-md transition duration-200"
            >
              {{ t('common.edit', 'Edit') }}
            </button>
            <button
              @click="handleDeleteUser(user.id)"
              class="text-sm bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded-md transition duration-200"
              :disabled="isDeleting === user.id"
            >
              {{ isDeleting === user.id ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete') }}
            </button>
          </div>
        </div>

        <!-- No Users Found -->
        <div
          v-if="!users || users.length === 0"
          class="col-span-full text-center py-10 bg-white/5 backdrop-blur-md rounded-lg border border-white/10"
        >
          <p class="text-gray-400">{{ t('userManagement.no_users', 'No users found.') }}</p>
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
import { fetchWrapper } from '@/helper'
import { useI18n } from 'vue-i18n'

// const { t } = useI18n()

const { t: rawT, messages, locale } = useI18n()

// ✅ Smart fallback t() – hoạt động giống $t trong template
function t(key, ...args) {
  const translated = rawT(key, ...args)
  if (translated !== key) return translated // đã dịch được (string)

  // fallback: tự resolve object từ messages (để đọc nested object)
  const dict = messages.value[locale.value]
  return key.split('.').reduce((obj, k) => obj?.[k], dict)
}

console.log('Current locale:', locale.value)
console.log('Messages:', messages.value)
console.log('Resolved:', t('userManagement.add_user'))


const UserForm = defineAsyncComponent(() => import('./UserForm.vue'))

const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const isDeleting = ref(null)

const isModalOpen = ref(false)
const modalMode = ref('add')
const currentUser = ref(null)

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

  // Structured API errors
  if (err.code) {
    switch (err.code) {
      case 'FORBIDDEN':
        return t('errors.forbidden', 'You do not have permission to perform this action.')
      case 'UNAUTHORIZED':
        return t('errors.unauthorized', 'Unauthorized access.')
      case 'UNKNOWN':
      default:
        return `${t('errors.load_users', 'Failed to load users:')} ${err.message || t('errors.unknown', 'Unknown error')}`
    }
  }

  // Simple string errors
  return typeof err === 'string' ? err : (err.message || t('errors.unknown', 'Unknown error'))
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
    error.value = err
    users.value = []
  } finally {
    isLoading.value = false
  }
}

// --- Modal Logic ---
const openAddModal = () => {
  modalMode.value = 'add'
  currentUser.value = { username: '', password: '', config: false }
  isModalOpen.value = true
}

const openEditModal = (user) => {
  modalMode.value = 'edit'
  currentUser.value = { ...user, password: '' }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  currentUser.value = null
}

const handleSaveUser = async () => {
  closeModal()
  await fetchUsers()
}

// --- Delete User ---
const handleDeleteUser = async (userId) => {
  if (!confirm(`${t('userManagement.confirm_delete', 'Are you sure you want to delete this user? This cannot be undone.')}`)) {
    return
  }

  const apiUrl = getApiUrl()
  if (!apiUrl) return

  isDeleting.value = userId
  error.value = null

  try {
    await fetchWrapper.delete(`${apiUrl}${userId}`)
    await fetchUsers()
  } catch (err) {
    console.error(`Failed to delete user ${userId}:`, err)
    error.value = err
  } finally {
    isDeleting.value = null
  }
}

onMounted(fetchUsers)
</script>


<style scoped>
/* Add specific styles if needed, but Tailwind classes should cover most */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
