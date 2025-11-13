import { get, post } from './request'
import type { QuestionItem } from './question'

// 话题类型
export interface Topic {
  topic_id: number
  title: string
  description: string
  cover_image?: string
  question_count: number
  view_count?: number
  create_time: string
  favorite_time?: string
}

// 话题列表响应
export interface TopicListResponse {
  items: Topic[]
}

// 话题下的问题列表响应
export interface TopicQuestionsResponse {
  items: QuestionItem[]
}

/**
 * 收藏/取消收藏话题
 */
export function toggleFavoriteTopic(topicId: number) {
  return post<{ favorited: boolean }>(`/api/topics/favorite/${topicId}`)
}

/**
 * 我收藏的话题列表
 */
export function getMyFavoriteTopics(page = 1, pageSize = 20) {
  return get<TopicListResponse>('/api/topics/my-favorite', {
    page,
    page_size: pageSize
  })
}

/**
 * 获取话题列表
 */
export function getTopicList(page = 1, pageSize = 20) {
  return get<TopicListResponse>('/api/topics/list', {
    page,
    page_size: pageSize
  })
}

/**
 * 获取话题详情
 */
export function getTopicDetail(topicId: number) {
  return get<Topic>(`/api/topics/detail/${topicId}`)
}

/**
 * 获取话题下的问题列表
 */
export function getTopicQuestions(topicId: number, page = 1, pageSize = 20) {
  return get<TopicQuestionsResponse>(`/api/topics/questions/list/${topicId}`, {
    page,
    page_size: pageSize
  })
}

/**
 * 搜索话题
 */
export function searchTopics(keyword: string, page = 1, pageSize = 20) {
  return get<TopicListResponse>('/api/topics/search', {
    keyword,
    page,
    page_size: pageSize
  })
}

