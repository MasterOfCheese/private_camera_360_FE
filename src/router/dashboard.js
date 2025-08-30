export default {
  path: '/dashboard',
  name: 'dashboard',
  component: () => import(/* webpackChunkName: "dashboard" */ '@/views/CCTV_DashboardView.vue'),
}
