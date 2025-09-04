<template>
  <div class="min-h-full bg-gray-900 text-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- <h2 class="text-2xl font-bold mb-6">Event Logs</h2> -->

      <!-- Filters -->
      <!-- Responsive Filters Section -->
    <div class="mb-4 space-y-4">
      <!-- Title Row -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl md:text-2xl font-bold">{{ $t("Event_Logs") }}</h2>
      </div>

      <!-- Filters Grid - Responsive Layout -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <!-- Status Filter -->
        <div class="sm:col-span-1">
          <select v-model="filters.status"
            class="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer"
            @change="applyFilters()">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="OK">OK</option>
            <option value="NG">NG</option>
          </select>
        </div>

        <!-- Camera Filter -->
        <div class="sm:col-span-1">
          <input v-model="filters.camera" 
            :placeholder="$t('Filter_by_camera')"
            class="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="applyFilters()" />
        </div>

        <!-- ID Filter -->
        <div class="sm:col-span-1 lg:col-span-1">
          <input v-model="filters.id" 
            :placeholder="$t('Filter_by_ID')"
            class="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="applyFilters()" />
        </div>

        <!-- Error Code Filter -->
        <div class="sm:col-span-1 lg:col-span-1">
          <input v-model="filters.error_code" 
            :placeholder="$t('Filter_by_error_code')"
            class="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="applyFilters()" />
        </div>

        <!-- Location Filter -->
        <div class="sm:col-span-1 lg:col-span-1">
          <input v-model="filters.location" 
            :placeholder="$t('Filter_by_location')"
            class="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="applyFilters()" />
        </div>

        <!-- Data Source Selector -->
        <div class="sm:col-span-1 lg:col-span-1">
          <select v-model="selectedSource"
            class="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:cursor-pointer">
            <option value="notification_stats">Smart Gate</option>
            <option value="worker_events">Camera 360</option>
          </select>
        </div>
      </div>

      <!-- Mobile Filters Toggle (Optional - for very small screens) -->
      <div class="sm:hidden">
        <button @click="showMobileFilters = !showMobileFilters" 
          class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
          <span>{{ showMobileFilters ? 'Hide' : 'Show' }} Filters</span>
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showMobileFilters }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <!-- Collapsible Mobile Filters -->
        <div v-if="showMobileFilters" class="mt-3 space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div class="grid grid-cols-1 gap-3">
            <select v-model="filters.status"
              class="w-full bg-gray-700 border-gray-600 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              @change="applyFilters()">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="OK">OK</option>
              <option value="NG">NG</option>
            </select>

            <input v-model="filters.camera" :placeholder="$t('Filter_by_camera')"
              class="w-full bg-gray-700 border-gray-600 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              @input="applyFilters()" />

            <input v-model="filters.id" :placeholder="$t('Filter_by_ID')"
              class="w-full bg-gray-700 border-gray-600 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              @input="applyFilters()" />

            <input v-model="filters.error_code" :placeholder="$t('Filter_by_error_code')"
              class="w-full bg-gray-700 border-gray-600 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              @input="applyFilters()" />

            <input v-model="filters.location" :placeholder="$t('Filter_by_location')"
              class="w-full bg-gray-700 border-gray-600 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              @input="applyFilters()" />

            <select v-model="selectedSource"
              class="w-full bg-gray-700 border-gray-600 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
              <option value="notification_stats">Notification Stats</option>
              <option value="worker_events">Worker Events</option>
            </select>
          </div>
        </div>
      </div>
    </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-lg border border-gray-700">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-800 text-gray-300">
            <tr>
              <th class="p-4 cursor-pointer" @click="toggleSort('ID')">
                ID
                <SortIcon field="ID" :current="sort" />
              </th>
              <th class="p-4 cursor-pointer" @click="toggleSort('name')">
                Name
                <SortIcon field="name" :current="sort" />
              </th>
              <th class="p-4 cursor-pointer" @click="toggleSort('datetime')">
                DateTime
                <SortIcon field="datetime" :current="sort" />
              </th>
              <th class="p-4 cursor-pointer" @click="toggleSort('camera')">
                Camera
                <SortIcon field="camera" :current="sort" />
              </th>
              <th class="p-4 cursor-pointer" @click="toggleSort('location')">
                Location
                <SortIcon field="location" :current="sort" />
              </th>
              <th class="p-4 cursor-pointer" @click="toggleSort('Irregularity')">
                Error Code
                <SortIcon field="Irregularity" :current="sort" />
              </th>
              <th class="p-4 cursor-pointer" @click="toggleSort('Status')">
                Status
                <SortIcon field="Status" :current="sort" />
              </th>
              <th class="p-4">Actions</th>
              <th class="p-4">Playback</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.ID"
              class="border-b border-gray-700 hover:bg-gray-800 transition-colors">
              <td class="p-4">{{ log.ID }}</td>
              <td class="p-4">{{ log.name }}</td>
              <td class="p-4">{{ new Date(log.datetime).toLocaleString() }}</td>
              <td class="p-4">{{ log.camera }}</td>
              <td class="p-4">{{ log.location }}</td>
              <td class="p-4 px-2 py-1 text-xs">
                <span :class="getErrorCodeClass(log.Irregularity)" class="rounded-full px-2 py-1 inline-block">
                  {{ log.Irregularity }}
                </span>
              </td>
              <td class="p-4" :id="`status-${log.ID}`">{{ log.Status }}</td>
              <td class="p-4">
                <!-- <div v-if="log.Status === 'Pending'" class="flex gap-2 ">
                  <Button label="Accept" severity="success" size="small" @click="accept(log)" />
                  <Button label="Decline" severity="danger" size="small" @click="decline(log)" />
                </div> -->
                <div v-if="log.Status === 'Pending'" class="flex gap-2">
                  <span class="cursor-pointer px-3 py-2 text-xs rounded-lg bg-green-700 text-white hover:bg-green-500"
                    @click="accept(log)">
                    Accept
                  </span>
                  <!-- <ButtonGroup>
                      <Button label="Accept" icon="pi pi-check" @click="accept(log)" />
                      <Button label="Decline" icon="pi pi-trash" @click="decline(log)" />
                  </ButtonGroup> -->
                  <span class="cursor-pointer px-3 py-2 text-xs rounded-lg bg-red-900 text-red-200 hover:bg-red-800"
                    @click="decline(log)">
                    Decline
                  </span>
                </div>

                <div v-else>
                  <span class="px-3 py-2 text-xs rounded-full"
                    :class="log.Status === 'OK' ? 'bg-green-900 text-green-200 hover:bg-green-800' : 'bg-red-900 text-red-200 hover:bg-red-800'">
                    {{ log.Status }}
                  </span>
                </div>

              </td>

              <td class="p-4">
                <button class="text-indigo-400 hover:text-indigo-300 cursor-pointer" @click="viewDetails(log)">
                  {{ $t('View_Details') }}
                </button>
              </td>
            </tr>
            <tr v-if="isLoading" class="border-b border-gray-700">
              <td colspan="9" class="p-4 text-center">Loading...</td>
            </tr>
            <tr v-if="!isLoading && filteredLogs.length === 0" class="border-b border-gray-700">
              <td colspan="9" class="p-4 text-center">No logs found</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center p-4">
          <!-- Thông tin số lượng bản ghi -->
          <div class="text-sm text-gray-400">
            Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredLogs.length) }} of {{ filteredLogs.length }}
            logs
          </div>

          <!-- Controls phân trang -->
          <div class="flex items-center space-x-2">
            <!-- Nút Previous -->
            <button @click="prevPage()" :disabled="currentPage <= 1"
              class="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer">
              &laquo; Previous
            </button>

            <!-- Các nút số trang -->
            <template v-for="(pageNum, index) in displayedPages" :key="index">
              <span v-if="pageNum === '...'" class="px-3 py-1 text-gray-400">...</span>
              <button v-else @click="goToPage(pageNum)" :class="[
                'px-3 py-1 rounded hover:cursor-pointer',
                currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]">
                {{ pageNum }}
              </button>
            </template>

            <!-- Nút Next -->
            <button @click="nextPage()" :disabled="currentPage >= totalPages"
              class="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer">
              Next &raquo;
            </button>
          </div>

          <!-- Chọn số lượng hiển thị mỗi trang -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-400">Display:</span>
            <select v-model="pageSize" @change="goToPage(1)"
              class="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600 hover:cursor-pointer">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <div v-if="selectedLog"
        class="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 bg-black/50 backdrop-blur-sm">
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full" @click.stop>
          <h3 class="text-xl font-bold mb-4">{{ $t("Event_Logs") }}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div><strong>ID:</strong> {{ selectedLog.ID }}</div>
            <div><strong>Name:</strong> {{ selectedLog.name }}</div>
            <div>
              <strong>DateTime:</strong> {{ new Date(selectedLog.datetime).toLocaleString() }}
            </div>
            <div><strong>Camera:</strong> {{ selectedLog.camera }}</div>
            <div><strong>Location:</strong> {{ selectedLog.location }}</div>
            <div><strong>Error Code:</strong> {{ selectedLog.Irregularity }}</div>
            <div><strong>Status:</strong> {{ selectedLog.Status }}</div>
            <div v-if="selectedLog.description" class="col-span-2">
              <strong>Description:</strong> {{ selectedLog.description }}
            </div>
            <!-- <div v-if="selectedLog.img_url" class="col-span-2">
              <strong>Image:</strong>
              <img :src="selectedLog.img_url" alt="Error image" class="mt-2 max-w-full h-auto" />
            </div> -->
            <div v-if="selectedLog.videoPath && selectedLog.baseUrl" class="col-span-2">
              <strong>Video:</strong>
              <video controls class="mt-2 max-w-full h-auto">
                <source :src="`${selectedLog.videoPath}`" type="video/mp4" />
              </video>
            </div>

          </div>
          <div class="mt-4 flex items-center justify-between">
            <div v-if="selectedLog.Status === 'Pending'" class="space-x-2">
              <Button label="Accept" severity="success" size="small" @click="accept(selectedLog)" />
              <Button label="Decline" severity="danger" size="small" @click="decline(selectedLog)" />
            </div>
            <div v-else>
              <Button :label="selectedLog.Status" :severity="selectedLog.Status === 'OK' ? 'success' : 'danger'"
                size="small" disabled />
            </div>
            <button class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700" @click="selectedLog = null">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import SortIcon from '@/components/icons/IconSort.vue'
