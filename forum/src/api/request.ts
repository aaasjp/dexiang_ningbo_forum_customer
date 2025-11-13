import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// API基础URL
// const BASE_URL = 'http://220.154.134.61:8000'
// const BASE_URL = 'http://10.129.114.106:8000'

// 模拟的gw_session（对中文进行编码以符合 HTTP header 规范）
const MOCK_SESSION = encodeURIComponent('appid=500883957,name=张三,depatment=人力资源部,orgId=2,jobTitle=管理员, gender=2, status=1,jobNo=staff001')

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
  // baseURL: '/api',
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
    
    // 业务错误
    console.error('业务错误:', message)
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    // HTTP错误
    console.error('HTTP错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          console.error('请求参数错误')
          break
        case 401:
          console.error('未认证')
          break
        case 403:
          console.error('无权限')
          break
        case 404:
          console.error('资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`请求失败: ${status}`)
      }
      
      return Promise.reject(new Error(data?.message || '请求失败'))
    }
    
    if (error.request) {
      console.error('网络错误，请检查网络连接')
      return Promise.reject(new Error('网络错误'))
    }
    
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

