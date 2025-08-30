import { ref, onMounted, computed, watch } from 'vue'
import { fetchWrapper } from '@/helper'

// Pagination
const currentPage = ref(1)
export const pageSize = ref(10)
const isLoading = ref(false)

// Data
const allLogs = ref([])
export const filteredLogs = ref([])
const selectedLog = ref(null)

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

export const paginatedLogs = computed(() => {
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

// Methods
const fetchLogs = async () => {
  isLoading.value = true;

  try {
    // Lấy danh sách camera
    const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);
    console.log("Fetching camera :", `${window.appConfig.apiUrl}/v1/cameras/?limit=100`);
    console.log("Camera data :", cameras);

    const urlToCameraName = {};
    cameras.forEach(camera => {
      try {
        if (!camera.statistic_api_url) return;
        let apiUrl = camera.statistic_api_url.trim();
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
          apiUrl = 'http://' + apiUrl;
        }
        const baseUrl = new URL(apiUrl).origin;
        console.log("baseUrl::: ", baseUrl);
        urlToCameraName[baseUrl] = camera.name;
      } catch (error) {
        console.error(`Invalid URL in camera ${camera.name}:`, camera.statistic_api_url, error);
      }
    });

    // Lấy tất cả URL hợp lệ (không null, không trùng)
    const statisticUrls = Object.keys(urlToCameraName);

    const allResults = await Promise.all(
      statisticUrls.map(async (baseUrl) => {
        try {
          const response = await fetch(`${baseUrl}/notification_stats?query=all`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const results = Array.isArray(data) ? data : (data.results || []);

          // console.log(`Fetched results from ${baseUrl}:`, results);

          // Thêm trường 'baseUrl' vào mỗi bản ghi log
          return results.map(item => ({
            ...item,
            camera: urlToCameraName[baseUrl] || 'Unknown',
            baseUrl,  // Lưu baseUrl ở đây
          }));
        } catch (error) {
          console.error(`Error fetching from ${baseUrl}:`, error);
          return [];
        }
      })
    );

    // Gộp tất cả kết quả
    const combinedResults = allResults.flat();

    // Sắp xếp theo datetime mới nhất
    allLogs.value = combinedResults.sort((a, b) => {
      return new Date(b.datetime) - new Date(a.datetime);
    });

    console.log(`Total logs combined: ${allLogs.value.length}`);

    applyFilters();
  } catch (error) {
    console.error('Error in fetchLogs:', error);
    allLogs.value = [];
    filteredLogs.value = [];
  } finally {
    isLoading.value = false;
  }
};

export const baseUrlList = ref([]);

export async function loadCameraBaseUrls() {
  try {
    const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);
    const baseUrlSet = new Set();

    cameras.forEach((camera) => {
      if (!camera?.statistic_api_url) return;

      let apiUrl = camera.statistic_api_url.trim();
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        apiUrl = 'http://' + apiUrl;
      }

      try {
        const baseUrl = new URL(apiUrl).origin;
        baseUrlSet.add(baseUrl);
      } catch (err) {
        console.error(`Invalid URL: ${camera.statistic_api_url}`, err);
      }
    });

    baseUrlList.value = Array.from(baseUrlSet);
  } catch (err) {
    console.error('Failed to load camera base URLs', err);
    baseUrlList.value = [];
  }
}


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

export const toggleSort = (field) => {
  if (sort.value.by === field) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.by = field
    sort.value.order = 'asc'
  }
  applyFilters()
}

export const goToPage = (page) => {
  currentPage.value = page
}

export const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

export const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

export const viewDetails = (log) => {
  selectedLog.value = log
  console.log("selectedLog.value ::: ", selectedLog);
}

export async function postNotification(log, action, status) {
  const url_post = `${log.baseUrl}/notification_action`;
  const confirmMessage = "Are you sure you want to perform this action?";

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const response = await fetch(url_post, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ID: log.ID,
        action: action,   // "OK" hoặc "NG"
        status: status    // "Violation" hoặc "Alert"
      })
    });

    const data = await response.json();
    console.log("response ::: ", data);

    if (response.ok) {
      // Sau khi thành công thì cập nhật Status trực tiếp
      log.Status = action; // <-- CHỈ CẦN ĐỔI action vào log.Status
    } else {
      console.error("Lỗi server ::: ", data.detail || data);
    }

  } catch (error) {
    console.error("Lỗi ngoại lệ: ", error);
  }
}

// Khi nhấn Accept
export function accept(log) {
  postNotification(log, 'OK', 'Violation');
}

// Khi nhấn Decline
export function decline(log) {
  postNotification(log, 'NG', 'Alert');
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
  fetchLogs()
})

// Watch for pageSize changes
watch(pageSize, () => {
  goToPage(1)
})