import Button from 'primevue/button';
import { fetchWrapper } from '@/helper'

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)

// Data
const allLogs = ref([])
const filteredLogs = ref([])
const selectedLog = ref(null)

// data source
const selectedSource = ref('notification_stats') // Mặc định là notification_stats

// Sorting & Filtering
const sort = ref({
  by: '',
  order: 'asc'
})
const filters = ref({
  status: '',
  camera: '',
  id: '',
  error_code: '',
  location: '',
})

// Computed
const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / pageSize.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const endIndex = computed(() => {
  return startIndex.value + parseInt(pageSize.value)
})

const paginatedLogs = computed(() => {
  return filteredLogs.value.slice(startIndex.value, endIndex.value)
})

const displayedPages = computed(() => {
  const totalPagesValue = totalPages.value
  const currentPageValue = currentPage.value
  const maxPagesToShow = 5
  const pages = []

  // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxPagesToShow
  if (totalPagesValue <= maxPagesToShow) {
    return Array.from({ length: totalPagesValue }, (_, i) => i + 1)
  }

  // Hiển thị các trang xung quanh trang hiện tại
  const half = Math.floor(maxPagesToShow / 2)
  let start = Math.max(1, currentPageValue - half)
  let end = Math.min(totalPagesValue, start + maxPagesToShow - 1)

  // Điều chỉnh lại start nếu end đã đến gần cuối
  if (end - start + 1 < maxPagesToShow) {
    start = Math.max(1, end - maxPagesToShow + 1)
  }

  // Thêm trang đầu và dấu "..." nếu cần
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  // Thêm các trang ở giữa
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Thêm dấu "..." và trang cuối nếu cần
  if (end < totalPagesValue) {
    if (end < totalPagesValue - 1) pages.push('...')
    pages.push(totalPagesValue)
  }

  return pages
})

