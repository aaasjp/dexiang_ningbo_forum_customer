/**
 * 数据转换工具函数
 * 用于将API返回的数据转换为前端需要的格式
 */

import type { Post, Comment, CommentReply } from '../types/post'
import type { QuestionItem, QuestionDetail } from '../api/question'
import type { AnswerItem } from '../api/answer'
import { formatTime } from './index'

/**
 * 将API的QuestionItem转换为Post类型
 */
export function transformQuestionToPost(question: QuestionItem): Post {
  return {
    id: String(question.question_id),
    question_id: question.question_id,
    author: {
      name: question.asker_name || '匿名用户',
      avatar: question.asker_avatar || '',
      forum_avatar: question.asker_avatar || '',
      badge: question.is_featured ? '精选' : '',
      staff_code: question.asker_code
    },
    category: question.is_featured ? 'select' : mapCategoryToFrontend(question.category),
    title: question.title,
    content: question.content,
    images: question.images || [],
    topic: question.topics?.[0]?.title,
    topics: question.topics,
    time: formatTime(question.create_time),
    create_time: question.create_time,
    comments: question.answer_count,
    answer_count: question.answer_count,
    likes: question.like_count,
    like_count: question.like_count,
    liked: question.is_liked,
    collects: question.favorite_count,
    favorite_count: question.favorite_count,
    collected: question.is_favorited,
    view_count: question.view_count,
    solved: question.status === 1,
    status: question.status,
    is_featured: question.is_featured,
    is_anonymous: question.is_anonymous,
    asker_code: question.asker_code,
    asker_name: question.asker_name
  }
}

/**
 * 将API的QuestionDetail转换为Post类型
 */
export function transformQuestionDetailToPost(question: QuestionDetail): Post {
  return {
    id: String(question.question_id),
    question_id: question.question_id,
    author: {
      name: question.asker_name || '匿名用户',
      avatar: question.asker_avatar || '',
      forum_avatar: question.asker_avatar || '',
      badge: question.is_featured ? '精选' : '',
      staff_code: question.asker_code
    },
    category: question.is_featured ? 'select' : mapCategoryToFrontend(question.category),
    title: question.title,
    content: question.content,
    images: question.images || [],
    topic: question.topics?.[0]?.title,
    topics: question.topics,
    time: formatTime(question.create_time),
    create_time: question.create_time,
    comments: question.answer_count,
    answer_count: question.answer_count,
    likes: question.like_count,
    like_count: question.like_count,
    liked: question.is_liked,
    collects: question.favorite_count,
    favorite_count: question.favorite_count,
    collected: question.is_favorited,
    view_count: question.view_count,
    solved: question.status === 1,
    status: question.status,
    is_featured: question.is_featured,
    is_anonymous: question.is_anonymous,
    asker_code: question.asker_code,
    asker_name: question.asker_name,
    related_dept_ids: question.related_dept_ids,
    related_staff_codes: question.related_staff_codes
  }
}

/**
 * 将API的AnswerItem转换为Comment类型
 */
export function transformAnswerToComment(answer: AnswerItem): Comment {
  return {
    id: String(answer.answer_id),
    answer_id: answer.answer_id,
    author: answer.answerer_name,
    avatar: answer.answerer_avatar || '',
    forum_avatar: answer.answerer_avatar || '',
    content: answer.content,
    time: formatTime(answer.create_time),
    create_time: answer.create_time,
    likes: answer.like_count,
    like_count: answer.like_count,
    liked: answer.is_liked,
    replies: answer.replies?.map(reply => transformAnswerToCommentReply(reply, answer.answerer_name)) || [],
    answerer_code: answer.answerer_code,
    answerer_name: answer.answerer_name,
    is_official: answer.is_official,
    is_pinned: answer.is_pinned,
    points_awarded: answer.points_awarded,
    is_useful: answer.is_useful,
    view_count: answer.view_count,
    favorite_count: answer.favorite_count,
    images: answer.images,
    parent_answer_id: answer.parent_answer_id,
    question_id: answer.question_id
  } as any
}

/**
 * 将API的AnswerItem转换为CommentReply类型
 * @param answer - 回答数据
 * @param parentAnswererName - 父评论作者名字
 */
export function transformAnswerToCommentReply(answer: AnswerItem, parentAnswererName: string = ''): CommentReply {
  return {
    id: String(answer.answer_id),
    answer_id: answer.answer_id,
    author: answer.answerer_name,
    avatar: answer.answerer_avatar || '',
    forum_avatar: answer.answerer_avatar || '',
    replyTo: parentAnswererName,
    content: answer.content,
    time: formatTime(answer.create_time),
    create_time: answer.create_time,
    likes: answer.like_count,
    like_count: answer.like_count,
    liked: answer.is_liked,
    answerer_code: answer.answerer_code,
    answerer_name: answer.answerer_name,
    is_official: answer.is_official,
    points_awarded: answer.points_awarded,
    is_useful: answer.is_useful,
    images: answer.images,
    // 递归处理嵌套的回复（支持多层回复）
    replies: answer.replies?.map(reply => transformAnswerToCommentReply(reply, answer.answerer_name)) || []
  }
}

/**
 * 映射分类从API到前端
 */
export function mapCategoryToFrontend(apiCategory: string): string {
  const categoryMap: Record<string, string> = {
    '建议类': 'suggest',
    '求助类': 'help',
    '吐槽类': 'complain',
    '自由提问': 'free'
  }
  return categoryMap[apiCategory] || apiCategory
}

/**
 * 映射分类从前端到API
 */
export function mapCategoryToApi(frontendCategory: string): string {
  const categoryMap: Record<string, string> = {
    'suggest': '建议类',
    'help': '求助类',
    'complain': '吐槽类',
    'free': '自由提问'
  }
  return categoryMap[frontendCategory] || frontendCategory
}

