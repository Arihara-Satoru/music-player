<script setup>
import sidebarMenu from '@/components/layout/sidebarMenu.vue';
import HeaderIndex from '@/components/layout/HeaderIndex.vue';
import { provide, computed, onMounted } from 'vue'
import { userInfo, getVipStatus, getVip } from '@/api/user';
import { ref } from 'vue'

const userInfoData = ref(null)
// Material You 动态配色
const primaryColor = computed(() => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 75%, 60%)`
})

const primaryColorRGBA = computed(() => {
  const hsl = primaryColor.value.match(/(\d+)/g).map(Number)
  const h = hsl[0]
  const s = hsl[1]
  const l = hsl[2]
  const a = 0.1 // 透明度调整
  return `hsla(${h}, ${s}%, ${l}%, ${a})`
})

provide('primaryColor', primaryColor)

provide('res', userInfoData)

const getUserInfo = async () => {
  const res = await userInfo()
  userInfoData.value = res
  console.log(res)
}

const VipStatus = async () => {
  const res = await getVipStatus();
  const endTimeStr = res.data.busi_vip[0].vip_end_time; // "2025-04-20 18:33:51"

  // 获取VIP结束日期和当前日期的日期部分（去掉时间）
  const endDate = new Date(endTimeStr.split(' ')[0]); // 只取日期部分
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 清零时间部分

  // 比较日期（毫秒数）
  if (endDate.getTime() <= today.getTime()) {
    getDayVip(); // 如果需要获取每日VIP
    ElMessage.success(`VIP 结束时间：${endTimeStr}`);
  } else {
    ElMessage.success('VIP有效');
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
    <el-container>
      <el-aside width="250px">
        <sidebarMenu></sidebarMenu>
      </el-aside>
      <el-container class="main-container">
        <el-header>
          <HeaderIndex></HeaderIndex>
        </el-header>
        <el-main><router-view v-slot="{ Component }">
            <transition name="fade"
              mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
          <miniplayer class="miniplayer"></miniplayer>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  display: flex;
  // flex-direction: column;
  height: 97vh;
  overflow: hidden; // 禁用容器自身滚动

  .el-header {
    height: 35px;
    background-color: v-bind(primaryColor);
    border-radius: 50px;
    margin-top: 5px;
    opacity: 0.5;
  }

  .el-main {
    flex: 1; // 自动填充剩余空间
    overflow: auto; // 仅内容区可滚动
    bottom: 0;
    margin-top: 10px;
    border-radius: 10px;
    background-color: v-bind(primaryColorRGBA);
    display: flex;
    justify-content: center;

    .miniplayer {
      width: 600px;
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