let currentFetchId = 0;

// Methods
const fetchLogs = async () => {
  // Tạo ID duy nhất cho lần fetch này
  const fetchId = ++currentFetchId;
  // console.log(`🔄 fetchLogs #${fetchId} called for source: ${selectedSource.value}`);
  
  isLoading.value = true;
  allLogs.value = [];
  filteredLogs.value = [];

  try {
    let combinedResults = [];

    if (selectedSource.value === 'notification_stats') {
      // console.log(`📡 #${fetchId} Fetching notification_stats...`);
      
      const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);
      
      // Kiểm tra xem có phải fetch mới nhất không
      if (fetchId !== currentFetchId) {
        console.log(`🚫 #${fetchId} Aborted - newer fetch in progress`);
        return;
      }
      
      const urlToCameraName = cameras.reduce((map, camera) => {
        try {
          if (!camera.statistic_api_url) return map;
          let apiUrl = camera.statistic_api_url.trim();
          if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
            apiUrl = 'http://' + apiUrl;
          }
          const baseUrl = new URL(apiUrl).origin;
          map[baseUrl] = camera.name;
        } catch (error) {
          console.error(`Invalid URL in camera ${camera.name}:`, camera.statistic_api_url, error);
        }
        return map;
      }, {});
      
      const statisticUrls = Object.keys(urlToCameraName);
      const allNotificationResults = await Promise.all(
        statisticUrls.map(async (baseUrl) => {
          try {
            const response = await fetch(`${baseUrl}/notification_stats?query=all`, { method: 'GET' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const results = Array.isArray(data) ? data : (data.results || []);
            return results.map(item => ({
              ...item,
              camera: urlToCameraName[baseUrl] || 'Unknown',
              baseUrl,
              source: 'notification_stats'
            }));
          } catch (error) {
            console.error(`Error fetching from ${baseUrl}:`, error);
            return [];
          }
        })
      );
      
      combinedResults = allNotificationResults.flat();

    } else if (selectedSource.value === 'worker_events') {
      // console.log(`📡 #${fetchId} Fetching worker_events...`);
      
      const workerEvents = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/worker-events`);
      
      // Kiểm tra xem có phải fetch mới nhất không
      if (fetchId !== currentFetchId) {
        // console.log(`🚫 #${fetchId} Aborted - newer fetch in progress`);
        return;
      }
      
      const processedWorkerEvents = Array.isArray(workerEvents) ? workerEvents : (workerEvents.data || []);
      combinedResults = processedWorkerEvents.map(item => {
        let statusText = '';
        switch (item.status) {
          case 0: statusText = 'Pending'; break;
          case 1: statusText = 'OK'; break;
          case 2: statusText = 'NG'; break;
          default: statusText = 'Unknown';
        }
        return {
          ID: item.id,
          originalID: item.id,
          name: 'Abnormal Event',
          datetime: item.timestamp,
          camera: item.camera_name,
          location: item.location,
          Irregularity: item.error_detail,
          Status: statusText,
          img_url: `${window.appConfig.apiUrl}/${item.img_error}`,
          videoPath: `${window.appConfig.apiUrl}/${item.video_error}`,
          ai_log_path: `${window.appConfig.apiUrl}/${item.ai_log_path}`,
          baseUrl: window.appConfig.apiUrl,
          source: 'worker_events'
        };
      });
    }

    // Kiểm tra lần cuối trước khi set results
    if (fetchId !== currentFetchId) {
      // console.log(`🚫 #${fetchId} Aborted before setting results`);
      return;
    }

    allLogs.value = combinedResults.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    // console.log(`✅ #${fetchId} Successfully fetched from ${selectedSource.value}: ${allLogs.value.length} logs`);

    applyFilters();
  } catch (error) {
    console.error(`❌ #${fetchId} Error in fetchLogs:`, error);
    allLogs.value = [];
    filteredLogs.value = [];
  } finally {
    // Chỉ set loading = false nếu đây là fetch mới nhất
    if (fetchId === currentFetchId) {
      isLoading.value = false;
    }
  }
};

