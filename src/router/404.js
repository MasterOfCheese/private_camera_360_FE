export default {
  path: '/:catchAll(.*)*',
  name: 'NotFound',
  component: () => import(/* webpackChunkName: "404" */ '@/views/NotFoundView.vue'),
}
