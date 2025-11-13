import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../pages/home/index.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/topic',
    name: 'Topic',
    component: () => import('../pages/topic/index.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/topic/:id',
    name: 'TopicDetail',
    component: () => import('../pages/topic/detail.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('../pages/publish/index.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('../pages/message/index.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/message/:id',
    name: 'MessageDetail',
    component: () => import('../pages/message/detail.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile/index.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/profile/info',
    name: 'ProfileInfo',
    component: () => import('../pages/profile/info.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/avatar',
    name: 'ProfileAvatar',
    component: () => import('../pages/profile/avatar.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/home/:id?',
    name: 'ProfileHome',
    component: () => import('../pages/profile/home.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/favorites',
    name: 'Favorites',
    component: () => import('../pages/profile/favorites.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/mentions',
    name: 'Mentions',
    component: () => import('../pages/profile/mentions.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/points',
    name: 'Points',
    component: () => import('../pages/profile/points.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/points/rules',
    name: 'PointsRules',
    component: () => import('../pages/profile/points-rules.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/answers',
    name: 'MyAnswers',
    component: () => import('../pages/profile/answers.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/profile/questions',
    name: 'MyQuestions',
    component: () => import('../pages/profile/questions.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('../pages/profile/user.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/post',
    name: 'PostList',
    component: () => import('../pages/post/index.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('../pages/post/detail.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/post/create',
    name: 'PostCreate',
    component: () => import('../pages/post/create.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../pages/search/index.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/search/topic',
    name: 'SearchTopic',
    component: () => import('../pages/search/topic.vue'),
    meta: { showTabBar: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