const applyFilters = () => {
  let result = [...allLogs.value]

  // Apply filters
  if (filters.value.status) {
    result = result.filter(log => log.Status === filters.value.status)
  }

  if (filters.value.camera) {
    const query = filters.value.camera.toLowerCase()
    result = result.filter(log => log.camera && log.camera.toLowerCase().includes(query))
  }

  if (filters.value.id) {
    const query = filters.value.id.toLowerCase()
    result = result.filter(log => log.ID && log.ID.toString().toLowerCase().includes(query))
  }

  if (filters.value.error_code) {
    const query = filters.value.error_code.toLowerCase()
    result = result.filter(log => log.Irregularity && log.Irregularity.toLowerCase().includes(query))
  }

  if (filters.value.location) {
    const query = filters.value.location.toLowerCase()
    result = result.filter(log => log.location && log.location.toLowerCase().includes(query))
  }

  // Apply sorting
  if (sort.value.by) {
    result.sort((a, b) => {
      const fieldA = a[sort.value.by]
      const fieldB = b[sort.value.by]

      if (fieldA === fieldB) return 0

      // Handle date comparison
      if (sort.value.by === 'datetime') {
        const dateA = new Date(fieldA)
        const dateB = new Date(fieldB)
        return sort.value.order === 'asc'
          ? dateA - dateB
          : dateB - dateA
      }

      // Handle string comparison
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sort.value.order === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA)
      }

      // Handle number comparison
      return sort.value.order === 'asc'
        ? fieldA - fieldB
        : fieldB - fieldA
    })
  }

  filteredLogs.value = result

  // Reset to first page when filters change
  goToPage(1)
}

