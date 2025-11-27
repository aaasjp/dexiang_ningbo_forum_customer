import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// API基础URL
// const BASE_URL = 'http://220.154.134.61:8000'
// const BASE_URL = 'http://10.129.114.106:8000'

// 从 URL 中获取 session 参数
function getSessionFromUrl(): string | null {
  const hash = window.location.hash
  // 获取 session 字段，不能按照位置获取，需要格式化 window.location.hash 成对象，获取 session 字段对应的内容
  
  if (!hash) {
    return null
  }
  
  // 去掉 # 符号
  const hashWithoutSharp = hash.substring(1)
  
  // 查找 ? 的位置，分离路径和查询参数
  const queryIndex = hashWithoutSharp.indexOf('?')
  if (queryIndex === -1) {
    return null
  }
  
  // 提取查询参数字符串
  const queryString = hashWithoutSharp.substring(queryIndex + 1)
  
  // 解析查询参数成对象
  const params: Record<string, string> = {}
  const pairs = queryString.split('&')
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key && value) {
      // 解码 URL 编码的值
      params[decodeURIComponent(key)] = decodeURIComponent(value)
    }
  }
  
  // 返回 session 字段的值
  return params.session || null
}

// 获取 MOCK_SESSION：优先从 URL 获取，如果没有则使用默认值
function getMockSession(): string {
  const urlSession = getSessionFromUrl()
  if (urlSession) {
    // URL 中的 session 可能已经编码，也可能未编码，这里确保编码
    localStorage.setItem('session', urlSession)
    return encodeURIComponent(decodeURIComponent(urlSession))
  } else {
    const localStorageSession = localStorage.getItem('session')
    if (localStorageSession) {
      return encodeURIComponent(decodeURIComponent(localStorageSession))
    }
  }
  // 默认的 session（对中文进行编码以符合 HTTP header 规范）
  return encodeURIComponent(JSON.stringify({
    appid: '500883957',
    name: '王十二',
    department: '人力资源部',
    orgId: '2',
    jobTitle: '普通员工',
    gender: '2',
    status: '1',
    jobNo: 'staff010'
  }))
}

// 模拟的gw_session
let MOCK_SESSION = getMockSession()

// 导出函数以便在需要时重新获取 session
export function refreshMockSession(): string {
  MOCK_SESSION = getMockSession()
  return MOCK_SESSION
}

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
  // baseURL: '/shsqltApi',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'gw_session': MOCK_SESSION
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 确保每个请求都带上gw_session
    if (!config.headers['gw_session']) {
      config.headers['gw_session'] = MOCK_SESSION
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message } = response.data
    
    // 成功响应
    if (code === 200) {
      return response.data as any
    }
    
    // 业务错误 - 优先使用 detail 字段
    const errorMsg = (response.data as any)?.detail || message || '请求失败'
    console.error('业务错误:', errorMsg)
    ElMessage({
      message: errorMsg,
      type: 'error',
      showClose: false,
      customClass: 'custom-error-message'
    })
    return Promise.reject(new Error(errorMsg))
  },
  (error) => {
    // HTTP错误
    console.error('HTTP错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      // 优先使用 detail 字段，其次使用 message 字段
      let errorMsg = data?.detail || data?.message || '请求失败'
      
      // 如果没有 detail 或 message，则根据状态码提供默认消息
      if (!data?.detail && !data?.message) {
        switch (status) {
          case 400:
            errorMsg = '请求参数错误'
            break
          case 401:
            errorMsg = '未认证'
            break
          case 403:
            errorMsg = '无权限'
            break
          case 404:
            errorMsg = '资源不存在'
            break
          case 500:
            errorMsg = '服务器内部错误'
            break
          default:
            errorMsg = `请求失败: ${status}`
        }
      }
      
      console.error('错误信息:', errorMsg)
      ElMessage({
        message: errorMsg,
        type: 'error',
        showClose: false,
        customClass: 'custom-error-message'
      })
      return Promise.reject(new Error(errorMsg))
    }
    
    if (error.request) {
      const errorMsg = '网络错误，请检查网络连接'
      console.error(errorMsg)
      ElMessage({
        message: errorMsg,
        type: 'error',
        showClose: false,
        customClass: 'custom-error-message'
      })
      return Promise.reject(new Error(errorMsg))
    }
    
    ElMessage({
      message: error.message || '未知错误',
      type: 'error',
      showClose: false,
      customClass: 'custom-error-message'
    })
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get<T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return instance.get(url, { params, ...config })
}

// 封装POST请求
export function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return instance.post(url, data, config)
}

// 封装PUT请求
export function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return instance.put(url, data, config)
}

// 封装DELETE请求
export function del<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return instance.delete(url, config)
}

// 封装文件上传请求
export function upload<T = any>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return instance.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers
    }
  })
}

export default instance

