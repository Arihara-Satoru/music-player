<script setup>
import { ref } from 'vue'
import { getPhoneCode, login, loginPwd, loginWx } from '@/api/login'
import { useUserStore } from '@/stores/user'
import WxloginComponent from '@/components/login/WxloginComponent.vue'
import ScanLogin from '@/components/login/ScanLogin.vue'
import { useRouter } from 'vue-router'
import { computed, nextTick } from 'vue' // 移除 watch，因为它未被使用
const router = useRouter()

const activeName = ref('first')

const formRefPhone = ref()
const formRefAccount = ref()
const scanLoginRef = ref(null) // 引用 ScanLogin 组件
const wxLoginRef = ref(null) // 引用 WxloginComponent 组件

let isCodeSent = ref(false) // 添加一个标志位，表示验证码是否已发送
let countdown = ref(60) // 倒计时秒数
const userStore = useUserStore()

// 计算属性，判断用户是否已登录
const isLoggedIn = computed(() => {
  return !!userStore.token // 如果token有值，则认为已登录
})

const numberValidateForm = ref({
  account: '',
  password: '',
  phone: '',
  code: '',
})

const rules = {
  account: [{ required: true, message: '此为必填项目' }],
  password: [{ required: true, message: '此为必填项目' }],
  phone: [
    { required: true, message: '此为必填项目' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  code: [
    { required: true, message: '此为必填项目' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码' },
  ],
}

const sendCode = async () => {
  if (isCodeSent.value) {
    ElMessage.warning('验证码已发送，请勿重复发送')
    return
  }
  if (await formRefPhone.value.validateField('phone')) {
    await getPhoneCode(numberValidateForm.value.phone)
    ElMessage.success('验证码发送成功')
    isCodeSent.value = true // 设置标志位为已发送
    // 设置一个定时器，1分钟后重置标志位
    let timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        isCodeSent.value = false
        countdown.value = 60
      }
    }, 1000)
  }
}

const setUserInfo = (res) => {
  userStore.setToken(res.data.token)
  userStore.setUserId(res.data.userid)
  userStore.setUserPicUrl(res.data.pic)
  userStore.setUserName(res.data.nickname)
  ElMessage.success('正在跳转中...')
  setTimeout(() => {
    router.push('/')
  }, 1000)
}

/**
 * 处理登录逻辑的函数
 *
 * 该函数首先会通过表单引用formRefPhone来验证登录表单的数据是否有效
 * 如果验证通过，则会调用login函数发起登录请求
 * 登录成功后，会显示成功消息，并将token和用户信息存储到localStorage中
 */
const handleCodeLogin = async () => {
  try {
    // await formRefAccount.value.validateField('phone');
    // await formRefAccount.value.validateField('code');
    console.log('正在验证')
    const res = await login({
      mobile: numberValidateForm.value.phone,
      code: numberValidateForm.value.code,
    })
    console.log('正在登录')
    if (res.status === 1) {
      // 显示成功消息
      ElMessage.success('登录成功')
      setUserInfo(res)
    }
  } catch (error) {
    // 统一错误处理，显示更友好的错误信息
    const errorMessage = error.response?.data?.data || '网络异常，请检查连接或稍后再试。'
    ElMessage.error(`登录失败: ${errorMessage}`)
  }
}

const handleLogin = async () => {
  try {
    // ✅ 分别验证 account 和 password
    await formRefAccount.value.validateField('account')
    await formRefAccount.value.validateField('password')
    const res = await loginPwd({
      username: numberValidateForm.value.account,
      password: numberValidateForm.value.password,
    })
    if (res.status === 1) {
      // 显示成功消息
      ElMessage.success('登录成功')
      setUserInfo(res)
    } else {
      // 如果后端返回的status不是1，也认为是登录失败
      const errorMessage = res.data?.data || '登录失败，请检查账号或密码。'
      ElMessage.error(`登录失败: ${errorMessage}`)
    }
  } catch (error) {
    // 统一错误处理，显示更友好的错误信息
    const errorMessage = error.response?.data?.data || '网络异常，请检查连接或稍后再试。'
    ElMessage.error(`登录失败: ${errorMessage}`)
  }
}

const handleWxLoginSuccess = async (wxCode) => {
  // console.log('微信登录成功，code:', wxCode)
  // 这里可以处理登录成功后的逻辑
  // 例如调用你的开放平台登录接口
  // loginWithWxCode(wxCode).then(() => {
  //   // 跳转到首页或其他页面
  // })
  const res = await loginWx(wxCode)
  ElMessage.success('登录成功')
  setUserInfo(res)
  // console.log(res)
}

const handleLoginSuccess = (res) => {
  // console.log('登录成功，token:', token)
  setUserInfo(res)
  // 这里可以处理登录成功后的逻辑
  // 例如存储token，跳转页面等
  // localStorage.setItem('auth_token', token)
}

