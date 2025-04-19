<template>
  <div class="wx-login-container">
    <!-- 二维码显示区域 -->
    <div v-if="!loginSuccess"
      class="qr-code-container">
      <div v-if="qrCodeData"
        class="qr-code-wrapper">
        <img :src="qrCodeData.qrCodeBase64"
          alt="微信登录二维码">
        <p class="tips">请使用微信扫描二维码登录</p>
        <p class="status">{{ statusText }}</p>
      </div>
      <div v-else
        class="loading">
        <span>正在生成二维码...</span>
      </div>
    </div>

    <!-- 登录成功显示 -->
    <div v-else
      class="login-success">
      <p>登录成功！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { createWxLoginQR, checkWxLoginStatus } from '@/api/login'

// 二维码数据
const qrCodeData = ref(null)
// 登录状态
const loginSuccess = ref(false)
// 状态文本
const statusText = ref('等待扫描')
// 轮询定时器
let pollTimer = null

// 生成二维码
const generateQRCode = async () => {
  try {
    const res = await createWxLoginQR()
    console.log('完整响应:', res) // 调试用

    // 根据实际响应结构调整
    if (!res || res.errcode !== 0) {
      throw new Error(res?.errmsg || '微信接口返回错误')
    }

    // 确保必要字段存在
    if (!res.uuid || !res.qrcode?.qrcodebase64) {
      throw new Error('响应缺少必要字段')
    }

    // 构造组件需要的数据结构
    qrCodeData.value = {
      uuid: res.uuid,
      qrCodeBase64: `data:image/png;base64,${res.qrcode.qrcodebase64}`
    }

    startPolling(res.uuid)

  } catch (error) {
    console.error('生成二维码失败:', error)
    statusText.value = `生成二维码失败: ${error.message}`
    // 5秒后重试
    setTimeout(generateQRCode, 5000)
  }
}

// 开始轮询检查登录状态
const startPolling = (uuid) => {
  clearInterval(pollTimer)

  pollTimer = setInterval(async () => {
    try {
      const res = await checkWxLoginStatus(uuid)
      console.log('状态检查响应:', res)

      // 根据实际响应结构调整
      if (!res) {
        throw new Error('无效的API响应')
      }

      // 使用实际返回的字段名 wx_errcode
      const status = res.wx_errcode
      const wxCode = res.wx_code

      if (status === undefined) {
        throw new Error('响应缺少状态字段(wx_errcode)')
      }

      // 将状态码转换为字符串比较更安全
      switch (status.toString()) {
        case '408':
          statusText.value = '等待扫描...'
          break
        case '404':
          statusText.value = '已扫描，请在微信中确认登录'
          break
        case '403':
          statusText.value = '已拒绝登录'
          clearInterval(pollTimer)
          setTimeout(generateQRCode, 2000)
          break
        case '405':
          statusText.value = '登录成功'
          loginSuccess.value = true
          clearInterval(pollTimer)
          handleLoginSuccess(wxCode)
          break
        case '402':
          statusText.value = '二维码已过期'
          clearInterval(pollTimer)
          setTimeout(generateQRCode, 2000)
          break
        case '485':  // 添加你遇到的新状态码处理
          statusText.value = '等待授权...'
          break
        default:
          statusText.value = `未知状态: ${status}`
          console.warn('未知状态码:', status)
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      statusText.value = '状态检查失败，尝试重新连接...'

      // 备用方案：直接请求微信接口
      // if (uuid) {
      //   window.open(`https://long.open.weixin.qq.com/connect/l/qrconnect?f=json&uuid=${uuid}`, '_blank')
      // }

      // 3秒后重试
      setTimeout(() => startPolling(uuid), 3000)
    }
  }, 2000)
}

// 处理登录成功
const handleLoginSuccess = async (wxCode) => {
  console.log('获取到的wx_code:', wxCode)
  // 这里可以调用你的登录接口，传递wx_code
  // 例如: loginWithWxCode(wxCode)
  // 成功后可以触发父组件的事件或跳转页面
  emit('login-success', wxCode)
}

// 组件挂载时生成二维码
onMounted(() => {
  generateQRCode()
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  clearInterval(pollTimer)
})

// 定义事件
const emit = defineEmits(['login-success'])
</script>

<style scoped>
.wx-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.qr-code-wrapper {
  text-align: center;
}

.qr-code-wrapper img {
  width: 200px;
  height: 200px;
  border: 1px solid #eee;
}

.tips {
  margin-top: 10px;
  color: #666;
}

.status {
  margin-top: 5px;
  color: #1890ff;
  font-weight: bold;
}

.loading {
  padding: 50px;
  text-align: center;
}

.login-success {
  padding: 50px;
  text-align: center;
  color: #52c41a;
  font-size: 18px;
}
</style>
