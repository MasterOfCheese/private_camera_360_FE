vue
<template>
  <div class="min-h-full bg-gray-900 text-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
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
                <div v-if="log.Status === 'Pending'" class="flex gap-2">
                  <span class="cursor-pointer px-3 py-2 text-xs rounded-lg bg-green-700 text-white hover:bg-green-500"
                    @click="accept(log)">
                    Accept
                  </span>
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
            <tr v-if="!isLoading && getTotalItems() === 0" class="border-b border-gray-700">
              <td colspan="9" class="p-4 text-center">No logs found</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center p-4">
          <!-- Thông tin số lượng bản ghi -->
          <div class="text-sm text-gray-400">
            Showing {{ getStartIndex() + 1 }} to {{ Math.min(getEndIndex(), getTotalItems()) }} of {{ getTotalItems() }}
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
              <span v-if="pageNum === '...' " class="px-3 py-1 text-gray-400">...</span>
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
            <button @click="nextPage()" :disabled="currentPage >= getTotalPages()"
              class="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer">
              Next &raquo;
            </button>
          </div>

          <!-- Chọn số lượng hiển thị mỗi trang -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-400">Display:</span>
            <select v-model="pageSize" @change="onPageSizeChange()"
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
            <div v-if="selectedLog.videoPath && selectedLog.baseUrl" class="col-span-2">
              <strong>Video:</strong>
              <video controls class="mt-2 max-w-full h-auto">
                <!-- Smart Gate: use baseUrl + videoPath -->
                <source v-if="selectedSource === 'notification_stats'"
                  :src="`${selectedLog.baseUrl}/${selectedLog.videoPath}`"
                  type="video/mp4" />
               
                <!-- Camera 360: use videoPath directly -->
                <source v-else-if="selectedSource === 'worker_events'"
                  :src="selectedLog.videoPath"
                  type="video/mp4" />
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

const showMobileFilters = ref(false)

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)

// Data
const allLogs = ref([]) // For client-side (notification_stats)
const filteredLogs = ref([]) // For client-side filtered/sorted
const currentData = ref([]) // For server-side (worker_events) current page
const totalItems = ref(0) // Total after filters (from backend for worker_events)
const totalPages = ref(0) // Total pages (from backend for worker_events)
const selectedLog = ref(null)

// Data source
const selectedSource = ref('notification_stats') // Mặc định là notification_stats

// Sorting & Filtering
const sort = ref({
  by: '',
  order: 'desc', // 'asc' or 'desc'
})

const filters = ref({
  status: '',
  camera: '',
  id: '',
  error_code: '',
  location: '',
})

// Computed for pagination (shared)
const getTotalItems = () => {
  return selectedSource.value === 'worker_events' ? totalItems.value : filteredLogs.value.length
}

const getTotalPages = () => {
  if (selectedSource.value === 'worker_events') {
    return totalPages.value
  } else {
    return Math.ceil(getTotalItems() / pageSize.value)
  }
}

const getStartIndex = () => {
  if (selectedSource.value === 'worker_events') {
    return (currentPage.value - 1) * pageSize.value
  } else {
    return (currentPage.value - 1) * pageSize.value
  }
}

const getEndIndex = () => {
  if (selectedSource.value === 'worker_events') {
    return Math.min(currentPage.value * pageSize.value, totalItems.value)
  } else {
    return getStartIndex() + parseInt(pageSize.value)
  }
}

const paginatedLogs = computed(() => {
  if (selectedSource.value === 'worker_events') {
    return currentData.value
  } else {
    return filteredLogs.value.slice(getStartIndex(), getEndIndex())
  }
})

const displayedPages = computed(() => {
  const totalP = getTotalPages()
  const current = currentPage.value
  const maxPagesToShow = 5
  const pages = []

  if (totalP <= maxPagesToShow) {
    return Array.from({ length: totalP }, (_, i) => i + 1)
  }

  const half = Math.floor(maxPagesToShow / 2)
  let start = Math.max(1, current - half)
  let end = Math.min(totalP, start + maxPagesToShow - 1)

  if (end - start + 1 < maxPagesToShow) {
    start = Math.max(1, end - maxPagesToShow + 1)
  }

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalP) {
    if (end < totalP - 1) pages.push('...')
    pages.push(totalP)
  }

  return pages
})

