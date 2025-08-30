<template>
  <div class="error-trend-chart">
    <canvas ref="chartCanvas"></canvas>
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-70">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import { registerables } from 'chart.js';

// Đảm bảo các module cần thiết được đăng ký
Chart.register(...registerables);

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  timeRange: {
    type: String,
    default: 'week'
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  height: {
    type: String,
    default: '100%'
  }
});

const chartCanvas = ref(null);
const loading = ref(false);
let chart = null;

// Gradient cho các dataset
const createGradient = (ctx, colorStart, colorEnd) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

// Khởi tạo biểu đồ
const initChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');

  // Tùy chỉnh dữ liệu với gradient
  const customizedData = {
    ...props.chartData,
    datasets: props.chartData.datasets.map((dataset, index) => {
      let fillColor;
      let borderColor;

      if (index === 0) {
        // Total errors - Purple gradient
        fillColor = createGradient(ctx, 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.01)');
        borderColor = '#8b5cf6';
      } else if (index === 1) {
        // Resolved errors - Green gradient
        fillColor = createGradient(ctx, 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.01)');
        borderColor = '#10b981';
      } else {
        // Fallback
        fillColor = createGradient(ctx, 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.01)');
        borderColor = '#3b82f6';
      }

      return {
        ...dataset,
        backgroundColor: fillColor,
        borderColor: borderColor,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColor,
        tension: 0.4
      };
    })
  };

  // Cấu hình chart
  chart = new Chart(ctx, {
    type: 'line',
    data: customizedData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 0,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#e2e8f0', // text-slate-200
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            font: {
              family: "'Inter', sans-serif",
              size: 12
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#1e293b', // bg-slate-800
          titleColor: '#f8fafc', // text-slate-50
          bodyColor: '#e2e8f0', // text-slate-200
          borderColor: '#475569', // border-slate-600
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true,
          usePointStyle: true,
          callbacks: {
            title: function (context) {
              return context[0].label;
            },
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y} lỗi`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: props.showGrid,
            color: props.showGrid ? '#334155' : 'transparent', // slate-700
            drawBorder: false
          },
          ticks: {
            color: '#cbd5e1', // slate-300
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            padding: 10
          }
        },
        y: {
          grid: {
            display: props.showGrid,
            color: props.showGrid ? '#334155' : 'transparent', // slate-700
            drawBorder: false
          },
          ticks: {
            color: '#cbd5e1', // slate-300
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            padding: 10,
            stepSize: 10
          },
          beginAtZero: true
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
};

// Cập nhật biểu đồ khi dữ liệu thay đổi
watch(() => props.chartData, (newData) => {
  if (chart) {
    loading.value = true;

    // Cập nhật dữ liệu với timeout để có hiệu ứng loading
    setTimeout(() => {
      chart.data.labels = newData.labels;
      chart.data.datasets.forEach((dataset, i) => {
        dataset.data = newData.datasets[i].data;
      });
      chart.update('normal');
      loading.value = false;
    }, 500);
  }
}, { deep: true });

// Cập nhật hiển thị lưới khi thuộc tính showGrid thay đổi
watch(() => props.showGrid, (showGrid) => {
  if (chart) {
    chart.options.scales.x.grid.display = showGrid;
    chart.options.scales.y.grid.display = showGrid;
    chart.update('normal');
  }
});

// Cập nhật khi thay đổi khoảng thời gian
watch(() => props.timeRange, () => {
  if (chart) {
    // Tại đây có thể thực hiện các tác vụ thay đổi dữ liệu dựa trên timeRange
    // Ví dụ: gọi API để lấy dữ liệu mới hoặc xử lý dữ liệu hiện có

    // Mô phỏng việc loading dữ liệu mới
    loading.value = true;
    setTimeout(() => {
      chart.update('normal');
      loading.value = false;
    }, 800);
  }
});

onMounted(() => {
  nextTick(() => {
    try {
      initChart();
    } catch (err) {
      console.error('Lỗi khi khởi tạo biểu đồ:', err);
    }
  });
  // Theo dõi sự thay đổi kích thước màn hình
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // Dọn dẹp
  if (chart) {
    chart.destroy();
    chart = null;
  }
  window.removeEventListener('resize', handleResize);
});

// Xử lý khi thay đổi kích thước màn hình
const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};

// Phương thức public để export
const exportChart = () => {
  if (!chart) return null;
  return chartCanvas.value.toDataURL('image/png');
};

// Hiển thị loading
const showLoading = () => {
  loading.value = true;
};

// Ẩn loading
const hideLoading = () => {
  loading.value = false;
};

// Expose public methods
defineExpose({
  exportChart,
  showLoading,
  hideLoading
});
</script>
  
<style scoped>
.error-trend-chart {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 300px;
}
</style>