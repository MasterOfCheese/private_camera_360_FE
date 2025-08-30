<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="camera in cameras"
      :key="camera.id"
      class="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden border border-white/20 transform transition duration-300 hover:scale-105 hover:shadow-xl"
    >
      <img
        :src="
          camera.preview_image_url ||
          'https://via.placeholder.com/400x200/1f2937/ffffff?text=No+Preview'
        "
        alt="Camera Preview"
        class="w-full h-48 object-cover"
      />
      <div class="p-5">
        <h3 class="text-xl font-semibold text-white mb-2">{{ camera.name }}</h3>
        <p class="text-sm text-blue-300 mb-3">
          ID: {{ camera.id }} | Location: {{ camera.location }}
        </p>

        <div class="text-xs text-gray-200 mb-3 space-y-2">
          <p>Live: {{ camera.webrtc_ip }}</p>
          <p
            :class="
              camera.panorama
                ? ' font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full inline-block'
                : ' font-bold bg-slate-200 text-slate-800 px-2 py-1 rounded-full inline-block'
            "
          >
            Panorama: {{ camera.panorama ? 'Enabled' : 'Disabled' }}
          </p>
        </div>

        <div v-if="camera.tags && camera.tags.length > 0" class="mb-4 flex flex-wrap gap-2">
          <span
            v-for="tag in camera.tags"
            :key="tag.id"
            class="text-xs bg-blue-800/50 text-blue-200 px-2 py-1 rounded-full"
          >
            {{ tag.tag_name }}
          </span>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('edit-camera', camera)"
            class="text-sm bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-1 px-3 rounded-md transition duration-200"
          >
            {{ $t('Edit') }}
          </button>
          <button
            @click="$emit('delete-camera', camera.id)"
            class="text-sm bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded-md transition duration-200"
          >
            {{ $t('delete')}}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="!cameras || cameras.length === 0"
      class="col-span-full text-center py-10 bg-white/5 backdrop-blur-md rounded-lg border border-white/10"
    >
      <p class="text-gray-400">No cameras found. Add a new one!</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cameras: {
    type: Array,
    required: true,
  },
})

// Xác định các sự kiện component có thể phát ra
defineEmits(['edit-camera', 'delete-camera'])
</script>

<style scoped>
/* CSS cho hiệu ứng kính mờ được xử lý bằng các class Tailwind:
     - bg-white/10: Nền trắng với độ trong suốt 10%
     - backdrop-blur-lg: Áp dụng bộ lọc làm mờ cho phần nền phía sau element
     - border border-white/20: Viền mỏng màu trắng trong suốt để tăng hiệu ứng cạnh kính
     - rounded-xl: Bo góc
     - shadow-lg: Đổ bóng
  */
</style>
