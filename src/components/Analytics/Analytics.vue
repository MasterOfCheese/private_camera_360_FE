<template>
    <div class="min-h-screen bg-slate-900">
        <!-- Header -->
        <!-- <header class="bg-slate-800 text-white py-4 px-6 shadow-lg">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="text-2xl font-bold text-purple-400 ml-5">AI Camera Error Analytics</h1>
                <div class="flex space-x-2">
                    <button class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm">
                        Xuất báo cáo
                    </button>
                    <button class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm">
                        Cài đặt
                    </button>
                </div>
            </div>
        </header> -->

        <!-- Main Content -->
        <main class="container mx-auto p-6">
            <!-- Filter Bar -->
            <!-- <div class="bg-slate-800 rounded-lg p-4 mb-6 shadow-md">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm text-slate-400 mb-1">Khoảng thời gian</label>
                        <select class="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                            <option>7 ngày qua</option>
                            <option>30 ngày qua</option>
                            <option>3 tháng qua</option>
                            <option>Tùy chỉnh</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-slate-400 mb-1">Vị trí camera</label>
                        <select class="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                            <option>Tất cả</option>
                            <option>Khu vực 1</option>
                            <option>Khu vực 2</option>
                            <option>Khu vực 3</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-slate-400 mb-1">Trạng thái xử lý</label>
                        <select class="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                            <option>Tất cả</option>
                            <option>Đã xử lý</option>
                            <option>Chưa xử lý</option>
                        </select>
                    </div>
                </div>
            </div> -->

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

                <div
                    class="bg-gradient-to-br from-emerald-900 to-teal-800 rounded-lg p-4 shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-indigo-200 text-sm">{{ $t('Visitors') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-1">{{ todayVisitors }}</h3>
                            <p class="text-indigo-200 text-xs mt-2">
                                <span :class="visitorsChange >= 0 ? 'text-red-400' : 'text-green-400'">
                                    {{ visitorsChange >= 0 ? '↑' : '↓' }} {{ Math.abs(visitorsChange) }}%
                                </span>
                                {{ $t('compared_to_the_previous_day') }} ({{ yesterdayVisitors }})
                            </p>
                        </div>
                        <div class="bg-emerald-800 p-2 rounded-lg">
                            <div class="h-8 w-8 text-white flex items-center justify-center">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-gradient-to-br from-purple-900 to-indigo-800 rounded-lg p-4 shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-indigo-200 text-sm">{{ $t('Alarms') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-1">{{ todayAlarms }}</h3>
                            <p class="text-indigo-200 text-xs mt-2">
                                <span :class="alarmsChange >= 0 ? 'text-red-400' : 'text-green-400'">
                                    {{ alarmsChange >= 0 ? '↑' : '↓' }} {{ Math.abs(alarmsChange) }}%
                                </span>
                                {{ $t('compared_to_the_previous_day') }} ({{ yesterdayAlarms }})
                            </p>
                        </div>

                        <div class="bg-purple-800 p-2 rounded-lg">
                            <div class="h-8 w-8 text-white flex items-center justify-center">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-gradient-to-br from-red-900 to-rose-800 rounded-lg p-4 shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-red-200 text-sm">{{ $t('Pending') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-1">{{ todayPending }}</h3>
                            <p class="text-indigo-200 text-xs mt-2">
                                <span :class="pendingChange >= 0 ? 'text-red-400' : 'text-green-400'">
                                    {{ pendingChange >= 0 ? '↑' : '↓' }} {{ Math.abs(pendingChange) }}%
                                </span>
                                {{ $t('compared_to_the_previous_day') }} ({{ yesterdayPending }})
                            </p>
                        </div>

                        <div class="bg-red-800 p-2 rounded-lg">
                            <div class="h-8 w-8 text-white flex items-center justify-center">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-gradient-to-br from-blue-900 to-cyan-800 rounded-lg p-4 shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-red-200 text-sm">{{ $t('Acknowledged') }}</p>
                            <h3 class="text-3xl font-bold text-white mt-1">{{ todayAcknowledged }}</h3>
                            <p class="text-indigo-200 text-xs mt-2">
                                <span :class="acknowledgedChange >= 0 ? 'text-red-400' : 'text-green-400'">
                                    {{ acknowledgedChange >= 0 ? '↑' : '↓' }} {{ Math.abs(acknowledgedChange) }}%
                                </span>
                                {{ $t('compared_to_the_previous_day') }} ({{ yesterdayAcknowledged }})
                            </p>
                        </div>
                        <div class="bg-blue-800 p-2 rounded-lg">
                            <div class="h-8 w-8 text-white flex items-center justify-center">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Error Types Chart -->
                <div class="bg-slate-800 rounded-lg p-4 shadow-lg">
                    <h2 class="text-lg font-semibold text-white mb-4 flex">{{ $t('Distribution_by_error_type') }}
                        <div class="card flex justify-center ml-auto">
                            <SelectButton v-model="value" :options="options" />
                        </div>
                    </h2>
                    <div class="h-64">
                        <ErrorTypesChart :chartData="errorTypesData" />
                    </div>

                </div>

                <!-- Error Locations Chart -->
                <div class="bg-slate-800 rounded-lg p-4 shadow-lg">
                    <h2 class="text-lg font-semibold text-white mb-4 flex">{{ $t('Distribution_by_error_type') }}
                        <!-- <div class="card flex justify-center ml-auto">
                            <SelectButton v-model="value_column" :options="options_column" />
                        </div> -->
                    </h2>
                    <div class="h-64">
                        <ErrorLocationsChart :chartData="errorColumnData" />
                    </div>
                </div>

                <!-- Error Trend Chart -->
                <div class="bg-slate-800 rounded-lg p-4 shadow-lg col-span-1 lg:col-span-2">
                    <h2 class="text-lg font-semibold text-white mb-4 flex justify-between items-center">
                        <span>{{ $t('Error_trends_over_time') }}</span>
                        <div class="flex items-center gap-2">
                            <input type="date" v-model="startDate" class="border rounded text-white px-2 py-1" />
                            <input type="date" v-model="endDate" class="border rounded text-white px-2 py-1" />
                            <button @click="fetchData" class="bg-blue-500 text-white px-4 py-1 rounded">{{ $t('search')
                            }}</button>
                        </div>
                    </h2>

                    <div class="h-64 ">
                        <ErrorTrendChart :chartData="errorTrendData" :loading="isLoadingChart"
                            @loaded="isLoadingChart = false" />
                    </div>
                </div>
            </div>

            <!-- Data Table -->
            <!-- <div class="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div class="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-white">Chi tiết lỗi camera</h2>
                    <div class="relative">
                        <input type="text" placeholder="Tìm kiếm..."
                            class="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white pr-8"
                            v-model="searchQuery" />
                        <svg class="h-5 w-5 text-slate-400 absolute right-2 top-2.5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-700">
                        <thead class="bg-slate-700">
                            <tr>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Tên lỗi
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Camera
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Vị trí
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Mã lỗi
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-slate-800 divide-y divide-slate-700">
                            <tr v-for="error in filteredErrors" :key="error.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {{ error.id }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {{ error.name }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {{ error.camera }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {{ error.location }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class="px-2 py-1 text-xs rounded-full" :class="getErrorCodeClass(error.code)">
                                        {{ error.code }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-300">
                                    <div class="max-w-xs truncate">{{ error.description }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class="px-2 py-1 text-xs rounded-full"
                                        :class="error.resolved ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'">
                                        {{ error.resolved ? 'Đã xử lý' : 'Chưa xử lý' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    <button class="text-indigo-400 hover:text-indigo-300 mr-3">Chi tiết</button>
                                    <button v-if="!error.resolved" class="text-emerald-400 hover:text-emerald-300">Đánh dấu
                                        đã xử lý</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="bg-slate-800 px-4 py-3 border-t border-slate-700 sm:px-6 flex items-center justify-between">
                    <div class="text-sm text-slate-400">
                        Hiển thị <span class="font-medium">1</span> đến <span class="font-medium">10</span> của <span
                            class="font-medium">{{ filteredErrors.length }}</span> kết quả
                    </div>
                    <div class="flex space-x-2">
                        <button class="bg-slate-700 px-3 py-1 rounded text-slate-300 hover:bg-slate-600">
                            Trước
                        </button>
                        <button class="bg-indigo-600 px-3 py-1 rounded text-white hover:bg-indigo-500">
                            1
                        </button>
                        <button class="bg-slate-700 px-3 py-1 rounded text-slate-300 hover:bg-slate-600">
                            2
                        </button>
                        <button class="bg-slate-700 px-3 py-1 rounded text-slate-300 hover:bg-slate-600">
                            3
                        </button>
                        <button class="bg-slate-700 px-3 py-1 rounded text-slate-300 hover:bg-slate-600">
                            Tiếp
                        </button>
                    </div>
                </div>
            </div> -->

            <!-- <div class="overflow-x-auto rounded-lg border border-gray-700">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-800 text-gray-300">
                        <tr>
                            <th class="p-4 cursor-pointer" @click="Utils.toggleSort('ID')">
                                ID
                                <SortIcon field="ID" :current="sort" />
                            </th>
                            <th class="p-4 cursor-pointer" @click="Utils.toggleSort('name')">
                                Name
                                <SortIcon field="name" :current="sort" />
                            </th>
                            <th class="p-4 cursor-pointer" @click="Utils.toggleSort('datetime')">
                                DateTime
                                <SortIcon field="datetime" :current="sort" />
                            </th>
                            <th class="p-4 cursor-pointer" @click="Utils.toggleSort('camera')">
                                Camera
                                <SortIcon field="camera" :current="sort" />
                            </th>
                            <th class="p-4 cursor-pointer" @click="Utils.toggleSort('location')">
                                Location
                                <SortIcon field="location" :current="sort" />
                            </th>
                            <th class="p-4 cursor-pointer" @click="Utils.toggleSort('Irregularity')">
                                Error Code
                                <SortIcon field="Irregularity" :current="sort" />
                            </th>
                            <th class="p-4 cursor-pointer" @click="Utils.toggleSort('Status')">
                                Status
                                <SortIcon field="Status" :current="sort" />
                            </th>
                            <th class="p-4">Actions</th>
                            <th class="p-4">Playback</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="log in Utils.paginatedLogs.value" :key="log.ID"
                            class="border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer">
                            <td class="p-4">{{ log.ID }}</td>
                            <td class="p-4">{{ log.name }}</td>
                            <td class="p-4">{{ new Date(log.datetime).toLocaleString() }}</td>
                            <td class="p-4">{{ log.camera }}</td>
                            <td class="p-4">{{ log.location }}</td>
                            <td class="p-4">{{ log.Irregularity }}</td>
                            <td class="p-4" :id="`status-${log.ID}`">{{ log.Status }}</td>
                            <td class="p-4">
                                <div v-if="log.Status === 'Pending'" class="flex gap-2">
                                    <Button label="Accept" severity="success" size="small" @click="Utils.accept(log)" />
                                    <Button label="Decline" severity="danger" size="small" @click="Utils.decline(log)" />
                                </div>
                                <div v-else>
                                    <Button :label="log.Status" :severity="log.Status === 'OK' ? 'success' : 'danger'"
                                        size="small" disabled />
                                </div>
                            </td>

                            <td class="p-4">
                                <button class="text-blue-400 hover:text-blue-300 cursor-pointer" @click="Utils.viewDetails(log)">
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

                Pagination
                <div class="flex justify-between items-center p-4">
                    Thông tin số lượng bản ghi
                    <div class="text-sm text-gray-400">
                        Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredLogs.length) }} of {{
                            filteredLogs.length }}
                        logs
                    </div>

                    Controls phân trang
                    <div class="flex items-center space-x-2">
                        Nút Previous
                        <button @click="Utils.prevPage()" :disabled="currentPage <= 1"
                            class="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            &laquo; Previous
                        </button>

                        Các nút số trang
                        <template v-for="(pageNum, index) in Utils.displayedPages" :key="index">
                            <span v-if="pageNum === '...'" class="px-3 py-1 text-gray-400">...</span>
                            <button v-else @click="Utils.goToPage(pageNum)" :class="[
                                'px-3 py-1 rounded',
                                currentPage === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            ]">
                                {{ pageNum }}
                            </button>
                        </template>

                        Nút Next
                        <button @click="Utils.nextPage()" :disabled="currentPage >= totalPages"
                            class="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next &raquo;
                        </button>
                    </div>

                    Chọn số lượng hiển thị mỗi trang
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-400">Display:</span>
                        <select v-model="pageSize" @change="Utils.goToPage(1)"
                            class="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div> -->
        </main>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import ErrorTypesChart from '@/components/Analytics/ErrorTypesChart.vue';
import ErrorLocationsChart from '@/components/Analytics/ErrorLocationsChart.vue';
import ErrorTrendChart from '@/components/Analytics/ErrorTrendChart.vue';
import SelectButton from 'primevue/selectbutton';
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

import { baseUrlList, loadCameraBaseUrls } from '@/js/datacameras.js'

// Today
const todayVisitors = ref(0)
const todayAlarms = ref(0)
const todayViolations = ref(0)
const todayPending = ref(0)
const todayAcknowledged = ref(0)

// Yesterday
const yesterdayVisitors = ref(0)
const yesterdayAlarms = ref(0)
const yesterdayViolations = ref(0)
const yesterdayPending = ref(0)
const yesterdayAcknowledged = ref(0)

// Change %
const alarmsChange = ref(0)
const visitorsChange = ref(0)
const violationsChange = ref(0)
const pendingChange = ref(0)
const acknowledgedChange = ref(0)

const calcPercent = (today, yesterday) => {
    if (yesterday === 0) return today === 0 ? 0 : 100
    return Number(((today - yesterday) / yesterday * 100).toFixed(1))
}

// Gọi từng API và trả về dữ liệu
async function fetchStatusForUrl(url) {
    try {
        const res = await fetch(`${url}/update_status`)
        const json = await res.json()
        return json
    } catch (error) {
        console.warn(`Không thể fetch từ ${url}:`, error)
        return null
    }
}

let lastSum = null // Lưu lần cuối để so sánh
// So sánh nông hai object/array (dùng lại cho cả đoạn 1 & 2)
function shallowEqual(a, b) {
  if (!a || !b) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => v === b[i])
  }
  for (const k in a) {
    if (typeof a[k] === 'object') {
      if (!shallowEqual(a[k], b[k])) return false
    } else if (a[k] !== b[k]) return false
  }
  return true
}

