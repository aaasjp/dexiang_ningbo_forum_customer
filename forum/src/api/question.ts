import { get, post, put } from './request'

// 话题类型
export interface TopicInfo {
  topic_id: number
  title: string
}

// 问题详情类型
export interface QuestionDetail {
  question_id: number
  title: string
  content: string
  images?: string[]
  category: string
  is_anonymous: number
  asker_code: string
  asker_name: string
  asker_avatar?: string
  status: number
  is_featured: number
  view_count: number
  like_count: number
  favorite_count: number
  answer_count: number
  is_liked: boolean
  is_favorited: boolean
  topics?: TopicInfo[]
  related_dept_ids?: number[]
  related_staff_codes?: string[]
  create_time: string
}

// 问题列表项类型
export interface QuestionItem {
  question_id: number
  title: string
  content: string
  category: string
  is_anonymous: number
  asker_name: string
  asker_code?: string
  asker_avatar?: string
  status: number
  is_featured: number
  view_count: number
  like_count: number
  favorite_count: number
  answer_count: number
  is_liked: boolean
  is_favorited: boolean
  create_time: string
  topics?: TopicInfo[]
  images?: string[]
}

// 问题列表响应
export interface QuestionListResponse {
  total: number
  page: number
  page_size: number
  items: QuestionItem[]
}

// 创建问题请求数据
export interface CreateQuestionData {
  title: string
  content: string
  images?: string[]
  category: string
  is_anonymous: number
  related_dept_ids?: number[]
  related_staff_codes?: string[]
  topic_ids?: number[]
}

// 更新问题请求数据
export interface UpdateQuestionData {
  title?: string
  content?: string
  images?: string[]
  category?: string
  related_dept_ids?: number[]
  related_staff_codes?: string[]
  topic_ids?: number[]
}

/**
 * 发布提问
 */
export function createQuestion(data: CreateQuestionData) {
  return post<{ question_id: number }>('/api/questions/create', data)
}

/**
 * 修改提问
 */
export function updateQuestion(questionId: number, data: UpdateQuestionData) {
  return put<{ question_id: number }>(`/api/questions/update/${questionId}`, data)
}

/**
 * 获取问题详情
 */
export function getQuestionDetail(questionId: number) {
  return get<QuestionDetail>(`/api/questions/detail/${questionId}`)
}

/**
 * 获取问题列表
 */
export interface GetQuestionListParams {
  category?: string
  status?: number
  keyword?: string
  page?: number
  page_size?: number
}

export function getQuestionList(params: GetQuestionListParams = {}) {
  return get<QuestionListResponse>('/api/questions/list', {
    page: 1,
    page_size: 20,
    ...params
  })
}

/**
 * 收藏/取消收藏问题
 */
export function toggleFavoriteQuestion(questionId: number) {
  return post<{ favorited: boolean }>(`/api/questions/favorite/${questionId}`)
}

/**
 * 更新问题状态
 */
export function updateQuestionStatus(questionId: number, status: number) {
  return put(`/api/questions/update-status/${questionId}`, null, {
    params: { status }
  })
}

/**
 * 点赞/取消点赞问题
 */
export function toggleLikeQuestion(questionId: number) {
  return post<{ liked: boolean }>(`/api/questions/like/${questionId}`)
}

/**
 * 我的提问
 */
export function getMyQuestions(page = 1, pageSize = 20) {
  return get<{ items: QuestionItem[] }>('/api/questions/my-ask', {
    page,
    page_size: pageSize
  })
}

/**
 * 查看某个人的问题列表
 */
export function getUserQuestions(targetUserCode: string, page = 1, pageSize = 20) {
  return get<{ items: QuestionItem[] }>(`/api/questions/list/by-user/${targetUserCode}`, {
    page,
    page_size: pageSize
  })
}

/**
 * 我收藏的问题
 */
export function getMyFavoriteQuestions(page = 1, pageSize = 20) {
  return get<{ items: QuestionItem[] }>('/api/questions/my-favorite', {
    page,
    page_size: pageSize
  })
}

/**
 * 邀请我的问题
 */
export function getMyInvitedQuestions(page = 1, pageSize = 20) {
  return get<{ items: QuestionItem[] }>('/api/questions/my-invited', {
    page,
    page_size: pageSize
  })
}

/**
 * 我收藏的问题和回答
 */
export interface FavoriteItem {
  type: 'question' | 'answer'
  id: number
  title?: string
  content: string
  category?: string
  status?: number
  view_count: number
  like_count: number
  favorite_count: number
  answer_count?: number
  create_time: string
  favorite_time: string
  question_id?: number
  question_title?: string
  answerer_name?: string
  is_official?: number
  points_awarded?: number
  is_useful?: number
}

export function getMyFavorites(page = 1, pageSize = 20) {
  return get<{ items: FavoriteItem[] }>('/api/questions/my-favorites', {
    page,
    page_size: pageSize
  })
}

