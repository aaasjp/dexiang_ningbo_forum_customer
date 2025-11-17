import axios from 'axios'
import { ElMessage } from 'element-plus'

// 从 URL 中获取 session 参数
function getSessionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('session')
}

// 获取 GW_SESSION：优先从 URL 获取，如果没有则使用默认值
function getGwSession() {
  const urlSession = getSessionFromUrl()
  if (urlSession) {
    // URL 中的 session 可能已经编码，也可能未编码，这里确保编码
    return encodeURIComponent(decodeURIComponent(urlSession))
  }
  // 默认的 session（对中文进行编码以符合 HTTP header 规范）
  return encodeURIComponent('appid=500883957,name=张三,depatment=人力资源部,orgId=2,jobTitle=管理员, gender=2, status=1,jobNo=staff001')
}

let GW_SESSION = getGwSession()

// 导出函数以便在需要时重新获取 session
export function refreshGwSession() {
  GW_SESSION = getGwSession()
  return GW_SESSION
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
    if (!config.headers['gw_session']) {
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
    
    // 如果返回的状态码不是 200,则显示错误信息
    if (res.code !== 200) {
      //ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    
    // 不在拦截器中显示错误提示，由业务代码自行处理
    // 这样可以避免重复提示
    
    return Promise.reject(error)
  }
)

export default request