let currentFetchId = 0;

// ===========================================
// NOTIFICATION STATS API LOGIC (SMART GATE) - Client-side, keep as is
// ===========================================
const fetchNotificationStats = async (fetchId) => {
  console.log(`📡 #${fetchId} Fetching notification_stats...`);
 
  try {
    const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);
   
    // Kiểm tra xem có phải fetch mới nhất không
    if (fetchId !== currentFetchId) {
      console.log(`🚫 #${fetchId} Aborted - newer fetch in progress`);
      return null;
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
   
    return allNotificationResults.flat();
   
  } catch (error) {
    console.error(`❌ #${fetchId} Error in fetchNotificationStats:`, error);
    return [];
  }
};

// ===========================================
// WORKER EVENTS API LOGIC (CAMERA 360) - Server-side pagination
// ===========================================
const fetchWorkerEvents = async (fetchId, page, size, filtersObj, sortBy, sortOrder) => {
  console.log(`📡 #${fetchId} Fetching worker_events page ${page}...`);
 
  try {
    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filtersObj.camera) {
      params.append('query', filtersObj.camera);
    }
    if (filtersObj.location) {
      params.append('location', filtersObj.location);
    }
    if (filtersObj.id) {
      params.append('event_id', filtersObj.id);
    }
    if (filtersObj.error_code) {
      params.append('error_code', filtersObj.error_code);
    }
    if (filtersObj.status) {
      const statusMap = { Pending: 0, OK: 1, NG: 2 };
      const statusInt = statusMap[filtersObj.status];
      if (statusInt !== undefined) {
        params.append('status', statusInt.toString());
      }
    }
    if (sortBy) {
      params.append('sort_by', sortBy);
    }
    if (sortOrder) {
      params.append('order', sortOrder);
    }

    const url = `${window.appConfig.apiUrl}/v1/cameras/worker-events?${params.toString()}`;
    const response = await fetchWrapper.get(url);

    // Kiểm tra xem có phải fetch mới nhất không
    if (fetchId !== currentFetchId) {
      console.log(`🚫 #${fetchId} Aborted`);
      return null;
    }

    const { total, data, page: totalP } = response;
    totalItems.value = total || 0;
    totalPages.value = totalP || 1;

    // Transform to standardized format
    return transformWorkerEvents(data || []);
 
  } catch (error) {
    console.error(`❌ #${fetchId} Error in fetchWorkerEvents:`, error);
    return [];
  }
};

// Transform worker events to match the common format
const transformWorkerEvents = (workerEvents) => {
  return workerEvents.map(item => {
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
};

// Map frontend sort field to backend
const getBackendSortField = (field) => {
  const map = {
    'ID': 'id',
    'datetime': 'timestamp',
    'camera': 'camera_name',
    'location': 'location',
    'Irregularity': 'error_detail',
    'Status': 'status',
    // 'name' is constant, ignore
  };
  return map[field] || 'id';
};

// Load specific page for worker_events
const loadPage = async (page = 1) => {
  const fetchId = ++currentFetchId;
  isLoading.value = true;
  currentPage.value = page;

  const data = await fetchWorkerEvents(
    fetchId,
    page,
    pageSize.value,
    filters.value,
    getBackendSortField(sort.value.by),
    sort.value.order
  );

  if (data === null) return; // Aborted

  currentData.value = data;
  isLoading.value = false;
};

// ===========================================
// MAIN FETCH LOGIC
// ===========================================
const fetchLogs = async () => {
  const fetchId = ++currentFetchId;
  isLoading.value = true;

  try {
    let combinedResults = [];

    // Route to appropriate fetch function based on selected source
    if (selectedSource.value === 'notification_stats') {
      const notificationResults = await fetchNotificationStats(fetchId);
      if (notificationResults === null) return; // Fetch was aborted
      combinedResults = notificationResults;
      // Sort by datetime descending (newest first)
      allLogs.value = combinedResults.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
      applyClientFilters();
    } else if (selectedSource.value === 'worker_events') {
      // Load first page
      await loadPage(1);
      return; // Handled in loadPage
    }

    // Kiểm tra lần cuối
    if (fetchId !== currentFetchId) {
      console.log(`🚫 #${fetchId} Aborted before setting results`);
      return;
    }

  } catch (error) {
    console.error(`❌ #${fetchId} Error in fetchLogs:`, error);
    allLogs.value = [];
    filteredLogs.value = [];
    currentData.value = [];
  } finally {
    if (fetchId === currentFetchId) {
      isLoading.value = false;
    }
  }
};

// Client-side filters/sort for notification_stats
const applyClientFilters = () => {
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
}

// ===========================================
// FILTER/SORT/PAGINATION EVENTS
// ===========================================
const applyFilters = () => {
  if (selectedSource.value === 'worker_events') {
    loadPage(1)
  } else {
    applyClientFilters()
    goToPage(1)
  }
}

const toggleSort = (field) => {
  if (sort.value.by === field) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.by = field
    sort.value.order = 'asc'
  }

  if (selectedSource.value === 'worker_events') {
    loadPage(currentPage.value)
  } else {
    applyClientFilters()
  }
}

const goToPage = (page) => {
  currentPage.value = page
  if (selectedSource.value === 'worker_events') {
    loadPage(page)
  }
  // For client-side, computed handles it
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < getTotalPages()) {
    goToPage(currentPage.value + 1)
  }
}

