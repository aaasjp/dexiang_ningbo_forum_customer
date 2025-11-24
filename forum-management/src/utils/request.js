import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const GW_SESSION_STORAGE_KEY = 'gw_session'

function safeGetFromStorage() {
  try {
    return window.localStorage.getItem(GW_SESSION_STORAGE_KEY) || ''
  } catch (error) {
    console.warn('无法读取 gw_session:', error)
    return ''
  }
}

function safeSetToStorage(value) {
  try {
    window.localStorage.setItem(GW_SESSION_STORAGE_KEY, value)
  } catch (error) {
    console.warn('无法写入 gw_session:', error)
  }
}

function safeRemoveFromStorage() {
  try {
    window.localStorage.removeItem(GW_SESSION_STORAGE_KEY)
  } catch (error) {
    console.warn('无法移除 gw_session:', error)
  }
}

let GW_SESSION = safeGetFromStorage()

export function getGwSession() {
  return GW_SESSION
}

export function setGwSession(session) {
  GW_SESSION = session || ''
  if (session) {
    safeSetToStorage(session)
  }
  request.defaults.headers['gw_session'] = GW_SESSION
}

export function clearGwSession() {
  GW_SESSION = ''
  safeRemoveFromStorage()
  request.defaults.headers['gw_session'] = ''
}

// 创建 axios 实例
const request = axios.create({
  // baseURL: 'http://220.154.134.61:8000/api', // 使用 Vite 代理，避免跨域问题
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'gw_session': GW_SESSION
  }
})

// 生产环境的后端地址: http://220.154.134.61:8000

// 模拟的 gw_session (需要进行 URL 编码以支持中文)


// 请求拦截器
request.interceptors.request.use(
  config => {
    if (GW_SESSION) {
      config.headers['gw_session'] = GW_SESSION
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果是 blob 类型的响应（如文件下载），直接返回
    if (response.config.responseType === 'blob') {
      return res
    }
    
    // 如果返回的状态码不是 200，统一处理错误提示
    if (res.code !== 200) {
      // 优先显示 detail 字段的信息，如果没有则显示"服务异常"
      const errorMessage = res.detail || '服务异常'
      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    
    // 统一处理网络错误或其他异常
    let errorMessage = '服务异常'
    
    if (error.response) {
      if (error.response.status === 401) {
        clearGwSession()
        if (router.currentRoute.value.path !== '/login') {
          router.replace({ path: '/login' })
        }
      }
      
      if (error.response.data) {
        errorMessage = error.response.data.detail || errorMessage
      }
    } else if (error.message) {
      // 如果是网络错误等，显示错误消息
      if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else if (error.message.includes('Network Error')) {
        errorMessage = '网络连接失败，请检查网络'
      }
    }
    
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
)

export default request
