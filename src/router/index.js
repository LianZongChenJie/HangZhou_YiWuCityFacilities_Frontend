import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { HOME_PATH } from '@/utils/constants'

const Layout = () => import('@/layout/index.vue')

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { title: '登录' } },
  {
    path: '/',
    component: Layout,
    redirect: '/workbench',
    children: [
      {
        path: 'workbench',
        name: 'Workbench',
        component: () => import('@/views/workbench/index.vue'),
        meta: { title: '工作台', affix: true }
      },
      {
        path: 'case/create',
        name: 'CaseCreate',
        component: () => import('@/views/case/create.vue'),
        meta: { title: '新建办件', roles: ['accept'] }
      },
      {
        path: 'case/pending',
        name: 'CasePending',
        component: () => import('@/views/case/pending.vue'),
        meta: { title: '待处理', roles: ['accept', 'review', 'issue', 'close'] }
      },
      {
        path: 'case/query',
        name: 'CaseQuery',
        component: () => import('@/views/case/query.vue'),
        meta: { title: '办件查询' }
      },
      {
        path: 'case/detail/:id',
        name: 'CaseDetail',
        component: () => import('@/views/case/detail.vue'),
        meta: { title: '办件详情' }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('@/views/stats/index.vue'),
        meta: { title: '统计报表', roles: ['admin', 'review', 'issue'] }
      },
      {
        path: 'system/user',
        name: 'SysUser',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'system/role',
        name: 'SysRole',
        component: () => import('@/views/system/role.vue'),
        meta: { title: '角色管理', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/print/:id',
    name: 'PrintReceipt',
    component: () => import('@/views/print/receipt.vue'),
    meta: { title: '办结回执' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const user = useUserStore()
  user.restore()
  if (to.path === '/login') return true
  if (!user.token) return '/login'
  const roles = to.meta.roles
  if (roles && !roles.includes(user.role)) return HOME_PATH[user.role] || '/workbench'
  return true
})

export default router
