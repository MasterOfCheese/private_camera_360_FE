<template>
  <div
    class="flex flex-col h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800"
  >
    <CCTV_MonitoringHeader />
    <div class="flex flex-1 overflow-hidden">
      <CCTV_MonitoringSidebar />
      <div class="flex-1 overflow-y-auto p-4 md:p-6 h-fit">
        <CCTV_MonitoringCamera />
      </div>
    </div>
  </div>
</template>

<script setup>
import CCTV_MonitoringHeader from '@/components/cctv/CCTV_MonitoringHeader.vue'
import CCTV_MonitoringSidebar from '@/components/cctv/CCTV_MonitoringSidebar.vue'
import CCTV_MonitoringCamera from '@/components/cctv/CCTV_MonitoringCamera.vue'
</script>
