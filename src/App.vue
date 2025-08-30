<template>
  <div
    class="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800"
  >
    <router-view v-slot="{ Component }">
      <transition :name="animate" mode="out-in">
        <component :is="Component" class="absolute w-full h-full" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { watch, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const animate = ref('slide-up')
const route = useRoute()
watch(
  () => route.path,
  (newPath, oldPath) => {
    // Handle path change if needed
    if (oldPath === '/login' && newPath !== '/login') {
      // console.log('Login successful, navigating to:', newPath)
      animate.value = 'unlock'
    } else if (oldPath !== undefined && oldPath !== '/' && oldPath !== newPath) {
      // console.log('Navigating from:', oldPath, 'to:', newPath)
      animate.value = 'slide-up'
    } else if (oldPath === undefined) {
      animate.value = 'none'
    }
  },
  { immediate: true },
)
</script>

<style>
/* Swipe up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
  position: absolute;
  width: 100%;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.slide-up-leave-to {
  transform: translateY(-30%);
  opacity: 0;
}

/* You can also define a "none" or default fade */
.none-enter-active,
.none-leave-active {
  transition: none;
}
.unlock-enter-active,
.unlock-leave-active {
  transition: all 0.4s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}

.unlock-enter-from {
  transform: scale(1.2);
  opacity: 0;
}
.unlock-enter-to {
  transform: scale(1);
  opacity: 1;
}

.unlock-leave-from {
  transform: scale(1);
  opacity: 1;
}
.unlock-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
