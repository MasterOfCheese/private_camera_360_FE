<template>
  <div class="error-trend-chart relative" :style="{ height }">
    <canvas ref="chartCanvas"></canvas>
    <!-- overlay loading -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-slate-800/70">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  chartData: { type: Object, required: true },
  showGrid: { type: Boolean, default: true },
  height: { type: String, default: '100%' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['loaded'])

const chartCanvas = ref(null)
let chart = null

const gradient = (ctx, from, to) => {
  const g = ctx.createLinearGradient(0, 0, 0, 400)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  return g
}

const buildDatasets = (ctx, datasets) =>
  datasets.map((ds, idx) => {
    const colors = [
      { fill: 'rgba(139,92,246,.2)', stroke: '#8b5cf6' }, // purple
      { fill: 'rgba(16,185,129,.2)', stroke: '#10b981' }, // green
      { fill: 'rgba(59,130,246,.2)', stroke: '#3b82f6' }  // blue (fallback)
    ][idx] || { fill: 'rgba(100,116,139,.2)', stroke: '#64748b' }

    return {
      ...ds,
      backgroundColor: gradient(ctx, colors.fill, colors.fill.replace('.2', '.01')),
      borderColor: colors.stroke,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: colors.stroke,
      pointHoverBorderColor: colors.stroke,
      tension: 0.4,
      fill: true
    }
  })

const initChart = () => {
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.chartData.labels,
      datasets: buildDatasets(ctx, props.chartData.datasets)
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 0, right: 20, bottom: 20, left: 20 } },
      interaction: { mode: 'index', intersect: false },
      hover: { mode: 'nearest', intersect: true },
      animation: {
        duration: 800,
        easing: 'easeOutQuart',
        onComplete: () => {
          emit('loaded')
        }
      },
      plugins: {
        legend: {
          position: 'top', align: 'end',
          labels: { color: '#e2e8f0', usePointStyle: true, pointStyle: 'circle', padding: 16 }
        },
        tooltip: {
          backgroundColor: '#1e293b', borderColor: '#475569', borderWidth: 1,
          titleColor: '#f8fafc', bodyColor: '#e2e8f0', cornerRadius: 6,
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} lỗi`
          }
        }
      },
      scales: {
        x: {
          grid: { display: props.showGrid, color: '#334155', drawBorder: false },
          ticks: { color: '#cbd5e1', padding: 6 }
        },
        y: {
          beginAtZero: true,
          grid: { display: props.showGrid, color: '#334155', drawBorder: false },
          ticks: { color: '#cbd5e1', padding: 6, stepSize: 10 }
        }
      }
    }
  })
}

watch(() => props.chartData, async (newData) => {
  if (!chart) {
    await nextTick(initChart)
    return
  }

  const ctx = chartCanvas.value.getContext('2d')
  chart.data.labels = [...newData.labels]
  chart.data.datasets = buildDatasets(ctx, newData.datasets)

  chart.options.animation = {
    duration: 800,
    easing: 'easeOutQuart',
    onComplete: () => {
      emit('loaded') // ✅ thông báo đã xong
    }
  }

  chart.update()
}, { deep: true, immediate: true })

watch(() => props.showGrid, (val) => {
  if (chart) {
    chart.options.scales.x.grid.display = val
    chart.options.scales.y.grid.display = val
  }
})

onMounted(() => window.addEventListener('resize', () => chart && chart.resize()))
onBeforeUnmount(() => {
  chart?.destroy()
  window.removeEventListener('resize', () => chart && chart.resize())
})

const exportChart = () => chartCanvas.value?.toDataURL('image/png')
defineExpose({ exportChart })
</script>
