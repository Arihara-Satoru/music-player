<script setup>
import { ref } from 'vue'
import { getPhoneCode, login } from '@/api/user'

const activeName = ref('first')

const formRefPhone = ref()
const formRefAccount = ref()
let isCodeSent = ref(false) // 添加一个标志位，表示验证码是否已发送
let countdown = ref(60) // 倒计时秒数

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

const handleLogin = () => {
  formRefPhone.value.validate(async (valid) => {
    if (valid) {
      const res = await login({ mobile: numberValidateForm.value.phone, code: numberValidateForm.value.code })
      if (res.code === 200) {
        ElMessage.success('登录成功')
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
      }
    }
  })
}

</script>

<template>
  <div id="centerBox">
    <el-tabs v-model="activeName"
      type="card"
      class="demo-tabs"
      @tab-click="handleClick">
      <el-tab-pane label="验证码登录"
        name="first">
        <el-form ref="formRefPhone"
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
            <el-input @keydown.enter="handleLogin"
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
            @click="handleLogin"
            type="success">立即登陆</el-button>
        </el-form>
      </el-tab-pane>


      <el-tab-pane label="账号登录"
        name="second">

        <el-form ref="formRefAccount"
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
            type="success">立即登陆</el-button>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="扫码登录"
        name="third">
        <div class="demo-image">
          <div class="block">
            <span class="demonstration"></span>
            <el-image style="width: 300px; height: 300px"
              src='https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg' />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="微信登录"
        name="fourth">
        <div class="demo-image">
          <div class="block">
            <span class="demonstration"></span>
            <el-image style="width: 300px; height: 300px"
              src='https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg' />
          </div>
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
  margin-top: 200px;


  .demo-tabs>.el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;

    .el-tab-pane {
      text-align: center;

      .demo-image .block {
        padding: 30px 0;
        text-align: center;
        border-right: solid 1px var(--el-border-color);
        display: inline-block;
        width: 100%;
        box-sizing: border-box;
        vertical-align: top;
      }

      .demo-image .block:last-child {
        border-right: none;
      }

      .demo-image .demonstration {
        display: block;
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 20px;
      }
    }
  }
}
</style>
