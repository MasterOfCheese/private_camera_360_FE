<template>
  <div
    class="flex flex-col h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800"
  >
    <CCTV_MonitoringHeader />
    <div class="flex flex-1">
      <CCTV_MonitoringSidebar />
      <div class="flex-1 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" class="" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import CCTV_MonitoringHeader from '@/components/cctv/CCTV_MonitoringHeader.vue'
import CCTV_MonitoringSidebar from '@/components/cctv/CCTV_MonitoringSidebar.vue'
import { onMounted } from 'vue'
import { fetchWrapper } from '@/helper'
const keepAlive = async () => {
  const res = await fetchWrapper.get(`${window.appConfig?.apiUrl}/v1/auth/users/me`)
}
onMounted(() => {
  keepAlive()
  setInterval(() => {
    keepAlive()
  }, 3600000) // 1 minute interval
})
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
/* .flex-1 {
  overflow: auto!important;
} */

.flex.flex-1 {
    overflow: hidden;
}
</style>
