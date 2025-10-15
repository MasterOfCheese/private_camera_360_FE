// router/index.js
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
      component: MainLayout,
      children: [
        { path: '', component: () => import('@/components/cctv/CCTV_MonitoringCamera.vue') },
        { path: '/settings', component: () => import('@/views/CameraSettings.vue') },
        {
          path: '/notifications',
          component: () => import('@/components/cctv/CCTV_MonitoringEventLogTable.vue'),
        },
        { path: '/tour', component: () => import('@/components/line_tours/virtual_tour.vue') },
        { path: '/BBS', component: () => import('@/components/line_tours/BBS_tour.vue') },
        { path: '/analytics', component: () => import('@/components/Analytics/Analytics.vue') },
      ],
    },
    {
      path: '/login',
      component: LoginLayout,
      children: [{ path: '', component: () => import('@/views/LoginView.vue') }],
    },
    // ✅ New: OAuth Callback Route
    {
      path: '/auth',
      component: () => import('@/views/OAuthCallback.vue'),
      meta: { skipAuth: true } // Skip auth check for this route
    },
    NotFoundRoute,
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const isLoggedIn = !!auth.user
  
  // Skip auth check for OAuth callback route
  if (to.meta?.skipAuth) {
    return true
  }

  const authRequired = to.path !== '/login'

  if (to.path === '/login' && isLoggedIn) {
    return '/'
  }

  if (authRequired && !isLoggedIn) {
    auth.returnUrl = to.fullPath
    return { path: '/login', query: { returnUrl: to.fullPath } }
  }
})

export default router