const toggleSort = (field) => {
  if (sort.value.by === field) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.by = field
    sort.value.order = 'asc'
  }
  applyFilters()
}

const goToPage = (page) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const viewDetails = (log) => {
  selectedLog.value = log
  console.log("selectedLog.value ::: ", selectedLog);
}

// Ánh xạ trạng thái hiển thị với tên endpoint của backend
const actionEndpoints = {
  'OK': 'accept',
  'NG': 'decline'
};

async function postNotification(log, action) {
  let url_post;
  let method_post = 'POST';
  let body_data;

  // Ánh xạ trạng thái hiển thị với tên endpoint của backend
  const actionEndpoints = {
    'OK': 'accept',
    'NG': 'decline'
  };

  // Kiểm tra nguồn dữ liệu để chọn URL và phương thức phù hợp
  if (log.source === 'worker_events') {
    const endpointAction = actionEndpoints[action];
    if (!endpointAction) {
      console.error("Unknown action:", action);
      return;
    }
    url_post = `${window.appConfig.apiUrl}/v1/cameras/worker-events/${log.originalID}/${endpointAction}`;
    method_post = 'PATCH';
    
    body_data = {
      employee_confirm_id: "your_employee_id_here",
      client_ip: null
    };

  } else if (log.source === 'notification_stats') {
    url_post = `${log.baseUrl}/notification_action`;
    body_data = {
      ID: log.ID,
      action: action,
      status: log.Status
    };
  } else {
    console.error("Unknown log source:", log.source);
    return;
  }

  const confirmMessage = "Are you sure you want to perform this action?";
  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const response = await fetch(url_post, {
      method: method_post,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body_data)
    });

    const data = await response.json();
    console.log("response ::: ", data);

    if (response.ok) {
      // ✅ CẬP NHẬT UI NGAY LẬP TỨC
      
      // 1. Cập nhật selectedLog (cho popup)
      if (selectedLog.value && selectedLog.value.ID === log.ID) {
        selectedLog.value.Status = action;
      }
      
      // 2. Cập nhật trong allLogs
      const logIndex = allLogs.value.findIndex(item => item.ID === log.ID && item.source === log.source);
      if (logIndex !== -1) {
        allLogs.value[logIndex].Status = action;
      }
      
      // 3. Cập nhật trong filteredLogs
      const filteredLogIndex = filteredLogs.value.findIndex(item => item.ID === log.ID && item.source === log.source);
      if (filteredLogIndex !== -1) {
        filteredLogs.value[filteredLogIndex].Status = action;
      }
      
      // 4. Cập nhật DOM element trực tiếp (nếu cần thiết)
      const statusElement = document.getElementById(`status-${log.ID}`);
      if (statusElement) {
        statusElement.textContent = action;
      }
      
      console.log(`✅ UI updated immediately for log ${log.ID} with status: ${action}`);
      
      // Optional: Vẫn có thể refresh data để đồng bộ với server (chạy background)
      // fetchLogs();
      
    } else {
      console.error("Lỗi server ::: ", data.detail || data);
    }
  } catch (error) {
    console.error("Lỗi ngoại lệ: ", error);
  }
}

