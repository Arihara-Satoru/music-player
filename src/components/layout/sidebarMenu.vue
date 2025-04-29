<script setup>
import { computed, inject } from 'vue'
import {
  HomeFilled,
  Search,
  List,
  Setting,
  ArrowLeftBold
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'


const userStore = useUserStore()
// 默认导航项
const navItems = ([
  { text: '首页', icon: HomeFilled, path: 'home' },
  { text: '搜索', icon: Search, path: 'search' },
  { text: '歌单', icon: List, path: 'playlist' },
  { text: '设置', icon: Setting, path: 'setting' }
])

const router = useRouter()

const userInfo = inject('res')

const navigateTo = (path) => {
  router.push({ name: path })
}

// Material You 动态配色
const primaryColor = inject('primaryColor')

const secondaryColor = computed(() => {
  return primaryColor.value.replace('60%)', '70%)')
})

const tertiaryColor = computed(() => {
  return primaryColor.value.replace('60%)', '50%)')
})

const textColor = computed(() => {
  return tertiaryColor.value
})

const logout = () => {
  // 使用 Element Plus 的 MessageBox 确认框

  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    userStore.removeUserId()
    userStore.removeToken()
    userStore.removeUserId()
    router.push('/login')
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<template>
  <aside class="sidebar"
    :style="{
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor,
      '--tertiary-color': tertiaryColor,
      '--text-color': textColor
    }">
    <div class="sidebar-header">
      <slot name="header">
        <div class="icon-button"
          @click="$router.back()">
          <el-icon>
            <ArrowLeftBold />
          </el-icon>
        </div>
        <h2 class="app-title">
          Music Player
        </h2>
      </slot>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <li v-for="(item, index) in navItems"
          :key="index"
          :class="{ 'active': $route.name === item.path }"
          @click="navigateTo(item.path)">
          <component :is="item.icon"
            class="nav-icon" />
          <span class="nav-text">{{ item.text }}</span>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <slot name="footer">
        <div class="user-profile"
          @contextmenu.prevent="logout">
          <div><img class="avatar"
              :src="userStore.userPicUrl || userInfo?.data?.pic"
              alt=""></div>
          <div class="user-info">
            <span class="username">{{ userInfo?.data?.nickname || 'Guest'
              }}</span>
            <span class="user-email"></span>
          </div>
        </div>
      </slot>
    </div>
  </aside>
</template>

<style scoped lang="scss">
/* 基础样式 */
.sidebar {
  --sidebar-width: 200px;
  --sidebar-padding: 1.5rem;
  --nav-item-padding: 0.75rem 1rem;
  --border-radius: 12px;

  width: var(--sidebar-width);
  height: 95vh;
  padding: var(--sidebar-padding);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;

  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  /* 动画效果 */
  transition: all 0.3s ease;
}

/* Material You 配色应用 */
.sidebar {
  color: var(--text-color);
}

.sidebar-nav li.active {
  background: var(--primary-color);
  color: white;
}

.sidebar-nav li:not(.active):hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 侧边栏头部 */
.sidebar-header {
  padding-bottom: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;

  .icon-button {
    width: 30px;
    height: 30px;
    display: flex;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.062);
    transition: all 0.2s ease;

    .el-icon {
      color: rgb(5, 3, 3);
      margin: auto;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  display: flex;
  align-items: center;
  padding: var(--nav-item-padding);
  margin-bottom: 0.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-icon {
  margin-right: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
}

.nav-text {
  font-size: 1.3rem;
  font-weight: 600;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding-top: 1.5rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  transition: 0.2s;
  border-radius: 20px;
}

.user-profile:hover {
  background-color: rgba(18, 15, 15, 0.145);
}

.avatar {
  margin-top: 5px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--tertiary-color);
  margin-right: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 0.95rem;
}

.user-email {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 80vw;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
