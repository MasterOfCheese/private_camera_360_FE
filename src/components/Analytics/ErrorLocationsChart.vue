<template>
  <div class="w-full h-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, toRaw, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import isEqual from 'lodash/isEqual'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chart = null
let previousRawData = null

// ✅ Tạo dataset cột + đường từ cùng dữ liệu
function buildMixedDataset(data) {
  const base = toRaw(data)
  const baseDataset = base.datasets[0]

  return {
    labels: base.labels,
    datasets: [
      {
        ...baseDataset,
        type: 'line',
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointBackgroundColor: '#f97316',
        pointRadius: 4,
        tension: 0.3,
        fill: false
      },
      {
        ...baseDataset,
        type: 'bar',
        backgroundColor: baseDataset.backgroundColor ?? '#3b82f6'
      }
    ]
  }
}

const initChart = () => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) {
    console.warn('Canvas chưa được mount')
    return
  }

  const mixedData = buildMixedDataset(props.chartData)

  chart = new Chart(ctx, {
    type: 'bar',
    data: mixedData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 0
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: '#475569',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: '#334155',
            drawBorder: false
          },
          ticks: {
            color: '#cbd5e1',
            padding: 0
          }
        },
        y: {
          grid: {
            color: '#334155',
            drawBorder: false
          },
          ticks: {
            color: '#cbd5e1',
            padding: 0
          },
          beginAtZero: true
        }
      },
      animation: {
        duration: 1500
      }
    }
  })
}

// ✅ Watch để cập nhật lại dữ liệu (cả cột + line)
watch(() => props.chartData, (newData) => {
  if (!chart) return

  const rawData = toRaw(newData)
  if (isEqual(rawData, previousRawData)) return

  chart.data = buildMixedDataset(rawData)
  chart.update()
  previousRawData = JSON.parse(JSON.stringify(rawData))
}, { deep: true })

// ✅ Sửa lỗi bằng cách chờ render DOM xong
onMounted(async () => {
  await nextTick()
  initChart()
})
</script>
