<script setup>
import { computed } from 'vue'
import { HomeFilled, Search, List, Setting, ArrowLeftBold } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/ThemeStore' // 引入 ThemeStore

const userStore = useUserStore()
const themeStore = useThemeStore() // 获取 ThemeStore 实例

// 默认导航项配置
const navItems = [
  { text: '首页', icon: HomeFilled, path: 'home' },
  { text: '搜索', icon: Search, path: 'search' },
  { text: '歌单', icon: List, path: 'playlist' },
  { text: '设置', icon: Setting, path: 'setting' },
]

const router = useRouter()

// Material You 动态配色或歌曲封面取色
// 根据 themeStore 中的 themeMode 决定使用哪种颜色作为基础色
const baseColor = computed(() => {
  if (themeStore.themeMode === 'album_cover') {
    // 如果是歌曲封面取色模式，使用 albumCoverColor
    const [r, g, b] = themeStore.albumCoverColor
    return `rgb(${r}, ${g}, ${b})`
  } else {
    // 默认使用 Material You 颜色
    const [r, g, b] = themeStore.materialYouColor
    return `rgb(${r}, ${g}, ${b})`
  }
})

// 计算主色调
const primaryColor = computed(() => {
  // 为了简化，直接使用 baseColor 作为 primaryColor
  // 实际 Material You 可能需要更复杂的颜色派生逻辑
  return baseColor.value
})

// 计算次色调
const secondaryColor = computed(() => {
  // 暂时直接使用 baseColor，如果需要更复杂的 Material You 效果，
  // 可以引入颜色处理库进行亮度、饱和度等调整
  return baseColor.value
})

// 计算三级色调
const tertiaryColor = computed(() => {
  // 暂时直接使用 baseColor
  return baseColor.value
})

// 计算文本颜色
const textColor = computed(() => {
  // 根据背景色亮度选择文本颜色，这里简化为固定深色文本
  return '#333'
})

/**
 * @function navigateTo
 * @param {string} path - 路由路径名称。
 * @description 导航到指定的路由。
 */
const navigateTo = (path) => {
  router.push({ name: path })
}

/**
 * @function logout
 * @description 退出登录功能。
 * 弹出确认框，用户确认后清除用户相关信息并跳转到登录页。
 */
const logout = () => {
  // 使用 Element Plus 的 MessageBox 确认框
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 清除用户相关存储信息
      userStore.removeUserId()
      userStore.removeToken()
      userStore.removeUserName() // 确保清除用户名
      router.push('/login') // 跳转到登录页面
    })
    .catch(() => {
      // 用户取消操作，不执行任何动作
    })
}
</script>

<template>
  <!-- 侧边栏容器，通过 CSS 变量动态应用颜色 -->
  <aside
    class="sidebar"
    :style="{
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor,
      '--tertiary-color': tertiaryColor,
      '--text-color': textColor,
    }"
  >
    <!-- 侧边栏头部插槽，可自定义内容 -->
    <div class="sidebar-header">
      <slot name="header">
        <!-- 返回按钮 -->
        <div class="icon-button" @click="$router.back()">
          <el-icon>
            <ArrowLeftBold />
          </el-icon>
        </div>
        <!-- 应用标题，使用渐变色 -->
        <h2 class="app-title">Music Player</h2>
      </slot>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <!-- 遍历导航项，动态生成菜单列表 -->
        <li
          v-for="(item, index) in navItems"
          :key="index"
          :class="{ active: $route.name === item.path }"
          @click="navigateTo(item.path)"
        >
          <!-- 导航图标 -->
          <component :is="item.icon" class="nav-icon" />
          <!-- 导航文本 -->
          <span class="nav-text">{{ item.text }}</span>
        </li>
      </ul>
    </nav>

    <!-- 侧边栏底部插槽，可自定义内容 -->
    <div class="sidebar-footer">
      <slot name="footer">
        <!-- 用户资料区域，右键点击可退出登录 -->
        <div class="user-profile" @contextmenu.prevent="logout">
          <div>
            <!-- 用户头像，优先使用 userStore 中的 URL，否则使用 userInfo 中的 pic -->
            <img class="avatar" :src="userStore.userPicUrl || userInfo?.data?.pic" alt="用户头像" />
          </div>
          <!-- 用户信息（用户名和邮箱） -->
          <div class="user-info">
            <span class="username">{{ userStore.userName || 'Guest' }}</span>
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
