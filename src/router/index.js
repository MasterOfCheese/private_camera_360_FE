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
        { path: '/tour', component: () => import('@/components/cctv/CCTV_Tour.vue') },
        { path: '/analytics', component: () => import('@/components/Analytics/Analytics.vue') },
      ],
    },
    {
      path: '/login',
      component: LoginLayout,
      children: [{ path: '', component: () => import('@/views/LoginView.vue') }],
    },
    NotFoundRoute,
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Handle OAuth callback
  if (to.query.auth_token && to.query.username) {
    auth.completeOauthLogin(to.query.username, to.query.auth_token)
    return { path: to.path === '/login' ? '/' : to.path, query: {} }
  }

  const isLoggedIn = !!auth.user
  const authRequired = to.path !== '/login'

  if (to.path === '/login' && isLoggedIn) return '/'
  if (authRequired && !isLoggedIn) {
    auth.returnUrl = to.fullPath
    return '/login'
  }
})

export default router