// màu cho từng mã lỗi
const getErrorCodeClass = (code) => {
  if (code.startsWith('NG, 尾随报警')) return 'bg-blue-900 text-blue-200';
  if (code.startsWith('NG, No Shirt')) return 'bg-yellow-900 text-yellow-200';
  if (code.startsWith('NG, No PPE')) return 'bg-yellow-900 text-yellow-200';
  if (code.startsWith('NG, 未穿戴静电衣')) return 'bg-orange-900 text-orange-200';
  if (code.startsWith('NG, Bend')) return 'bg-red-900 text-red-200';
  if (code.startsWith('NG, 弯腰报警')) return 'bg-red-900 text-red-200';
  if (code.startsWith('电子门报警')) return 'bg-purple-900 text-purple-200';

  if (code.startsWith('超过时间')) return 'bg-purple-500 text-purple-200';
  return 'bg-black text-gray-200 hover:bg-gray-700';
};

// Khi nhấn Accept
function accept(log) {
  postNotification(log, 'OK');
}

// Khi nhấn Decline
function decline(log) {
  postNotification(log, 'NG');
}

// Giả sử bạn có 1 danh sách logs lấy từ API
const logs = ref([
  // Example:
  // { ID: 1, Status: 'Pending', ... }
]);

// const decline = (log) => {
//   // Implement the decline logic here
//   log.Status = 'NG'
// }

// Lifecycle hooks
onMounted(() => {
  // Lấy giá trị đã lưu trong localStorage và cập nhật selectedSource
  const savedSource = localStorage.getItem('selectedSource');
  if (savedSource) {
    selectedSource.value = savedSource;
  }
})

watch(selectedSource, (newValue, oldValue) => {
  // console.log(`🔄 Watch triggered: ${oldValue} -> ${newValue}`);
  localStorage.setItem('selectedSource', newValue);
  fetchLogs();
}, { immediate: true });

// Watch for pageSize changes (giữ nguyên)
watch(pageSize, () => {
  goToPage(1)
})
</script>

<style scoped>
/* Additional custom styles can go here if needed */
</style>