// Gộp dữ liệu từ nhiều nguồn
function combineData(allJsons) {
  const sum = {
    today:      { visitors: 0, alarms: 0, violations: 0, pending: 0, acknowledged: 0 },
    yesterday:  { visitors: 0, alarms: 0, violations: 0, pending: 0, acknowledged: 0 }
  }

  for (const json of allJsons) {
    if (!json) continue

    sum.today.visitors      += json.today.visitors
    sum.today.alarms        += json.today.alarms
    sum.today.violations    += json.today.violations
    sum.today.pending       += json.today.pending
    sum.today.acknowledged  += json.today.acknowledged

    sum.yesterday.visitors      += json.yesterday.visitors
    sum.yesterday.alarms        += json.yesterday.alarms
    sum.yesterday.violations    += json.yesterday.violations
    sum.yesterday.pending       += json.yesterday.pending
    sum.yesterday.acknowledged  += json.yesterday.acknowledged
  }

  // So sánh dữ liệu mới với lần trước
  if (lastSum && shallowEqual(sum, lastSum)) {
    // console.log('Không có thay đổi, không cập nhật state.')
    return
  }

  // Cập nhật state vì có thay đổi
  lastSum = structuredClone(sum) // hoặc JSON.parse(JSON.stringify(sum))

  todayVisitors.value        = sum.today.visitors
  todayAlarms.value          = sum.today.alarms
  todayViolations.value      = sum.today.violations
  todayPending.value         = sum.today.pending
  todayAcknowledged.value    = sum.today.acknowledged

  yesterdayVisitors.value    = sum.yesterday.visitors
  yesterdayAlarms.value      = sum.yesterday.alarms
  yesterdayViolations.value  = sum.yesterday.violations
  yesterdayPending.value     = sum.yesterday.pending
  yesterdayAcknowledged.value= sum.yesterday.acknowledged

  alarmsChange.value         = calcPercent(sum.today.alarms,       sum.yesterday.alarms)
  visitorsChange.value       = calcPercent(sum.today.visitors,     sum.yesterday.visitors)
  violationsChange.value     = calcPercent(sum.today.violations,   sum.yesterday.violations)
  pendingChange.value        = calcPercent(sum.today.pending,      sum.yesterday.pending)
  acknowledgedChange.value   = calcPercent(sum.today.acknowledged, sum.yesterday.acknowledged)

  console.log('Dữ liệu đã được cập nhật.')
}

