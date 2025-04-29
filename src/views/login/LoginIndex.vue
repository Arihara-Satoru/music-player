<script setup>
import { ref } from 'vue'
import { getPhoneCode, login, loginPwd, loginWx } from '@/api/login'
import { useUserStore } from '@/stores/user'
import WxloginComponent from '@/components/login/WxloginComponent.vue'
import ScanLogin from '@/components/login/ScanLogin.vue'
import router from '@/router'

const activeName = ref('first')

const formRefPhone = ref()
const formRefAccount = ref()
let isCodeSent = ref(false) // 添加一个标志位，表示验证码是否已发送
let countdown = ref(60) // 倒计时秒数
const userStore = useUserStore()

const numberValidateForm = ref({
  account: '',
  password: '',
  phone: '',
  code: '',
})

const rules = {
  account: [
    { required: true, message: '此为必填项目' },
  ],
  password: [
    { required: true, message: '此为必填项目' },
  ],
  phone: [
    { required: true, message: '此为必填项目' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '此为必填项目' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码' }
  ]
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

/**
 * 处理登录逻辑的函数
 *
 * 该函数首先会通过表单引用formRefPhone来验证登录表单的数据是否有效
 * 如果验证通过，则会调用login函数发起登录请求
 * 登录成功后，会显示成功消息，并将token和用户信息存储到localStorage中
 */
const handleCodeLogin = async () => {
  try {
    await formRefAccount.value.validateField('phone');
    await formRefAccount.value.validateField('code');
    const res = await login({ mobile: numberValidateForm.value.phone, code: numberValidateForm.value.code })
    console.log('正在登录')
    if (res.code === 200) {
      // 显示成功消息
      ElMessage.success('登录成功')
      userStore.setToken(res.data.token)
    }
  } catch (error) {
    ElMessage.error('登录失败', error.response.data.data)
  }
}

const handleLogin = async () => {
  try {
    // ✅ 分别验证 account 和 password
    await formRefAccount.value.validateField('account');
    await formRefAccount.value.validateField('password');
    const res = await loginPwd({ username: numberValidateForm.value.account, password: numberValidateForm.value.password })
    if (res.code === 200) {
      // 显示成功消息
      ElMessage.success('登录成功')
    }
  } catch (error) {
    ElMessage.error('登录失败', error.response.data.data)
    // 发起登录请求...
  }
};

const handleWxLoginSuccess = async (wxCode) => {
  // console.log('微信登录成功，code:', wxCode)
  // 这里可以处理登录成功后的逻辑
  // 例如调用你的开放平台登录接口
  // loginWithWxCode(wxCode).then(() => {
  //   // 跳转到首页或其他页面
  // })
  const res = await loginWx(wxCode)
  ElMessage.success('登录成功')
  userStore.setToken(res.data.token)
  router.push('/')
  // console.log(res)
}

const handleLoginSuccess = (res) => {
  // console.log('登录成功，token:', token)
  userStore.setToken(res.data.token)
  userStore.setUserId(res.data.userid)
  userStore.setUserPicUrl(res.data.pic)
  ElMessage.success('正在跳转中...')
  setTimeout(() => {
    router.push('/')
  }, 1000)
  // 这里可以处理登录成功后的逻辑
  // 例如存储token，跳转页面等
  // localStorage.setItem('auth_token', token)
}

</script>

<template>
  <div id="centerBox">
    <el-tabs v-model="activeName"
      type="card"
      class="demo-tabs">
      <el-tab-pane label="验证码登录"
        name="first">
        <el-form ref="formRefPhone"
          v-if="activeName === 'first'"
          style="max-width: 600px"
          :model="numberValidateForm"
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm">
          <el-form-item label="手机号"
            prop="phone">
            <el-input v-model="numberValidateForm.phone"
              @keydown.enter="sendCode"
              placeholder="请输入手机号" />

          </el-form-item>
          <el-form-item label="验证码"
            prop="code">
            <el-input @keydown.enter="handleCodeLogin"
              v-model="numberValidateForm.code"
              placeholder="请输入验证码">
              <template #append>
                <el-button type="primary"
                  @click="sendCode"
                  :disabled="isCodeSent">
                  {{ isCodeSent ? `${countdown}秒后重新发送` : '获取验证码' }}</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-button style="width: 100%;"
            @click="handleCodeLogin"
            type="success">立即登陆</el-button>
          <br>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="账号登录"
        name="second">

        <el-form ref="formRefAccount"
          v-if="activeName === 'second'"
          style="max-width: 600px"
          :model="numberValidateForm"
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm">
          <el-form-item label="账号"
            prop="account">
            <el-input placeholder="请输入账号"
              v-model="numberValidateForm.account"
              type="text"
              autocomplete="off" />

          </el-form-item>
          <el-form-item label="密码"
            prop="password">
            <el-input v-model="numberValidateForm.password"
              type="password"
              placeholder="请输入密码"
              show-password />
          </el-form-item>
          <el-button style="width: 100%;"
            @click="handleLogin"
            type="success">立即登陆</el-button>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="扫码登录"
        name="third">
        <div class="login-page"
          v-if="activeName === 'third'">
          <h2>扫码登录</h2>
          <ScanLogin @QRlogin-success="handleLoginSuccess" />
        </div>
      </el-tab-pane>
      <el-tab-pane label="微信登录"
        name="fourth">
        <div class="login-page"
          v-if="activeName === 'fourth'">
          <h2>微信登录</h2>
          <WxloginComponent @login-success="handleWxLoginSuccess" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
#centerBox {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20vh;

  .demo-tabs>.el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;

    .el-tab-pane {
      text-align: center;
    }
  }
}
</style>
