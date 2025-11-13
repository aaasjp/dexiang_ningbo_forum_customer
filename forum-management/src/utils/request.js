import axios from 'axios'
import { ElMessage } from 'element-plus'
const GW_SESSION = encodeURIComponent('appid=500883957,name=张三,depatment=人力资源部,orgId=2,jobTitle=管理员, gender=2, status=1,jobNo=staff001')

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
    
    let message = '网络错误,请稍后重试'
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权,请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误,未找到该资源'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data?.message || '请求失败'
      }
    }
    
    //ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request