// Gọi tất cả URL và tổng hợp
async function updateStatus(urls = baseUrlList.value) {
    if (!urls || urls.length === 0) return
    const promises = urls.map(fetchStatusForUrl)
    const results = await Promise.all(promises)
    combineData(results)
}

// Lần đầu mount và mỗi lần danh sách đổi
onMounted(async () => {
    await loadCameraBaseUrls()
    console.log("baseUrlList.value ::: ", baseUrlList.value)
    await updateStatus(baseUrlList.value)
})

/** Trả về hàm và hằng hỗ trợ dịch & sắp xếp thứ/tuần */
function useChartI18n() {
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
        alarms: computed(() => t('chart.alarms')),
        pending: computed(() => t('chart.pending')),
        ack: computed(() => t('chart.ack'))
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

// const { weekdayLabel, weekdayRank, weekLabel, locale, dsLabel } = useChartI18n()

const value = ref(t('Day'));
const options = ref([t('Day'), t('Week'), t('Month')]);

const errorTypesData = ref({
    labels: [
        t('no_shirt'),
        'báo động Cúi người',
        'Quá thời gian',
        'Ném báo động',
        'Báo động cửa điện tử',
        'Nối đuôi'
    ],

    datasets: [
        {
            backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b'],
            data: [0, 0, 0, 0, 0, 0],
        }
    ]
})

const errorMapping = {
    '未穿戴静电衣': 0,
    'NG, 未穿戴静电衣': 0,
    'NG, No Shirt': 0,
    'NG, No PPE': 0,
    '弯腰报警': 1,
    'NG, Bend over alarm': 1,
    'NG, Bend': 1,
    'NG, 弯腰报警': 1,
    '超过时间': 2,
    '抛物报警': 3,
    '电子门报警': 4,
    '尾随报警': 5,
    'NG, 尾随报警': 5
}

const errorColumnData = ref({
    labels: ['未穿戴静电衣', '弯腰报警', '超过时间', '抛物报警', '电子门报警', "排成一列"],
    datasets: [
        {
            backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b'],
            data: [0, 0, 0, 0, 0, 0],
        }
    ]
});

async function fetchAndUpdateStatus(query, urls = baseUrlList.value) {
  if (!urls || urls.length === 0) return
  const promises = urls.map(u => fetchStatsForUrl(u, query))
  const results  = await Promise.all(promises)
  combineDataQuery(results)
}


async function fetchStatsForUrl(url, query) {
  try {
    const res  = await fetch(`${url}/notification_stats?query=${query}`)
    return await res.json()            // → mảng object [{ Irregularity: "..." }, ...]
  } catch (err) {
    console.warn(`Không fetch được ${url}:`, err)
    return null
  }
}

let lastChart = {             // lưu kết quả lần trước
  types:   [],
  columns: []
}

function combineDataQuery(allJsons) {
  // Chuẩn bị mảng đếm = số phần tử của errorMapping
  const size        = Object.keys(errorMapping).length
  const typesTemp   = Array(size).fill(0)
  const columnsTemp = Array(size).fill(0)

  for (const json of allJsons) {
    if (!json) continue
    json.forEach(item => {
      const irregularity = item.Irregularity
      if (!irregularity) return

      for (const [key, idx] of Object.entries(errorMapping)) {
        if (irregularity.includes(key)) {
          typesTemp[idx]++
          columnsTemp[idx]++
          break
        }
      }
    })
  }

  // Không thay đổi → thoát sớm
  if (
    lastChart.types.length &&
    shallowEqual(typesTemp,   lastChart.types) &&
    shallowEqual(columnsTemp, lastChart.columns)
  ) {
    // console.log('Chart giữ nguyên')
    return
  }

  // Có thay đổi → ghi lại & cập nhật reactive state
  lastChart = {
    types:   structuredClone(typesTemp),
    columns: structuredClone(columnsTemp)
  }

  // Cập nhật datasets (Chart.js/Vue-chart-3)
  errorTypesData.value.datasets[0].data.splice(0, size, ...typesTemp)
  errorColumnData.value.datasets[0].data.splice(0, size, ...columnsTemp)

  console.log('Thống kê lỗi đã cập nhật.')
}



const mode = ref('day') // hoặc 'week', 'month'
// Mapping
const MODE_QUERY = {
  day: 'now',
  week: 'week',
  month: 'month'
}

let currentMode = null

function setupStatsInterval(mode) {
  if (mode === currentMode) return  // ⚠ Ngăn gọi lại nếu mode không đổi
  currentMode = mode

  console.log('⚙ setupStatsInterval được gọi với:', mode)

  if (statsInterval) clearInterval(statsInterval)

  const query = MODE_QUERY[mode] ?? 'now'
  fetchAndUpdateStatus(query)

  statsInterval = setInterval(() => fetchAndUpdateStatus(query), 5000)
}


onMounted(async () => {
  // 1. Tải danh sách baseUrl
  await loadCameraBaseUrls()

  // 2. Nếu đã có camera → gọi update + thiết lập thống kê
  if (baseUrlList.value.length > 0) {
    await updateStatus(baseUrlList.value)
    setupStatsInterval(value.value)
  }

  // 3. Cập nhật lại mỗi 5s
  setInterval(() => updateStatus(baseUrlList.value), 5000)

  // 4. Các hàm fetch khác nếu cần
  fetchData()
})

// Theo dõi thay đổi chế độ hiển thị (Day / Week / Month)
watch(mode, (newVal) => {
  setupStatsInterval(newVal)
})

// Xoá interval khi component bị huỷ (tránh memory leak)
onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval)
})

