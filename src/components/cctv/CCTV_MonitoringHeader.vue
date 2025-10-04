// components/cctv/CCTV_MonitoringHeader.vue (Updated)
<template>
  <header
    class="bg-gray-800/60 backdrop-blur-xl border-b border-white/10 h-16 px-6 flex items-center justify-between text-gray-200 flex-shrink-0 shadow-lg">
    <div class="flex items-center">
      <button @click="emit('toggle-sidebar')" title="Toggle Sidebar"
        class="mr-4 text-gray-400 hover:text-white focus:outline-none rounded-full p-2 hover:bg-white/10 transition cursor-pointer">
        <i class="pi pi-bars text-xl"></i>
      </button>
      <div class="flex items-center mr-6">
        <p class="text-white text-2xl font-bold tracking-tight flex">
          <img src="/img/logo.e3ac0faa-white.svg" alt="Foxconn Industrial Internet" class="h-10 mr-2" />
          <span class="text-blue-200">{{ $t('FAISmart_Security') }}</span>
        </p>
      </div>
    </div>

    <div class="flex items-center gap-5">
      <div class="text-gray-300 text-md flex items-center">
        <div class="text-right mr-3 tabular-nums">{{ currentDate }}</div>
        <div class="text-xl font-semibold text-gray-100 tabular-nums">{{ currentTime }}</div>
      </div>

      <!-- Chuyển đổi ngôn ngữ -->
      <div class="card flex justify-center">
        <Select v-model="selectedLanguage" :options="languages" optionLabel="name" placeholder="Select Language"
          class="md:w-24" style="background-color: rgba(31, 41, 55, 0.6);" @change="changeLanguage" />
      </div>

      <!-- Enhanced User Profile Section -->
      <div 
        @click="toggleMenu" 
        ref="buttonRef"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 border border-white/10 hover:border-blue-400/50 transition-all cursor-pointer group"
        style="user-select: none;">
        
        <!-- Avatar with status indicator -->
        <div class="relative">
          <div class="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-2 border-blue-400/30 group-hover:border-blue-400/60 transition shadow-lg">
            <i class="pi pi-user text-white text-smaller"></i>
          </div>
          <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-gray-800 bg-green-400"></span>
        </div>

        <!-- User info -->
        <div class="flex flex-col items-start">
          <span class="text-gray-200 font-semibold text-sm group-hover:text-white transition leading-tight">
            {{ authStore.user ? authStore.user.username : 'Guest' }}
          </span>
        </div>

        <!-- Dropdown indicator -->
        <i class="pi pi-angle-down text-gray-400 group-hover:text-white transition text-xs ml-1"></i>
      </div>

      <!-- Dropdown menu -->
      <OverlayPanel ref="op" :dismissable="true" style="min-width: 12rem">
        <div class="px-4 py-3 text-sm text-gray-900 dark:text-white">
          <div class="font-medium truncate">{{
            authStore.user ? authStore.user.username : 'Guest'
          }}</div>
          <div>------------------------</div>
        </div>
        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
          <li v-for="item in menuItems" :key="item.label">
            <a @click="item.command" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
              {{ item.label }}
            </a>
          </li>
        </ul>
        <div class="py-2 border-t border-gray-200 dark:border-gray-600">
          <a @click="logout"
            class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
            {{ $t("Logout") }}
          </a>
        </div>
      </OverlayPanel>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineEmits } from 'vue'
import { useAuthStore } from '@/stores'
import 'primeicons/primeicons.css'
import Select from 'primevue/select';
import OverlayPanel from 'primevue/overlaypanel'
const emit = defineEmits(['toggle-sidebar'])
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const op = ref(null)
const buttonRef = ref(null)

const user = ref({
  name: 'Bonnie Green',
  email: 'bangvietthao197@gmail.com'
})

const menuItems = computed(() => [
  { label: t('profile'), command: () => alert(t('no_profile')) },
])

function toggleMenu(event) {
  op.value.toggle(event, buttonRef.value)
}

const logout = () => {
  if (confirm(t('log_out'))) {
    authStore.logout();
  }
};

const authStore = useAuthStore()

// Date and time
const currentDate = ref('');
const currentTime = ref('');
const currentDateTime = ref('');

// Update date and time
const updateDateTime = () => {
  const now = new Date();

  currentTime.value = now.toLocaleTimeString(localeRender.value, { hour12: false });
  currentDateTime.value = now.toLocaleString(localeRender.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  currentDate.value = currentDateTime.value
};

const { locale } = useI18n();

const selectedLanguage = ref();
const languages = ref([
  { name: 'EN', code: 'en' },
  { name: 'VN', code: 'vi' },
  { name: 'ZH', code: 'zh' }
]);

// Thay đổi ngôn ngữ khi người dùng chọn
const changeLanguage = () => {
  if (selectedLanguage.value) {
    locale.value = selectedLanguage.value.code;
    localStorage.setItem('language', selectedLanguage.value.code);
  }
};

const localeRender = computed(() => {
  switch (locale.value) {
    case 'en':
      return 'en-US';
    case 'vi':
      return 'vi-VN';
    case 'zh':
      return 'zh-CN';
    default:
      return 'Unknown Language';
  }
})

onMounted(() => {
  const savedLanguage = localStorage.getItem('language') || 'en';
  locale.value = savedLanguage;
  selectedLanguage.value = languages.value.find(lang => lang.code === savedLanguage);
  updateDateTime()
  setInterval(updateDateTime, 1000)
})

watch(() => locale.value, () => {
  updateDateTime()
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>