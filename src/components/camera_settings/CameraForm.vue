<!-- <template>
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
        <h2 class="text-2xl font-bold text-white mb-6">{{ formTitle }}</h2>

        <form @submit.prevent="submitForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label for="name" class="block text-sm font-medium text-blue-300 mb-1">Name *</label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                required
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
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label for="webrtc_ip" class="block text-sm font-medium text-blue-300 mb-1"
                >WebRTC IP *</label
              >
              <input
                type="url"
                id="webrtc_ip"
                v-model="formData.webrtc_ip"
                required
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label for="panorama" class="block text-sm font-medium text-blue-300 mb-1"
                >Panorama</label
              >
              <select
                id="panorama"
                v-model="formData.panorama"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
              >
                <option :value="0" class="bg-gray-700">Disabled</option>
                <option :value="1" class="bg-gray-700">Enabled</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label for="statistic_api_url" class="block text-sm font-medium text-blue-300 mb-1"
                >Statistic API URL</label
              >
              <input
                type="url"
                id="statistic_api_url"
                v-model="formData.statistic_api_url"
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
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div class="md:col-span-2">
              <label for="tags" class="block text-sm font-medium text-blue-300 mb-1"
                >Tags (comma-separated)</label
              >
              <input
                type="text"
                id="tags"
                :value="tagsString"
                @input="updateTags"
                placeholder="e.g., panorama, abnormal detection"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="(tag, index) in formData.tags"
                  :key="index"
                  class="text-xs bg-blue-800/50 text-blue-200 px-2 py-1 rounded-full"
                >
                  {{ tag.tag_name }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeModal"
              class="py-2 px-5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition duration-200 shadow-md"
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

const props = defineProps({
  show: Boolean,
  cameraData: Object, // Dữ liệu camera hiện tại (null nếu là add mode)
  mode: {
    // 'add' or 'edit'
    type: String,
    default: 'add',
  },
})

const emit = defineEmits(['close', 'save'])

// Tạo một bản sao phản ứng (reactive copy) của dữ liệu camera để chỉnh sửa trong form
// Điều này ngăn chặn việc thay đổi trực tiếp props
const formData = ref({})

// Theo dõi sự thay đổi của props.cameraData để cập nhật formData
watch(
  () => props.cameraData,
  (newData) => {
    if (newData) {
      // Tạo một bản sao sâu để chỉnh sửa độc lập
      formData.value = JSON.parse(JSON.stringify(newData))
      // Đảm bảo trường tags luôn là một mảng
      if (!Array.isArray(formData.value.tags)) {
        formData.value.tags = []
      }
      // Chuyển đổi giá trị null thành chuỗi rỗng cho các input URL để tránh lỗi
      for (const key in formData.value) {
        if (key.endsWith('_url') && formData.value[key] === null) {
          formData.value[key] = ''
        }
      }
    } else {
      // Reset form nếu không có dữ liệu (ví dụ khi đóng modal)
      formData.value = { tags: [] } // Reset về đối tượng trống với mảng tags
    }
  },
  { immediate: true, deep: true },
) // immediate: chạy ngay lần đầu, deep: theo dõi sâu các thay đổi trong object

// --- Xử lý Tags ---
// Biến computed để hiển thị tags dưới dạng chuỗi trong input
const tagsString = computed(() => {
  return formData.value.tags ? formData.value.tags.map((tag) => tag.tag_name).join(', ') : ''
})

// Hàm cập nhật mảng tags khi người dùng nhập vào input
const updateTags = (event) => {
  const inputString = event.target.value
  if (!formData.value) formData.value = {} // Khởi tạo nếu chưa có
  if (inputString.trim() === '') {
    formData.value.tags = []
  } else {
    // Tách chuỗi thành mảng tên tag, loại bỏ khoảng trắng thừa
    const tagNames = inputString
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name !== '')
    // Chuyển đổi thành cấu trúc đối tượng tag { tag_name: '...', id: ... }
    // Giữ lại id cũ nếu có thể (khi edit), hoặc để id là null/undefined cho tag mới
    formData.value.tags = tagNames.map((name) => {
      // Tìm tag cũ có cùng tên để giữ lại id (quan trọng khi gửi lên API update)
      const existingTag = props.cameraData?.tags?.find((t) => t.tag_name === name)
      return { tag_name: name, id: existingTag ? existingTag.id : undefined } // ID sẽ được API xử lý khi tạo mới
    })
  }
}
// --- Kết thúc xử lý Tags ---

const formTitle = computed(() => (props.mode === 'add' ? 'Add New Camera' : 'Edit Camera'))
const saveButtonText = computed(() => (props.mode === 'add' ? 'Add Camera' : 'Save Changes'))

const closeModal = () => {
  emit('close')
}

const submitForm = () => {
  // Chuyển đổi các URL trống thành null trước khi gửi đi (nếu API yêu cầu)
  const dataToSave = { ...formData.value }
  for (const key in dataToSave) {
    if (key.endsWith('_url') && dataToSave[key] === '') {
      dataToSave[key] = null
    }
  }
  // Chuyển đổi panorama sang số nếu nó đang là chuỗi
  if (typeof dataToSave.panorama === 'string') {
    dataToSave.panorama = parseInt(dataToSave.panorama, 10)
  }

  emit('save', dataToSave)
}
</script>

<style scoped>
/* Style cho scrollbar nếu cần */
div[class*='max-h-']::-webkit-scrollbar {
  width: 8px;
}
div[class*='max-h-']::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
div[class*='max-h-']::-webkit-scrollbar-thumb {
  background-color: rgba(30, 64, 175, 0.7); /* Màu xanh đậm hơn, trong suốt */
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

/* Tùy chỉnh mũi tên cho select box */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style> -->
