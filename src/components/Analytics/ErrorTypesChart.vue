<!-- <template>
  <div>
    Thẻ div này sẽ chứa biểu đồ doughnut
    <canvas ref="chartCanvas" class="w-[250px] h-[250px]"></canvas>
  </div>
</template>
  
<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

const chartCanvas = ref(null);
let chart = null;

// Khởi tạo biểu đồ
const initChart = () => {
  const ctx = chartCanvas.value.getContext('2d');

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#e2e8f0' // text-slate-200
          }
        },
        tooltip: {
          backgroundColor: '#1e293b', // bg-slate-800
          titleColor: '#f8fafc', // text-slate-50
          bodyColor: '#e2e8f0', // text-slate-200
          borderColor: '#475569', // border-slate-600
          borderWidth: 1
        }
      },
      cutout: '65%',
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
};

// Cập nhật biểu đồ khi dữ liệu thay đổi
watch(() => props.chartData, (newData) => {
  if (chart) {
    chart.data = newData;
    chart.update();
  }
}, { deep: true });

onMounted(() => {
  initChart();
});
</script>

 -->

<template>
  <div>
    <!-- Thẻ div này sẽ chứa biểu đồ doughnut -->
    <canvas ref="chartCanvas" class="w-[250px] h-[250px]"></canvas>
  </div>
</template>
  
<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

const chartCanvas = ref(null);
let chart = null;

// Khởi tạo biểu đồ với thiết kế kiểu AI
const initChart = () => {
  const ctx = chartCanvas.value.getContext('2d');

  // Định nghĩa màu sắc kiểu AI
  const aiColors = [
    '#3b82f6', // xanh dương
    '#10b981', // xanh lá
    '#8b5cf6', // tím
    '#06b6d4', // xanh ngọc
    '#ec4899', // hồng
    '#f59e0b'  // cam
  ];

  // Chuẩn bị dữ liệu với màu sắc AI
  const enhancedData = {
    ...props.chartData,
    datasets: props.chartData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: aiColors,
      borderColor: '#0f172a',
      borderWidth: 2,
      hoverBorderWidth: 0,
      hoverOffset: 15
    }))
  };

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: enhancedData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#f8fafc', // text-slate-50 sáng hơn
            font: {
              family: "'Inter', 'Roboto', sans-serif",
              weight: 500
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          enabled: true, // Đảm bảo tooltip được bật
          backgroundColor: 'rgba(15, 23, 42, 0.8)', // bg-slate-900 với opacity
          titleColor: '#f8fafc', // text-slate-50
          bodyColor: '#e2e8f0', // text-slate-200
          borderColor: '#475569', // border-slate-600
          borderWidth: 0,
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
          // Sửa tooltip callback để tương thích với Chart.js
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;

              // Tính tổng
              const dataset = context.dataset;
              const total = dataset.data.reduce((sum, val) => sum + val, 0);

              // Tính phần trăm
              const percentage = Math.round((value / total) * 100);

              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '75%', // Tăng kích thước lỗ hổng để trông hiện đại hơn
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1500,
        easing: 'easeOutQuart'
      },
      layout: {
        padding: 20
      },
      elements: {
        arc: {
          borderAlign: 'inner',
          borderRadius: 5 // Góc bo tròn cho phần tử biểu đồ
        }
      },
      // Đảm bảo interaction được bật
      interaction: {
        mode: 'index',
        intersect: false
      },
      // Đảm bảo hover được bật
      events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']
    },
    plugins: [{
      id: 'aiGlow',
      beforeDraw: function (chart) {
        // Hiệu ứng phát sáng cho biểu đồ
        const ctx = chart.ctx;
        ctx.shadowColor = 'rgba(30, 64, 175, 0.25)';
        ctx.shadowBlur = 15;
      },
      afterDraw: function (chart) {
        // Thêm hiệu ứng trung tâm
        try {
          const width = chart.chartArea.right - chart.chartArea.left;
          const height = chart.chartArea.bottom - chart.chartArea.top;
          const ctx = chart.ctx;

          // Tính toán vị trí trung tâm và bán kính
          const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
          const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

          // Kiểm tra thuộc tính innerRadius có tồn tại không
          let radius = 0;
          if (chart.innerRadius !== undefined) {
            radius = chart.innerRadius * 0.8;
          } else if (chart.scales && chart.scales.r) {
            radius = chart.scales.r.innerRadius * 0.8;
          } else {
            // Nếu không lấy được innerRadius, sử dụng giá trị mặc định
            radius = Math.min(width, height) * 0.2;
          }

          // Vẽ vòng tròn trung tâm
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fill();

          // Kiểm tra data có tồn tại không để tránh lỗi
          if (chart.data && chart.data.datasets && chart.data.datasets[0] && chart.data.datasets[0].data) {
            // Thêm text vào giữa biểu đồ
            const totalValue = chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Hiển thị tổng số
            ctx.font = "bold 20px 'Inter', 'Roboto', sans-serif";
            ctx.fillStyle = '#f8fafc';
            ctx.fillText(totalValue.toString(), centerX, centerY - 10);

            // Hiển thị nhãn
            ctx.font = "12px 'Inter', 'Roboto', sans-serif";
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Total', centerX, centerY + 10);
          }
        } catch (error) {
          console.error('Lỗi khi vẽ trung tâm:', error);
        }
      }
    }]
  });
};

import isEqual from 'lodash/isEqual';

let previousData = null;

watch(() => props.chartData, (newData) => {
  if (!chart) return;

  // So sánh dữ liệu mới với dữ liệu trước đó
  if (isEqual(newData, previousData)) {
    return; // Không làm gì nếu dữ liệu không thay đổi
  }

  const cloned = JSON.parse(JSON.stringify(newData));

  // Cập nhật màu sắc AI
  const aiColors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b'
  ];

  cloned.datasets.forEach(dataset => {
    dataset.backgroundColor = aiColors;
    dataset.borderColor = '#0f172a';
    dataset.borderWidth = 2;
    dataset.hoverBorderWidth = 0;
    dataset.hoverOffset = 15;
  });

  chart.data = cloned;
  chart.update();

  // Cập nhật lại dữ liệu cũ để so sánh lần sau
  previousData = JSON.parse(JSON.stringify(newData));
}, { deep: true });

onMounted(() => {
  initChart();
});
</script>