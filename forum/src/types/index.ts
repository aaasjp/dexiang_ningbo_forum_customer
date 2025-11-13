// 用户类型
export interface User {
  id: string
  username: string
  avatar: string
  email: string
  signature?: string
  points: number
  followCount: number
  fansCount: number
  likeCount: number
}

// 帖子类型
export interface Post {
  id: string
  title: string
  content: string
  author: User
  topicId?: string
  tags: string[]
  viewCount: number
  commentCount: number
  likeCount: number
  createTime: string
  updateTime: string
}

// 话题类型
export interface Topic {
  id: string
  name: string
  description: string
  icon: string
  discussCount: number
  followCount: number
  createTime: string
}

// 评论类型
export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  parentId?: string
  likeCount: number
  replies?: Comment[]
  createTime: string
}

// 消息类型
export interface Message {
  id: string
  from: User
  to: User
  content: string
  isRead: boolean
  createTime: string
}

// 积分记录类型
export interface PointRecord {
  id: string
  userId: string
  type: string
  points: number
  description: string
  createTime: string
}

