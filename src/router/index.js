import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginLayout from '@/layouts/LoginLayout.vue'
import NotFoundRoute from './404.js'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/components/cctv/CCTV_MonitoringCamera.vue'),
        },
        {
          path: '/settings',
          name: 'camera',
          component: () => import('@/views/CameraSettings.vue'),
        },
        {
          path: '/notifications',
          name: 'notifications',
          component: () => import('@/components/cctv/CCTV_MonitoringEventLogTable.vue'),
        },
        {
          path: '/compass',
          name: 'compass',
          component: () => import('@/components/cctv/CCTV_Compass.vue'),
        },
        {
          path: '/analytics',
          name: 'analytics',
          component: () => import('@/components/Analytics/Analytics.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginLayout,
      children: [
        {
          path: '',
          name: 'login-view',
          component: () => import('@/views/LoginView.vue'),
        },
      ],
    },
    NotFoundRoute,
  ],
})
router.beforeEach(async (to, from) => {
  const publicPages = ['/login']
  const auth = useAuthStore()
  const authRequired = !publicPages.includes(to.path)
  const isLoggedIn = !!auth.user

  // ✅ Nếu đang cố vào /login mà đã đăng nhập → redirect về home
  if (to.path === '/login' && isLoggedIn) {
    return '/'
  }

  // ✅ Nếu cần đăng nhập mà chưa có user → redirect về login
  if (authRequired && !isLoggedIn) {
    auth.returnUrl = to.fullPath
    return '/login'
  }

  // ✅ Cho phép tiếp tục điều hướng
  return true
})

export default router
