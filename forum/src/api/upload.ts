import { upload } from './request'

// 文件上传响应
export interface FileUploadResponse {
  file_url: string
  file_name: string
  file_size: number
}

// 图片上传响应
export interface ImageUploadResponse {
  image_url: string
  file_name: string
  file_size: number
}

// 多文件上传响应
export interface MultiFileUploadResponse {
  files?: FileUploadResponse[]
  image_urls?: string[]
  success_count: number
  error_count: number
  errors?: any
}

/**
 * 上传单个文件
 */
export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return upload<FileUploadResponse>('/api/upload/file', formData)
}

/**
 * 上传多个文件
 */
export function uploadFiles(files: File[]) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return upload<MultiFileUploadResponse>('/api/upload/files', formData)
}

/**
 * 上传单个图片
 */
export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return upload<ImageUploadResponse>('/api/upload/image', formData)
}

/**
 * 上传多个图片
 */
export function uploadImages(files: File[]) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return upload<MultiFileUploadResponse>('/api/upload/images', formData)
}

