<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-gray-200 p-8"
  >
    <h1 class="text-4xl font-bold mb-8 text-center text-white drop-shadow-lg">{{ $t('Settings') }}</h1>

    <!-- Tab Navigation -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="flex border-b border-gray-700">
        <button
          @click="activeTab = 'cameras'"
          :class="[
            'py-3 px-6 font-medium text-lg transition-colors duration-200 ease-in-out',
            activeTab === 'cameras'
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-gray-400 hover:text-gray-200 cursor-pointer',
          ]"
        >
          {{ $t('Cameras') }}
        </button>
        <button
          @click="activeTab = 'tags'"
          :class="[
            'py-3 px-6 font-medium text-lg transition-colors duration-200 ease-in-out',
            activeTab === 'tags'
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-gray-400 hover:text-gray-200 cursor-pointer',
          ]"
        >
          {{ $t('Tags') }}
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'py-3 px-6 font-medium text-lg transition-colors duration-200 ease-in-out',
            activeTab === 'users'
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-gray-400 hover:text-gray-200 cursor-pointer',
          ]"
        >
          {{ $t('Users') }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="max-w-6xl mx-auto relative">
      <!-- Keep-alive can be useful if you want to preserve state when switching tabs -->
      <!-- <keep-alive> -->
      <Transition name="slide-fade" mode="out-in">
        <component :is="activeTabComponent" />
      </Transition>
      <!-- </keep-alive> -->

      <!-- Or use v-if for simpler cases -->
      <!--
        <CameraManagement v-if="activeTab === 'cameras'" />
        <TagManagement v-if="activeTab === 'tags'" />
        <UserManagement v-if="activeTab === 'users'" />
        -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'

const activeTab = ref('cameras') // Default tab

// --- Option 1: Use defineAsyncComponent for lazy loading ---
const CameraManagement = defineAsyncComponent(
  () => import('@/components/camera_settings/CameraManagement.vue'), // Adjust path if needed
)

const TagManagement = defineAsyncComponent(
  () => import('@/components/tag_settings/TagManagement.vue'), // Adjust path if needed
)
const UserManagement = defineAsyncComponent(
  () => import('@/components/user_settings/UserManagement.vue'), // Adjust path if needed
)

const activeTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'tags':
      return TagManagement
    case 'users':
      return UserManagement
    case 'cameras':
    default:
      return CameraManagement
  }
})

// --- Option 2: Simple import (if not concerned about lazy loading) ---
/*
  import CameraManagement from '@/components/settings/CameraManagement.vue';
  import TagManagement from '@/components/settings/TagManagement.vue';
  import UserManagement from '@/components/settings/UserManagement.vue';
  
  const activeTabComponent = computed(() => {
    switch (activeTab.value) {
      case 'tags': return TagManagement;
      case 'users': return UserManagement;
      case 'cameras':
      default: return CameraManagement;
    }
  });
  */

// Note: Authentication logic might be needed here if you want to protect
// the entire settings area, or moved into individual components if
// permissions differ per tab.
</script>

<style scoped>
/* .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease; 
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
} */
/* Optional: Styles for other transitions can be added here too */
/* --- Slide-Fade Transition (Example) --- */

.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
/* Add any specific styles for the tab container if needed */
</style>
