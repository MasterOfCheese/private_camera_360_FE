// import { computed } from 'vue'
import { i18n } from '@/i18n' // Import i18n instance từ nơi bạn đã tạo

export function useChartI18n () {
  const t = i18n.global.t
  const locale = i18n.global.locale

  const dayKeys = ['day.sun', 'day.mon', 'day.tue', 'day.wed', 'day.thu', 'day.fri', 'day.sat']

  // Trả về tên thứ tương ứng với chỉ số 0–6 (CN–T7)
  const weekdayLabel = function (idx) {
    return t(dayKeys[idx])
  }

  // Trả về thứ tự sắp xếp Thứ 2–Thứ 7–Chủ nhật
  const weekdayRank = function (idx) {
    return idx === 0 ? 8 : idx + 1
  }

  // Trả về nhãn tuần dạng "Tuần N" hoặc "Week N"
  const weekLabel = function (num) {
    return t('weekLabel', { num })
  }

  const dsLabel = {
    alarms : computed(() => t('chart.alarms')),
    pending: computed(() => t('chart.pending')),
    ack    : computed(() => t('chart.ack'))
  }

  return {
    t,
    locale,
    weekdayLabel,
    weekdayRank,
    weekLabel,
    dsLabel
  }
}
