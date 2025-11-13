import { get, post, put, del } from './request'

// 回答类型
export interface AnswerItem {
  answer_id: number
  question_id: number
  parent_answer_id?: number | null
  content: string
  images?: string[]
  answerer_code: string
  answerer_name: string
  answerer_avatar?: string
  is_official: number
  is_pinned: number
  points_awarded: number
  is_useful: number
  like_count: number
  view_count: number
  favorite_count: number
  is_liked: boolean
  is_favorited: boolean
  create_time: string
  replies?: AnswerItem[]
}

// 回答详情类型
export interface AnswerDetail extends AnswerItem {
  question_title: string
}

// 回答列表响应
export interface AnswerListResponse {
  items: AnswerItem[]
}

// 创建回答请求数据
export interface CreateAnswerData {
  question_id: number
  parent_answer_id?: number | null
  content: string
  images?: string[]
}

// 更新回答请求数据
export interface UpdateAnswerData {
  content?: string
  images?: string[]
}

/**
 * 回答问题或回复回答
 */
export function createAnswer(data: CreateAnswerData) {
  return post<{ answer_id: number }>('/api/answers/create', data)
}

/**
 * 修改回答
 */
export function updateAnswer(answerId: number, data: UpdateAnswerData) {
  return put<{ answer_id: number }>(`/api/answers/update/${answerId}`, data)
}

/**
 * 获取问题的回答列表
 */
export function getAnswersByQuestion(questionId: number, page = 1, pageSize = 50) {
  return get<AnswerListResponse>(`/api/answers/list/question/${questionId}`, {
    page,
    page_size: pageSize
  })
}

/**
 * 获取回答详情
 */
export function getAnswerDetail(answerId: number) {
  return get<AnswerDetail>(`/api/answers/detail/${answerId}`)
}

/**
 * 我的被采纳回答
 */
export function getMyUsefulAnswers(page = 1, pageSize = 20) {
  return get<{ items: AnswerItem[] }>('/api/answers/my-useful', {
    page,
    page_size: pageSize
  })
}

/**
 * 标记回答为有用
 */
export function markAnswerAsUseful(answerId: number) {
  return post(`/api/answers/useful/${answerId}`)
}

/**
 * 删除回答
 */
export function deleteAnswer(answerId: number) {
  return del(`/api/answers/delete/${answerId}`)
}

/**
 * 点赞/取消点赞回答
 */
export function toggleLikeAnswer(answerId: number) {
  return post<{ liked: boolean }>(`/api/answers/like/${answerId}`)
}

/**
 * 收藏/取消收藏回答
 */
export function toggleFavoriteAnswer(answerId: number) {
  return post<{ favorited: boolean }>(`/api/answers/favorite/${answerId}`)
}

/**
 * 我的回答
 */
export function getMyAnswers(page = 1, pageSize = 20) {
  return get<{ items: AnswerItem[] }>('/api/answers/my', {
    page,
    page_size: pageSize
  })
}

/**
 * 查看某个人的回答列表
 */
export function getUserAnswers(targetUserCode: string, page = 1, pageSize = 20) {
  return get<{ items: AnswerItem[] }>(`/api/answers/list/by-user/${targetUserCode}`, {
    page,
    page_size: pageSize
  })
}