const onPageSizeChange = () => {
  if (selectedSource.value === 'worker_events') {
    loadPage(1)
  } else {
    goToPage(1)
  }
}

const viewDetails = (log) => {
  selectedLog.value = log
  console.log("selectedLog.value ::: ", selectedLog);
}

// ===========================================
// NOTIFICATION ACTION LOGIC
// ===========================================
const postNotificationStatsAction = async (log, action) => {
  const url_post = `${log.baseUrl}/notification_action`;
  const body_data = {
    ID: log.ID,
    action: action,
    status: log.Status
  };

  const response = await fetch(url_post, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body_data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
};

const postWorkerEventsAction = async (log, action) => {
  const actionEndpoints = {
    'OK': 'accept',
    'NG': 'decline'
  };

  const endpointAction = actionEndpoints[action];
  if (!endpointAction) {
    throw new Error(`Unknown action: ${action}`);
  }
 
  const url_post = `${window.appConfig.apiUrl}/v1/cameras/worker-events/${log.originalID}/${endpointAction}`;
  const body_data = {
    ID: log.originalID,
    action: action
  };

  const response = await fetch(url_post, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body_data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
};

// Main notification action function
async function postNotification(log, action) {
  const confirmMessage = "Are you sure you want to perform this action?";
  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    let result;
   
    if (log.source === 'worker_events') {
      result = await postWorkerEventsAction(log, action);
    } else if (log.source === 'notification_stats') {
      result = await postNotificationStatsAction(log, action);
    } else {
      throw new Error(`Unknown log source: ${log.source}`);
    }

    console.log("Success:", result);
   
    // Update UI
    updateLogStatus(log, action);
    console.log(`UI updated for log ${log.ID} with status: ${action}`);
   
  } catch (error) {
    console.error("Error:", error);
    alert(`Error: ${error.message}`);
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
const updateLogStatus = (log, action) => {
  if (selectedLog.value && selectedLog.value.ID === log.ID) {
    selectedLog.value.Status = action;
  }
 
  if (selectedSource.value === 'worker_events') {
    // For server-side, refetch current page to update
    loadPage(currentPage.value)
  } else {
    // For client-side
    const logIndex = allLogs.value.findIndex(item =>
      item.ID === log.ID && item.source === log.source
    );
    if (logIndex !== -1) {
      allLogs.value[logIndex].Status = action;
    }

    const filteredLogIndex = filteredLogs.value.findIndex(item =>
      item.ID === log.ID && item.source === log.source
    );
    if (filteredLogIndex !== -1) {
      filteredLogs.value[filteredLogIndex].Status = action;
    }
  }
};

// Màu cho từng mã lỗi
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

// Watchers
watch(selectedSource, () => {
  fetchLogs();
}, { immediate: true });

watch(pageSize, () => {
  onPageSizeChange();
})
</script>



<style scoped>
/* Additional custom styles can go here if needed */
</style>