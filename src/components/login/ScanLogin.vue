<template>
  <div class="qr-login-container">
    <!-- 二维码显示区域 -->
    <div v-if="!loginSuccess" class="qr-code-box">
      <div v-if="qrCodeData" class="qr-code-wrapper">
        <img v-if="qrCodeData.qrimg" :src="qrCodeData.qrimg" alt="登录二维码" />
        <div v-else class="qr-code-placeholder">
          <!-- 这里可以使用第三方库渲染二维码 -->
          <img :src="qrCodeData.base64" alt="" />
        </div>
        <div class="status-info">
          <p :class="statusClass">{{ statusText }}</p>
          <p v-if="countdown > 0" class="countdown">二维码有效期: {{ countdown }}秒</p>
        </div>
      </div>
      <div v-else class="loading">
        <p>正在生成二维码...</p>
      </div>
    </div>

    <!-- 登录成功显示 -->
    <div v-else class="login-success">
      <p>登录成功！</p>
      <!-- <button @click="handleContinue">继续</button> -->
    </div>

    <!-- 刷新按钮 -->
    <button v-if="showRefresh" @click="initQRLogin" class="refresh-btn">刷新二维码</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { generateQRKey, generateQRCode, checkQRStatus } from '@/api/login'

// 二维码数据
const qrCodeData = ref(null)
// 登录状态
const loginSuccess = ref(false)
// 状态文本
const statusText = ref('正在生成二维码...')
// 状态样式
const statusClass = ref('status-waiting')
// 倒计时
const countdown = ref(0)
// 是否显示刷新按钮
const showRefresh = ref(false)
// 轮询定时器
let pollTimer = null
// 倒计时定时器
let countdownTimer = null
// 当前key
const currentKey = ref('')

// 初始化二维码登录
const initQRLogin = async () => {
  resetState()

  try {
    // 1. 获取key
    const keyRes = await generateQRKey()
    currentKey.value = keyRes.data.qrcode
    console.log('获取到的key:', keyRes.data)

    // 2. 生成二维码
    const qrRes = await generateQRCode(currentKey.value)
    qrCodeData.value = qrRes.data
    console.log('二维码数据:', qrRes.data.base64)

    // 开始倒计时(假设有效期120秒)
    startCountdown(120)

    // 3. 开始轮询检查状态
    startPolling()

    statusText.value = '请使用APP扫码登录'
    statusClass.value = 'status-waiting'
  } catch (error) {
    console.error('初始化二维码登录失败:', error)
    statusText.value = '生成二维码失败，请重试'
    statusClass.value = 'status-error'
    showRefresh.value = true
  }
}

// 开始轮询检查状态
const startPolling = () => {
  clearInterval(pollTimer)

  pollTimer = setInterval(async () => {
    if (!currentKey.value) return

    try {
      const res = await checkQRStatus(currentKey.value)
      console.log('轮询状态:', res.data)

      switch (res.data.status) {
        case 0:
          // 二维码过期
          statusText.value = '二维码已过期'
          statusClass.value = 'status-expired'
          clearInterval(pollTimer)
          clearInterval(countdownTimer)
          showRefresh.value = true
          break
        case 1:
          // 等待扫码
          statusText.value = '等待扫码...'
          statusClass.value = 'status-waiting'
          break
        case 2:
          // 待确认
          statusText.value = '已扫码，请在APP上确认登录'
          statusClass.value = 'status-confirming'
          break
        case 3:
          // 授权成功
          statusText.value = '登录成功!'
          statusClass.value = 'status-success'
          clearInterval(pollTimer)
          clearInterval(countdownTimer)
          break
        case 4:
          handleContinue(res)
          break
        default:
          statusText.value = '状态未知，请重试'
          statusClass.value = 'status-error'
      }
    } catch (error) {
      console.error('轮询检查状态失败:', error)
      // 失败后延迟3秒重试
      clearInterval(pollTimer)
      setTimeout(startPolling, 3000)
    }
  }, 3000) // 每2秒检查一次
}

// 开始倒计时
const startCountdown = (seconds) => {
  countdown.value = seconds
  clearInterval(countdownTimer)

  countdownTimer = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      statusText.value = '二维码已过期'
      statusClass.value = 'status-expired'
      showRefresh.value = true
    }
  }, 1000)
}

// 继续操作
const handleContinue = (res) => {
  loginSuccess.value = true
  console.log(res)
  emit('QRlogin-success', res)
}

// 重置状态
const resetState = () => {
  qrCodeData.value = null
  loginSuccess.value = false
  showRefresh.value = false
  statusText.value = '正在生成二维码...'
  statusClass.value = 'status-waiting'
  clearInterval(pollTimer)
  clearInterval(countdownTimer)
  currentKey.value = ''
}

// 组件挂载时清理定时器，但不自动初始化
onMounted(() => {
  // 确保在组件挂载时清理任何可能残留的定时器
  clearInterval(pollTimer)
  clearInterval(countdownTimer)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  clearInterval(pollTimer)
  clearInterval(countdownTimer)
})

// 定义事件
const emit = defineEmits(['QRlogin-success'])

// 暴露给父组件的方法
defineExpose({
  initQRLogin,
  resetState, // 也暴露resetState，方便父组件在需要时重置
})
</script>

<style scoped>
.qr-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code-box {
  margin: 20px 0;
  text-align: center;
}

.qr-code-wrapper img {
  width: 200px;
  height: 200px;
  border: 1px solid #eee;
}

.qr-code-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  margin: 0 auto;
}

.status-waiting {
  color: #1890ff;
}

.status-confirming {
  color: #faad14;
}

.status-success {
  color: #52c41a;
  font-weight: bold;
}

.status-error {
  color: #f5222d;
}

.status-expired {
  color: #f5222d;
}

.countdown {
  color: #666;
  font-size: 12px;
  margin-top: 5px;
}

.loading {
  padding: 50px;
  text-align: center;
}

.login-success {
  text-align: center;
}

.login-success p {
  color: #52c41a;
  font-size: 18px;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background-color: #40a9ff;
}
</style>
