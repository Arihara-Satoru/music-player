import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: () => import('@/views/HelloWorld.vue'),
      redirect: '/layout'
    },
    {
      path:'/login',
      name:'login',
      component: () => import('@/views/login/LoginIndex.vue'),
    },
    {
      path:'/layout',
      name:'layout',
      component: () => import('@/views/layout/LayoutIndex.vue'),
      children:[
        {path:'home',name:'home',component: () => import('@/views/home/HomeIndex.vue')},
        {path:'search',name:'search',component: () => import('@/views/search/SearchIndex.vue')},
        {path:'playlist',name:'playlist',component: () => import('@/views/playlist/PlayList.vue')},
        {path:'setting',name:'setting',component: () => import('@/views/setting/SettingIndex.vue')},
      ]
    }
  ],
})
// 全局前置守卫
// 1. 导入 Pinia 中的 userStore
// 2. 获取 token
// 3. 判断 token 是否存在
// 4. 如果不存在且目标路由不是登录页 → 跳转到登录页
// 5. 如果存在且目标路由是登录页 → 跳转到首页
// 6. 其他情况放行
// 7. 导出 router
router.beforeEach((to) => {
  const userStore = useUserStore()
  const token = userStore.token

  // 1. 未登录且目标不是登录页 → 跳转到登录
  if (!token && to.name !== 'login') {
    return { name: 'login' }
  }
  // 2. 已登录却访问登录页 → 跳转到首页
  else if (token && to.name === 'login') {
    return { name: 'layout' }
  }
  // 3. 其他情况放行
  return true
})

export default router
