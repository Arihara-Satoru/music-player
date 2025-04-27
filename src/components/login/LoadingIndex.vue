<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { checkHealth } from '@/api/user'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { refreshToken } from '@/api/user'

const router = useRouter();
//在挂载前刷新token
const userStore = useUserStore()

const showRetry = ref(false)
let checkInterval = null

const checkBackend = async () => {
  try {
    const res = await checkHealth()
    console.log(res)
    if (res.status === 'ok') {
      clearInterval(checkInterval)
      checkInterval = null // 确保清除后不再重复调用
      if (userStore.token) {
        refreshToken(userStore.token, userStore.userId)
          .then(res => {
            if (res.data?.token) {
              userStore.setToken(res.data.token)
              ElMessage.success('刷新token成功')
            }
          })
          .catch(err => {
            ElMessage.error('刷新token失败')
            console.error('刷新token失败:', err)
          })
      }
      router.replace('/layout'); // 也可以直接写路径
    }
  } catch {
    showRetry.value = true
  }
}

onMounted(() => {
  checkBackend()
  checkInterval = setInterval(checkBackend, 2000)
})

onUnmounted(() => {
  clearInterval(checkInterval)
})
</script>

<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p>正在启动后端服务...</p>
    <button v-if="showRetry"
      @click="checkBackend">重试连接</button>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

button {
  margin-top: 20px;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