dayjs.extend(weekOfYear)

const today = dayjs().format('YYYY-MM-DD')
const oneWeekAgo = dayjs().subtract(10, 'day').format('YYYY-MM-DD')
const startDate = ref(oneWeekAgo)
const endDate = ref(today)
const isLoadingChart = ref(false) // 👈 biến điều khiển loading
const errorTrendData = ref({ labels: [], datasets: [] })

async function fetchData() {
    if (!startDate.value || !endDate.value) return
    isLoadingChart.value = true // bật loading trước khi gọi API

    const startTs = dayjs(startDate.value).startOf('day').unix()
    const endTs = dayjs(endDate.value).endOf('day').unix()

    const url = `http://127.0.0.1:8001/api/get_information?start_time=${startTs}&end_time=${endTs}&page=1&size=10000`

    try {
        const { data: raw } = await (await fetch(url)).json()

        const viDayLabel = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        const viDaySort = [8, 2, 3, 4, 5, 6, 7]          // sắp thứ tự Th2‑Th7‑CN

        /** key: "Tuần N - Thứ X"  →  value: {total, ok, pending, sortVal} */
        const grouped = {}

        raw.forEach(item => {
            // Chỉ đếm bản ghi thật sự là lỗi
            if (item.abnormal === 1 && item.irregularity?.trim()) {
                const date = dayjs.unix(item.time)
                const weekLbl = `Tuần ${date.week()}`
                const dayIdx = date.day()         // 0‑6 (CN‑T7)
                const dayLbl = viDayLabel[dayIdx]
                const sortVal = viDaySort[dayIdx]

                const key = `${weekLbl} - ${dayLbl}`

                if (!grouped[key]) {
                    grouped[key] = { total: 0, ok: 0, pending: 0, sortVal }
                }

                grouped[key].total += 1
                if (item.status === 'OK') {
                    grouped[key].ok += 1
                } else {
                    grouped[key].pending += 1
                }
            }
        })

        // Sắp xếp: tuần ↑ rồi thứ ↑ (Th2…Th7…CN)
        const labels = Object.keys(grouped).sort((a, b) => {
            const weekA = +a.split(' - ')[0].replace('Tuần ', '')
            const weekB = +b.split(' - ')[0].replace('Tuần ', '')
            if (weekA !== weekB) return weekA - weekB
            return grouped[a].sortVal - grouped[b].sortVal
        })

        const totalErrors = labels.map(l => grouped[l].total)
        const pending = labels.map(l => grouped[l].pending)
        const ok = labels.map(l => grouped[l].ok)

        errorTrendData.value = {
            labels,
            datasets: [
                {
                    label: 'alarms',
                    data: totalErrors,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    tension: .4,
                    fill: true
                },
                {
                    label: 'Pending',
                    data: pending,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: .4,
                    fill: true
                },
                {
                    label: 'Acknowledged',
                    data: ok,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    tension: .4,
                    fill: true
                }
            ]
        }
    } catch (err) {
        console.error('Lỗi khi gọi API:', err)
        isLoadingChart.value = false
    }
}