// 处理 Tab 切换
const handleTabChange = async (name) => {
  // 在切换Tab时，如果从扫码/微信Tab切换走，则重置其状态
  if (name !== 'third' && scanLoginRef.value) {
    scanLoginRef.value.resetState()
  }
  if (name !== 'fourth' && wxLoginRef.value) {
    wxLoginRef.value.resetState()
  }

  // 在切换到扫码/微信Tab时，如果用户未登录，则初始化二维码
  await nextTick() // 确保组件已渲染
  if (!isLoggedIn.value) {
    if (name === 'third' && scanLoginRef.value) {
      scanLoginRef.value.initQRLogin()
    } else if (name === 'fourth' && wxLoginRef.value) {
      wxLoginRef.value.generateQRCode() // 调用微信登录组件的生成二维码方法
    }
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">欢迎登录</h1>
        <p class="login-subtitle">享受您的音乐之旅</p>
      </div>

      <el-tabs v-model="activeName" class="login-tabs" @tab-change="handleTabChange">
        <!-- 验证码登录 -->
        <el-tab-pane label="验证码登录" name="first">
          <el-form
            ref="formRefPhone"
            v-if="activeName === 'first'"
            :model="numberValidateForm"
            :rules="rules"
            label-position="top"
            class="login-form"
          >
            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="numberValidateForm.phone"
                @keydown.enter="sendCode"
                placeholder="请输入手机号"
                :prefix-icon="'Phone'"
              />
            </el-form-item>
            <el-form-item label="验证码" prop="code">
              <el-input
                @keydown.enter="handleCodeLogin"
                v-model="numberValidateForm.code"
                placeholder="请输入验证码"
                :prefix-icon="'Message'"
              >
                <template #append>
                  <el-button type="primary" @click="sendCode" :disabled="isCodeSent">
                    {{ isCodeSent ? `${countdown}秒后重新发送` : '获取验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-button class="login-button" @click="handleCodeLogin" type="primary">
              立即登录
            </el-button>
          </el-form>
        </el-tab-pane>

        <!-- 账号登录 -->
        <el-tab-pane label="账号登录" name="second">
          <el-form
            ref="formRefAccount"
            v-if="activeName === 'second'"
            :model="numberValidateForm"
            :rules="rules"
            label-position="top"
            class="login-form"
          >
            <el-form-item label="账号" prop="account">
              <el-input
                placeholder="请输入账号"
                v-model="numberValidateForm.account"
                type="text"
                autocomplete="off"
                :prefix-icon="'User'"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="numberValidateForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                :prefix-icon="'Lock'"
              />
            </el-form-item>
            <el-button class="login-button" @click="handleLogin" type="primary">
              立即登录
            </el-button>
          </el-form>
        </el-tab-pane>

        <!-- 扫码登录 -->
        <el-tab-pane label="扫码登录" name="third" v-if="!isLoggedIn">
          <div class="scan-login-section" v-if="activeName === 'third'">
            <h3 class="section-sub-title">请使用您的手机APP扫码登录</h3>
            <ScanLogin ref="scanLoginRef" @QRlogin-success="handleLoginSuccess" />
          </div>
        </el-tab-pane>

        <!-- 微信登录 -->
        <el-tab-pane label="微信登录" name="fourth" v-if="!isLoggedIn">
          <div class="wx-login-section" v-if="activeName === 'fourth'">
            <h3 class="section-sub-title">请使用微信扫码登录</h3>
            <WxloginComponent ref="wxLoginRef" @login-success="handleWxLoginSuccess" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6dd5ed, #2193b0); /* 渐变背景 */
  padding: 20px;
  box-sizing: border-box;
}

.login-container {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 450px; /* 限制登录框最大宽度 */
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  margin-bottom: 30px;
}

.login-title {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.login-subtitle {
  font-size: 1.1em;
  color: #777;
}

.login-tabs {
  margin-bottom: 20px;
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
    .el-tabs__nav {
      width: 100%;
      display: flex;
      justify-content: space-around;
      border: none;
      .el-tabs__item {
        flex: 1;
        text-align: center;
        font-size: 1.1em;
        font-weight: bold;
        color: #555;
        border: none;
        background-color: transparent;
        &.is-active {
          color: #42b983;
          border-bottom: 3px solid #42b983;
          background-color: #f0f9eb; /* 选中标签背景色 */
        }
        &:hover {
          color: #42b983;
        }
      }
    }
  }
  :deep(.el-tabs__content) {
    padding: 20px 0;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 25px;
    :deep(.el-form-item__label) {
      font-size: 1em;
      color: #555;
      margin-bottom: 8px;
    }
  }
  .el-input {
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      padding: 10px 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) inset;
    }
    :deep(.el-input__inner) {
      font-size: 1em;
    }
    .el-button {
      border-radius: 0 8px 8px 0;
      background-color: #42b983;
      color: #fff;
      &:hover {
        background-color: #36a073;
      }
    }
  }
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 1.2em;
  border-radius: 8px;
  background-color: #42b983;
  color: #fff;
  border: none;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  &:hover {
    background-color: #36a073;
    transform: translateY(-2px);
  }
}

.scan-login-section,
.wx-login-section {
  padding: 20px;
}

.section-sub-title {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 20px;
}

.login-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.footer-link {
  color: #42b983;
  text-decoration: none;
  font-size: 0.95em;
  transition: color 0.2s ease;
  &:hover {
    text-decoration: underline;
    color: #36a073;
  }
}

/* 响应式调整 */
@media (max-width: 600px) {
  .login-container {
    padding: 30px 20px;
    margin: 0 10px;
  }

  .login-title {
    font-size: 2em;
  }

  .login-subtitle {
    font-size: 1em;
  }

  .login-tabs {
    :deep(.el-tabs__item) {
      font-size: 1em;
    }
  }

  .login-form {
    .el-input {
      :deep(.el-input__wrapper) {
        padding: 8px 12px;
      }
    }
  }

  .login-button {
    font-size: 1.1em;
    padding: 10px 0;
  }
}
</style>
