import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { getGwSession } from '@/utils/request'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: '/content',
        name: 'Content',
        component: () => import('@/views/Content.vue'),
        meta: { title: '内容管理' }
      },
      {
        path: '/topics',
        name: 'Topics',
        component: () => import('@/views/Topics.vue'),
        meta: { title: '话题管理' }
      },
      {
        path: '/topics/:id/content',
        name: 'TopicContent',
        component: () => import('@/views/TopicContent.vue'),
        meta: { title: '管理内容' }
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: '/points',
        name: 'Points',
        component: () => import('@/views/Points.vue'),
        meta: { title: '积分规则' }
      },
      {
        path: '/logs-test',
        name: 'LogsTest',
        component: () => import('@/views/LogsTest.vue'),
        meta: { title: 'API 测试' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const hasSession = !!getGwSession()
  if (!to.meta.public && !hasSession) {
    next({ path: '/login' })
    return
  }
  if (to.path === '/login' && hasSession) {
    next({ path: '/dashboard' })
    return
  }
  next()
})

export default router