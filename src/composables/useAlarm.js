
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import SortIcon from '@/components/icons/IconSort.vue'
import Button from 'primevue/button';
import { fetchWrapper } from '@/helper'
import { onBeforeUnmount } from 'vue';

const cpuUsage = ref(96);
const ramUsage = ref(44.7);
const displayRamUsage = computed(() => Math.round(ramUsage.value));
const baseUrl_api = ref('');

let interval = null;

onMounted(() => {
  // Cập nhật giá trị mỗi 3 giây
  interval = setInterval(() => {
    // Tạo giá trị ngẫu nhiên từ 50 đến 100 cho CPU
    cpuUsage.value = Math.floor(Math.random() * 51) + 50;

    // Tạo giá trị ngẫu nhiên từ 20 đến 70 cho RAM
    ramUsage.value = Math.floor(Math.random() * 51) + 50;
  }, 5000);
});

onBeforeUnmount(() => {
  // Xóa interval khi component bị hủy
  if (interval) {
    clearInterval(interval);
  }
});


const route = useRoute()
const authStore = useAuthStore()
const selectedLog = ref(null)
// Khai báo các biến
const visitors = ref(0);
const alarms = ref(0);
const violations = ref(0);

const logout = () => {
  if (confirm(t('log_out'))) {
    authStore.logout();
  }
};

// Loading state
const isLoading = ref(false)
// Dữ liệu logs lấy từ API
const allLogs = ref([])
// Dữ liệu alerts sẽ hiển thị
const alerts = ref([])
// Filtered logs nếu bạn cần lọc thêm (tùy)
const filteredLogs = ref([])


const paginatedLogs = computed(() => {
  return filteredLogs.value.slice(startIndex.value, endIndex.value)
})

const viewDetails = (log) => {
  selectedLog.value = log
  console.log("selectedLog.value ::: ", selectedLog);
}

// Hàm lấy dữ liệu logs từ các camera
const fetchLogs = async () => {
  isLoading.value = true;
  // console.log("Fetching logs...", paginatedLogs);

  try {
    // Bước 1: Lấy danh sách camera
    const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);

    // Map baseUrl -> camera name để tra nhanh
    const urlToCameraName = {};
    cameras.forEach(camera => {
      try {
        if (!camera.statistic_api_url) return;
        let apiUrl = camera.statistic_api_url.trim();
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
          apiUrl = 'http://' + apiUrl;
        }
        const baseUrl = new URL(apiUrl).origin;
        urlToCameraName[baseUrl] = camera.name;
      } catch (error) {
        console.error(`Invalid URL in camera ${camera.name}:`, camera.statistic_api_url, error);
      }
    });

    // Bước 2: Lấy tất cả URL hợp lệ (không null, không trùng)
    const statisticUrls = Object.keys(urlToCameraName);
    // baseUrl.value = statisticUrls;

    // Bước 3: Lấy dữ liệu sự kiện từ mỗi URL
    const allResults = await Promise.all(
      statisticUrls.map(async (baseUrl) => {
        try {
          const response = await fetch(`${baseUrl}/notification_stats?query=now`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const results = Array.isArray(data) ? data : (data.results || []);

          // Với mỗi bản ghi, thêm trường 'camera' = tên camera
          return results.map(item => ({
            ...item,
            camera: urlToCameraName[baseUrl] || 'Unknown',
            sourceUrl: baseUrl
          }));
        } catch (error) {
          console.error(`Error fetching from ${baseUrl}:`, error);
          return [];
        }
      })
    );

    // Bước 4: Gộp tất cả kết quả
    const combinedResults = allResults.flat();

    // Bước 5: Sắp xếp theo datetime mới nhất
    allLogs.value = combinedResults.sort((a, b) => {
      return new Date(b.datetime) - new Date(a.datetime);
    });

    // Cập nhật Alerts dựa trên Logs mới nhất
    alerts.value = allLogs.value.slice(0, 10).map(item => ({
      ID: item.ID,
      baseUrl: item.sourceUrl,
      videoPath: item.videoPath,
      title: item.Irregularity,
      imgPath: item.imgPath,
      name_camera: item.camera,
      name_user: item.name || 'null',
      location: item.location || 'Unknown',
      time: item.datetime || '',
      Status: item.Status
    }));

    // Lấy dữ liệu và cập nhật trạng thái
    await fetchAndUpdateStatus(statisticUrls);

    applyFilters();
  } catch (error) {
    console.error('Error in fetchLogs:', error);
    allLogs.value = [];
    filteredLogs.value = [];
  } finally {
    isLoading.value = false;
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



// Hàm lấy dữ liệu từ API và cập nhật
const fetchAndUpdateStatus = async (statisticUrls) => {
  try {
    const allStatusResults = await Promise.all(
      statisticUrls.map(async (baseUrl) => {
        try {
          const response = await fetch(`${baseUrl}/update_status`, { method: 'GET' });
          if (!response.ok) throw new Error(`Failed to fetch from ${baseUrl}`);
          const data = await response.json();
          return {
            visitors: data.today?.visitors || 0,
            alarms: data.today?.alarms || 0,
            violations: data.today?.violations || 0,
            // violations: alarms/visitors*100
          };
        } catch (error) {
          console.error(`Error fetching from ${baseUrl}:`, error);
          return { visitors: 0, alarms: 0, violations: 0 };
        }
      })
    );


    // Tính tổng visitors và alarms trước
    const totals = allStatusResults.reduce(
      (acc, curr) => ({
        visitors: acc.visitors + curr.visitors,
        alarms: acc.alarms + curr.alarms
      }),
      { visitors: 0, alarms: 0 }
    );

    // Tính violations sau khi có tổng
    const totalStatus = {
      ...totals,
      violations: totals.visitors > 0
        ? ((totals.alarms / totals.visitors) * 100).toFixed(2)
        : 0
    };

    // Cập nhật vào các biến reactive
    visitors.value = totalStatus.visitors;
    alarms.value = totalStatus.alarms;
    violations.value = totalStatus.violations;

  } catch (error) {
    console.error('Error in fetching or processing status:', error);
  }
};


export const getBaseUrls = async () => {
  const baseUrls = [];

  try {
    const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);
    
    cameras.forEach(camera => {
      if (!camera.statistic_api_url) return;

      let apiUrl = camera.statistic_api_url.trim();
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        apiUrl = 'http://' + apiUrl;
      }

      try {
        const baseUrl = new URL(apiUrl).origin;
        if (!baseUrls.includes(baseUrl)) {
          baseUrls.push(baseUrl);
        }
      } catch (error) {
        console.error('Invalid URL:', apiUrl);
      }
    });

    return baseUrls;
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return [];
  }
};



