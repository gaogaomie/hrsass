import Layout from '@/layout/index.vue'
export default {
  path: '/permission',
  name: 'permission',
  component: Layout,
  children: [{
    path: '',
    component: () => import('@/views/permission'),
    meta: {
      title: '权限管理',
      icon: 'lock'
    }
  }]
}
