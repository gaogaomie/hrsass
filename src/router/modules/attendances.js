import Layout from '@/layout/index.vue'
export default {
  path: '/attendances',
  name: 'attendances',
  component: Layout,
  children: [{
    path: '',
    component: () => import('@/views/attendances'),
    meta: {
      title: '出勤',
      icon: 'skill'
    }
  }]
}
