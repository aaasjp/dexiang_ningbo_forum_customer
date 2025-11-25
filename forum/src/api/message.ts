import { get, post, del } from './request'

// 消息类型
export interface MessageItem {
  message_id: number
  message_type: 'personal' | 'department' | 'system'
  title: string
  content: string
  target_type?: string
  target_id?: number | null
  target_code?: string | null
  target_name?: string | null
  target_image?: string | null
  dept_id?: number | null
  is_read: number | boolean
  read_time?: string | null
  create_time: string
}

// 系统消息类型
export interface SystemMessage {
  message_id: number
  title: string
  content: string
  target_type?: string
  target_id?: number | null
  is_read: boolean
  create_time: string
}

// 消息汇总响应
export interface MessageSummary {
  personal_unread_count: number
  department_unread_count: number
  system_unread_count: number
  total_unread_count: number
}

// 消息列表响应
export interface MessageListResponse {
  total: number
  unread_count: number
  items: MessageItem[]
}

// 系统消息列表响应
export interface SystemMessageListResponse {
  total: number
  unread_count: number
  items: SystemMessage[]
}

/**
 * 获取消息汇总
 */
export function getMessageSummary() {
  return get<MessageSummary>('/api/messages/summary')
}

/**
 * 获取个人消息列表
 */
export interface GetMessagesParams {
  page?: number
  page_size?: number
  is_read?: number
}

export function getPersonalMessages(params: GetMessagesParams = {}) {
  return get<MessageListResponse>('/api/messages/personal', {
    page: 1,
    page_size: 20,
    ...params
  })
}

/**
 * 获取部门消息列表
 */
export function getDepartmentMessages(params: GetMessagesParams = {}) {
  return get<MessageListResponse>('/api/messages/department', {
    page: 1,
    page_size: 20,
    ...params
  })
}

/**
 * 获取系统消息列表
 */
export function getSystemMessages(page = 1, pageSize = 20) {
  return get<SystemMessageListResponse>('/api/messages/system', {
    page,
    page_size: pageSize
  })
}


/**
 * 标记消息为已读
 */
export function markMessageAsRead(messageId: number, messageType: string) {
  return post(`/api/messages/read`, {
    message_type: messageType,
    message_id: messageId
  })
}

/**
 * 标记所有消息为已读
 */
export function markAllMessagesAsRead(messageType?: 'personal' | 'department' | 'system') {
  return post<{ count: number }>('/api/messages/read-all', null, {
    params: messageType ? { message_type: messageType } : undefined
  })
}

/**
 * 删除消息
 */
export function deleteMessage(messageId: number) {
  return del(`/api/messages/${messageId}`)
}

