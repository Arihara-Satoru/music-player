<script setup>
import sidebarMenu from '@/components/layout/sidebarMenu.vue'
import HeaderIndex from '@/components/layout/HeaderIndex.vue'
import { provide, onMounted } from 'vue' // 移除 computed
import { userInfo, getVipStatus, getVip } from '@/api/user'
import { ref } from 'vue' // 移除 useThemeStore 引入

const userInfoData = ref(null)

provide('res', userInfoData)

const getUserInfo = async () => {
  const res = await userInfo()
  userInfoData.value = res
  console.log(res)
}

const VipStatus = async () => {
  try {
    const res = await getVipStatus()
    const vipInfo = res?.data?.busi_vip?.[0]
    if (!vipInfo) {
      ElMessage.error('未获取到VIP信息')
      return
    }

    const endTimeStr = vipInfo.vip_end_time // "2025-04-20 18:33:51"

    // 只取日期部分，标准化
    const endDateParts = endTimeStr.split(' ')[0].split('-').map(Number) // [2025, 04, 20]
    const endDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2]) // 月份要减一
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 只保留日期

    if (today.getTime() >= endDate.getTime()) {
      await getDayVip() // 在VIP结束当天或之后，可以领取
      ElMessage.success(`已领取vip。结束时间：${endTimeStr}`)
    } else {
      ElMessage.success('VIP仍在有效期内')
    }
  } catch (error) {
    console.error('获取VIP状态失败:', error)
    ElMessage.error('获取VIP状态失败')
  }
}

const getDayVip = async () => {
  await getVip()
}

onMounted(() => {
  getUserInfo()
  VipStatus()
})
</script>

<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside width="250px" class="layout-aside">
        <sidebarMenu></sidebarMenu>
      </el-aside>
      <el-container class="main-container">
        <el-header class="layout-header">
          <HeaderIndex></HeaderIndex>
        </el-header>
        <el-main class="layout-main"
          ><router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
          <mini-player class="miniplayer"></mini-player>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.common-layout {
  height: 100vh;
  width: 100vw;
  background-color: var(--md-sys-color-background) !important; /* 强制使用 Material You 背景色 */
  color: var(--md-sys-color-on-background) !important; /* 强制使用 Material You 字体颜色 */
}

.layout-container {
  height: 100%;
  background-color: var(--md-sys-color-background) !important; /* 强制使用 Material You 背景色 */
}

.layout-aside {
  background-color: var(
    --md-sys-color-surface-variant
  ) !important; /* 强制使用 Material You 表面变体色 */
  color: var(--md-sys-color-on-surface-variant) !important;
}

.main-container {
  display: flex;
  margin-left: 10px;
  flex-direction: column; /* 垂直布局 */
  height: 100%; /* 占据父容器的全部高度 */
  overflow: hidden; /* 禁用容器自身滚动 */
  background-color: var(--md-sys-color-background) !important; /* 强制使用 Material You 背景色 */

  .layout-header {
    height: 35px;
    background-color: var(
      --md-sys-color-primary-container
    ) !important; /* 强制使用 Material You 容器色 */
    border-radius: 50px;
    margin-top: 5px;
    opacity: 0.9; /* 调整透明度 */
    color: var(--md-sys-color-on-primary-container) !important; /* 确保文字颜色可见 */
    display: flex; /* 使 HeaderIndex 内容居中 */
    align-items: center;
    justify-content: center;
  }

  .layout-main {
    flex: 1; /* 自动填充剩余空间 */
    overflow: auto; /* 仅内容区可滚动 */
    margin-top: 10px;
    border-radius: 10px;
    /* 使用 Material You 的 primary-container 颜色，并调整透明度使其更淡 */
    background-color: rgba(
      var(--color-primary-rgb),
      0.05
    ) !important; /* 强制使用 Material You 主色调的淡化版本 */
    display: flex;
    justify-content: center;
    align-items: flex-start; /* 顶部对齐内容 */
    padding: 20px; /* 添加内边距 */
    box-sizing: border-box; /* 包含内边距在宽度内 */

    .miniplayer {
      width: 800px;
      position: absolute;
      bottom: 50px;
    }
  }
}

/* 必加的4个CSS类 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-aside {
    transform: translateX(-100%);
    width: 0vw;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
