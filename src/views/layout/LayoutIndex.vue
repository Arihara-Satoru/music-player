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
  const res = await getVipStatus()
  // const endTimeStr = res.data.busi_vip[0].vip_end_time; // "2025-04-20 18:33:51"
  // const endTime = new Date(endTimeStr); // 转为 Date 对象
  // const currentTime = new Date();       // 当前时间
  // // 获取时间戳（毫秒数）
  // const endTimestamp = endTime.getTime();
  // const currentTimestamp = currentTime.getTime();
  // // console.log('vip', res.data.busi_vip[0].vip_end_time)
  // // 判断是否过期
  // if (currentTimestamp > endTimestamp) {
  //   console.log("VIP 已过期");
  //   return false;
  // } else {
  //   ElMessage.success('VIP 有效')
  //   console.log("VIP 有效");
  //   return true;
  // }
  // 获取VIP结束时间
  const vipEndTimeStr = res.data.busi_vip[0].vip_begin_time; // "2025-04-20 18:33:51"
  const isSameDay = new Date(vipEndTimeStr).toDateString() === new Date().toDateString();
  // console.log('isSameDay', isSameDay)
  return isSameDay
}

const getDayVip = async () => {
  if (VipStatus()) {
    ElMessage.success('VIP 有效')
    return
  }
  const res = await getVip()
  console.log('getvip', res)
  ElMessage.success('领取一天vip成功')
}

onMounted(() => {
  getUserInfo()
  getDayVip()
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
        <el-main><router-view></router-view></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
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
    justify-content: center; // 水平居中
    align-items: center; // 垂直居中

    router-view {}
  }
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
