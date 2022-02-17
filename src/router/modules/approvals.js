import Layout from '@/layout/index.vue'
export default {
  path: '/approvals',
  name: 'approvals',
  component: Layout,
  children: [{
    path: '',
    component: () => import('@/views/approvals'),
    meta: {
      title: '审批',
      icon: 'tree-table'
    }
  }]
}
