// src/i18n/index.js
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import vi from './locales/vi.json';

const i18n = createI18n({
  legacy: false, // Sử dụng Composition API
  locale: localStorage.getItem('language') || 'en', // Ngôn ngữ mặc định
  fallbackLocale: 'en', // Ngôn ngữ dự phòng
  messages: {
    en,
    vi
  }
});

export default i18n;

// src/main.js (hoặc src/main.ts nếu bạn dùng TypeScript)
import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import i18n from './i18n';

// Import các thành phần PrimeVue cần thiết
import Select from 'primevue/select';

// Import các styles của PrimeVue (có thể thay đổi tùy theo theme)
import 'primevue/resources/themes/lara-light-indigo/theme.css';
import 'primevue/resources/primevue.min.css';

const app = createApp(App);

app.use(PrimeVue);
app.use(i18n);

// Đăng ký component toàn cục
app.component('Select', Select);

app.mount('#app');