// Error data for table
const errors = ref([
    { id: 'ERR001', name: 'Mất kết nối', camera: 'CAM-01', location: 'Khu vực A - Cổng chính', code: 'E404', description: 'Camera mất kết nối với máy chủ trong 30 phút', resolved: true },
    { id: 'ERR002', name: 'Nhiễu hình ảnh', camera: 'CAM-03', location: 'Khu vực B - Hành lang', code: 'E202', description: 'Hình ảnh bị nhiễu, không rõ nét', resolved: false },
    { id: 'ERR003', name: 'Lỗi phần mềm', camera: 'CAM-05', location: 'Khu vực A - Phòng họp', code: 'E501', description: 'Phần mềm xử lý hình ảnh bị treo', resolved: true },
    { id: 'ERR004', name: 'Mất điện', camera: 'CAM-02', location: 'Khu vực C - Sảnh', code: 'E303', description: 'Camera bị mất điện do sự cố', resolved: true },
    { id: 'ERR005', name: 'Góc quay lệch', camera: 'CAM-07', location: 'Khu vực D - Bãi đỗ xe', code: 'E102', description: 'Góc quay camera bị lệch khỏi vị trí cài đặt', resolved: false },
    { id: 'ERR006', name: 'Lỗi cảm biến', camera: 'CAM-09', location: 'Khu vực B - Cửa sau', code: 'E405', description: 'Cảm biến chuyển động không hoạt động', resolved: false },
    { id: 'ERR007', name: 'Hình ảnh tối', camera: 'CAM-10', location: 'Khu vực E - Hầm để xe', code: 'E203', description: 'Hình ảnh quá tối, cần điều chỉnh độ sáng', resolved: true },
    { id: 'ERR008', name: 'Lỗi lưu trữ', camera: 'CAM-08', location: 'Khu vực C - Thang máy', code: 'E502', description: 'Không thể lưu trữ video do ổ cứng đầy', resolved: false },
    { id: 'ERR009', name: 'Kết nối chậm', camera: 'CAM-04', location: 'Khu vực A - Lối ra', code: 'E101', description: 'Tốc độ kết nối chậm, hình ảnh bị giật', resolved: true },
    { id: 'ERR010', name: 'Lỗi firmware', camera: 'CAM-06', location: 'Khu vực D - Kho', code: 'E503', description: 'Cần cập nhật firmware do lỗi phiên bản', resolved: false },
]);

const searchQuery = ref('');

// Computed properties
const filteredErrors = computed(() => {
    if (!searchQuery.value) return errors.value;

    const query = searchQuery.value.toLowerCase();
    return errors.value.filter(error =>
        error.id.toLowerCase().includes(query) ||
        error.name.toLowerCase().includes(query) ||
        error.camera.toLowerCase().includes(query) ||
        error.location.toLowerCase().includes(query) ||
        error.code.toLowerCase().includes(query) ||
        error.description.toLowerCase().includes(query)
    );
});

// Helper functions
const getErrorCodeClass = (code) => {
    if (code.startsWith('E1')) return 'bg-blue-900 text-blue-200';
    if (code.startsWith('E2')) return 'bg-yellow-900 text-yellow-200';
    if (code.startsWith('E3')) return 'bg-orange-900 text-orange-200';
    if (code.startsWith('E4')) return 'bg-red-900 text-red-200';
    if (code.startsWith('E5')) return 'bg-purple-900 text-purple-200';
    return 'bg-gray-900 text-gray-200';
};

</script>