// Thiết lập cập nhật tự động
onMounted(() => {
  // Lấy danh sách camera và thiết lập các URL ngay từ đầu
  const setupInitialData = async () => {
    try {
      const cameras = await fetchWrapper.get(`${window.appConfig.apiUrl}/v1/cameras/?limit=100`);

      // Map baseUrl -> camera name
      const urlToCameraName = {};
      cameras.forEach(camera => {
        try {
          if (!camera.statistic_api_url) return;
          let apiUrl = camera.statistic_api_url.trim();
          if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
            apiUrl = 'http://' + apiUrl;
          }
          const baseUrl = new URL(apiUrl).origin;
          // console.log("baseUrl:===========>", baseUrl);
          urlToCameraName[baseUrl] = camera.name;
        } catch (error) {
          console.error(`Invalid URL in camera ${camera.name}:`, camera.statistic_api_url, error);
        }
      });

      const statisticUrls = Object.keys(urlToCameraName);

      // Lấy dữ liệu ban đầu
      await fetchAndUpdateStatus(statisticUrls);

      // Thiết lập interval để cập nhật dữ liệu mỗi 5 giây
      setInterval(async () => { await fetchAndUpdateStatus(statisticUrls); await fetchLogs(); }, 5000);
      fetchLogs();
      // setInterval(async () => { await fetchAndUpdateStatus(statisticUrls); }, 5000);
    } catch (error) {
      console.error('Error setting up initial data:', error);
    }
  };

  setupInitialData();

  // Gọi fetchLogs để lấy logs
  fetchLogs();
});

// Tính tổng kết (nếu cần sử dụng ở nơi khác)
const totalSummary = computed(() => ({
  visitors: visitors.value,
  alarms: alarms.value,
  violations: violations.value,
}));

// Hàm lọc logs (nếu cần)
// const applyFilters = () => {
//   filteredLogs.value = allLogs.value
// }

const length_alerts = computed(() => filteredLogs.value.length)


// Hiển thị tối đa 10 alerts
const displayedAlerts = computed(() => {
  // console.log("alerts.value ::: ", alerts.value);
  return alerts.value.slice(0, 10)
})

// Gọi fetchLogs khi component được mounted
fetchLogs()
/////////////////////////////////////////////////////////////////////////////////


// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

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

// const prevPage = () => {
//   if (currentPage.value > 1) {
//     currentPage.value--
//   }
// }

// const nextPage = () => {
//   if (currentPage.value < totalPages.value) {
//     currentPage.value++
//   }
// }

// const viewDetails = (log) => {
//   selectedLog.value = log
// }


async function postNotification(log, action, status) {
  const url_post = `${log.baseUrl}/notification_action`;
  console.log("url_post ::: ", log.baseUrl);
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

// // Khi nhấn Accept
function accept(log) {
  postNotification(log, 'OK', 'Violation');
}

// // Khi nhấn Decline
function decline(log) {
  postNotification(log, 'NG', 'Alert');
}

// Lifecycle hooks
onMounted(() => {
  fetchLogs()
})

// Watch for pageSize changes
watch(pageSize, () => {
  goToPage(1)
})
