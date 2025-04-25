import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { useUserStore } from './stores/user'
import { refreshToken } from './api/user'
import { ElMessage } from 'element-plus';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)

//在挂载前刷新token
const userStore = useUserStore()
if (userStore.token) {
  refreshToken(userStore.token, userStore.userId)
    .then(res => {
      if (res.data?.token) {
        userStore.setToken(res.data.token)
        ElMessage.success('刷新token成功')
      }
    })
    .catch(err => {
      ElMessage.success('刷新token失败')
      console.error('刷新token失败:', err)
    })
}

app.mount('#app')
