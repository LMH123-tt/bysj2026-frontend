import { createWebHistory, createRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import NProgress from 'nprogress'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/login/register.vue'),
    hidden: true
  },
  {
    path: '/',
    component: () => import('@/views/home/index.vue'),
    name: 'Home',
    meta: { title: '首页' }
  },
  {
    path: '/category',
    component: () => import('@/views/content/category.vue'),
    name: 'Category',
    meta: { title: '分类', keepAlive: true }
  },
  {
    path: '/message',
    component: () => import('@/views/message/index.vue'),
    name: 'Message',
    meta: { title: '私信', requireAuth: true }
  },
  {
    path: '/content/:id',
    component: () => import('@/views/content/detail.vue'),
    name: 'ContentDetail',
    meta: { title: '内容详情' }
  },
  {
    path: '/search',
    component: () => import('@/views/content/search.vue'),
    name: 'Search',
    meta: { title: '搜索' }
  },
  {
    path: '/user',
    component: () => import('@/views/user/index.vue'),
    name: 'User',
    meta: { title: '我的', requireAuth: true }
  },
  {
    path: '/profile/:userId',
    component: () => import('@/views/user/profile.vue'),
    name: 'Profile',
    meta: { title: '用户主页' }
  },
  {
    path: '/my-content',
    component: () => import('@/views/user/mycontent.vue'),
    name: 'MyContent',
    meta: { title: '我的发布', requireAuth: true }
  },
  {
    path: '/publish',
    component: () => import('@/views/content/publish.vue'),
    name: 'Publish',
    meta: { title: '发布内容', requireAuth: true }
  },
  {
    path: '/favorites',
    component: () => import('@/views/user/favorites.vue'),
    name: 'Favorites',
    meta: { title: '我的收藏', requireAuth: true }
  },
  {
    path: '/history',
    component: () => import('@/views/user/history.vue'),
    name: 'History',
    meta: { title: '浏览历史', requireAuth: true }
  },
  {
    path: '/ranking',
    component: () => import('@/views/ranking/index.vue'),
    name: 'Ranking',
    meta: { title: '排行榜' }
  },
  {
    path: '/friends',
    component: () => import('@/views/user/friends.vue'),
    name: 'Friends',
    meta: { title: '好友列表', requireAuth: true }
  },
  {
    path: '/chat/:friendId',
    component: () => import('@/views/user/chat.vue'),
    name: 'Chat',
    meta: { title: '私信', requireAuth: true }
  },
  {
    path: '/notice',
    component: () => import('@/views/user/notice.vue'),
    name: 'Notice',
    meta: { title: '公告', keepAlive: true }
  },
  {
    path: '/notification',
    component: () => import('@/views/user/notification.vue'),
    name: 'Notification',
    meta: { title: '消息通知', requireAuth: true }
  },
  {
    path: '/notice/:id',
    component: () => import('@/views/user/noticeDetail.vue'),
    name: 'NoticeDetail',
    meta: { title: '公告详情' }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const token = userStore.token
  
  if (token && !userStore.nickName) {
    userStore.restoreUser()
  }

  if (to.meta.requireAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
