<template>
  <div>
    <!-- Add Tag Button -->
    <div class="mb-6 text-right">
      <button
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Add New Tag
      </button>
    </div>

    <!-- Loading/Error State -->
    <div v-if="isLoading" class="text-center py-10 text-gray-400">Loading tags...</div>
    <div
      v-if="error"
      class="mb-4 text-center p-4 bg-red-900/30 text-red-300 border border-red-700 rounded-lg"
    >
      Error loading tags: {{ error }}
    </div>

    <!-- Tag Grid (Adjusted Columns) -->
    <div
      v-if="!isLoading && !error"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-4"
    >
      <!-- Capped at 5 columns for xl and 2xl to ensure decent width -->
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden border border-white/20 transform transition duration-300 hover:scale-105 hover:shadow-xl flex flex-col group"
      >
        <div class="p-4 flex-grow flex items-center justify-between gap-x-2">
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold text-white truncate" :title="tag.tag_name">
              {{ tag.tag_name }}
            </h3>
            <p class="text-xs text-blue-300">ID: {{ tag.id }}</p>
          </div>

          <div
            class="flex-shrink-0 flex items-center space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
          >
            <button
              @click="openEditModal(tag)"
              title="Edit Tag"
              class="text-xs bg-yellow-600 hover:bg-yellow-500 text-white font-semibold p-1.5 rounded-md transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-4 h-4"
              >
                <path
                  d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"
                />
                <path
                  d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"
                />
              </svg>
            </button>

            <button
              @click="handleDeleteTag(tag.id)"
              title="Delete Tag"
              class="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold p-1.5 rounded-md transition duration-200"
              :disabled="isDeleting === tag.id"
            >
              <svg
                v-if="isDeleting !== tag.id"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-4 h-4"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.43l.84-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25-.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- No Tags Found -->
      <div
        v-if="!tags || tags.length === 0"
        class="col-span-full text-center py-10 bg-white/5 backdrop-blur-md rounded-lg border border-white/10"
      >
        <p class="text-gray-400">No tags found. Add a new one!</p>
      </div>
    </div>

    <!-- Tag Form Modal -->
    <TagForm
      v-if="isModalOpen"
      :show="isModalOpen"
      :tag-data="currentTag"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSaveTag"
    />
  </div>
</template>

<script setup>
// Script content remains the same as previous correct version
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { fetchWrapper } from '@/helper'

const TagForm = defineAsyncComponent(() => import('./TagForm.vue'))

const tags = ref([])
const isLoading = ref(false)
const error = ref(null)
const isDeleting = ref(null)

const isModalOpen = ref(false)
const modalMode = ref('add')
const currentTag = ref(null)

const getApiUrl = () => {
  const url = window.appConfig?.apiUrl
  if (!url) {
    console.error('API URL configuration is missing.')
    error.value = 'API URL configuration is missing.'
    return null
  }
  return `${url}/v1/tags/`
}

const fetchTags = async () => {
  isLoading.value = true
  error.value = null
  const apiUrl = getApiUrl()
  if (!apiUrl) {
    isLoading.value = false
    return
  }
  try {
    const response = await fetchWrapper.get(apiUrl)
    tags.value = response
  } catch (err) {
    console.error('Failed to fetch tags:', err)
    error.value = err.message || 'Could not load tags.'
    tags.value = []
  } finally {
    isLoading.value = false
  }
}

const openAddModal = () => {
  modalMode.value = 'add'
  currentTag.value = { tag_name: '' }
  isModalOpen.value = true
}

const openEditModal = (tag) => {
  modalMode.value = 'edit'
  currentTag.value = { ...tag }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  currentTag.value = null
}

const handleSaveTag = async () => {
  console.log('Tag save operation completed by form, refreshing list...')
  closeModal()
  await fetchTags()
}

const handleDeleteTag = async (tagId) => {
  const tagName = tags.value.find((t) => t.id === tagId)?.tag_name || tagId
  if (!confirm(`Are you sure you want to delete tag "${tagName}"? This cannot be undone.`)) {
    return
  }
  const apiUrl = getApiUrl()
  if (!apiUrl) return

  isDeleting.value = tagId
  error.value = null

  try {
    await fetchWrapper.delete(`${apiUrl}${tagId}`)
    console.log(`Tag ${tagId} deleted successfully.`)
    await fetchTags()
  } catch (err) {
    console.error(`Failed to delete tag ${tagId}:`, err)
    error.value = err.message || `Could not delete tag ${tagId}.`
  } finally {
    isDeleting.value = null
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
