// components/cctv/CCTV_MonitoringHeader.vue (Updated)
<template>
  <header
    class="bg-gray-800/60 backdrop-blur-xl border-b border-white/10 h-16 px-6 flex items-center justify-between text-gray-200 flex-shrink-0 shadow-lg">
    <div class="flex items-center">
      <button
        @click="emit('toggle-sidebar')"
        title="Toggle Sidebar"
        class="mr-4 text-gray-400 hover:text-white focus:outline-none rounded-full p-2 hover:bg-white/10 transition cursor-pointer"
      >
        <i class="pi pi-bars text-xl"></i>
      </button>
      <div class="flex items-center mr-6">
        <!-- <i class="pi pi-video text-accent mr-4 text-blue-400" style="font-size: 23px;"></i> -->
        <p class="text-white text-2xl font-bold tracking-tight flex">
          <!-- <span class="text-white mr-2">CPEG-AI</span> -->
          <img src="/img/logo.e3ac0faa-white.svg" alt="Foxconn Industrial Internet" class="h-10 mr-2" />
          <span class="text-blue-200">{{ $t('FAISmart_Security') }}</span>
        </p>
      </div>

    </div>

    <div class="flex items-center gap-5">
      <div class="text-gray-300 text-md flex items-center">
        <!-- ToggleButton here -->
        <div class="text-right mr-3 tabular-nums">{{ currentDate }}</div>
        <div class="text-xl font-semibold text-gray-100 tabular-nums">{{ currentTime }}</div>
      </div>

      <!-- Chuyển đổi ngôn ngữ -->
      <div class="card flex justify-center">
        <Select v-model="selectedLanguage" :options="languages" optionLabel="name" placeholder="Select Language"
          class="md:w-24" style="background-color: rgba(31, 41, 55, 0.6);" @change="changeLanguage" />
      </div>

      

      <!-- <button title="Notifications"
        class="relative text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 rounded-full p-1 hover:bg-white/10 transition">
        <i class="pi pi-bell text-xl"></i>
        <span class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-gray-800 bg-red-500"></span>
      </button> -->
      
      
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineEmits } from 'vue'
import { useAuthStore } from '@/stores'
// Removed PrimeVue Button import, using standard buttons now
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
  // { label: t('subscription'), command: () => alert(t('no_subscription')) },
  // { label: t('team'), command: () => alert(t('no_team')) },
  // { label: t('billing'), command: () => alert(t('no_billing')) }
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
/* Add specific overrides if needed */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
