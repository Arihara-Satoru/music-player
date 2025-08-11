import axios from 'axios'
import { ElMessage } from 'element-plus'

// 健康检查函数
const checkBackendHealth = async () => {
  const maxAttempts = 30
  const delay = 1000
  const healthEndpoint = '/health'

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await axios.get(service.defaults.baseURL + healthEndpoint, {
        timeout: 1000,
      })
      return true
    } catch {
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  return false
}

const service = axios.create({
  baseURL: 'http://localhost:12345',
  timeout: 30000, // 增加超时时间到30秒
  withCredentials: true, // 关键修改：启用跨域凭据传递
})

// 请求拦截器
service.interceptors.request.use(
  async (config) => {
    // 跳过健康检查请求本身
    if (config.url === '/health') {
      return config
    }

    // 检查后端是否就绪
    const isBackendReady = await checkBackendHealth()
    if (!isBackendReady) {
      ElMessage.error('后端服务未就绪，请稍后再试')
      return Promise.reject(new Error('Backend not ready'))
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 添加跨域需要的其他头（按需）
    config.headers['Accept'] = 'application/json'
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          ElMessage.error('请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请登录')
          // 可跳转到登录页
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 502:
          ElMessage.error('网关错误，请检查后端服务') // 新增 502 处理
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(`请求失败: ${error.message}`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
        ElMessage.info('等待后端启动或网络连接被拒绝')
      } else if (error.message.includes('timeout')) {
        ElMessage.error('请求超时，请检查网络或稍后再试')
      } else {
        ElMessage.error('网络异常，请检查连接')
      }
    } else {
      // 在设置请求时发生了一些事情，触发了一个错误
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  },
)

export default service
