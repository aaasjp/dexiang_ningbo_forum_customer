// 作者信息
export interface Author {
  name: string
  avatar: string
  forum_avatar?: string  // 头像URL
  badge?: string
  staff_code?: string
}

// 话题信息
export interface TopicInfo {
  topic_id: number
  title: string
}

// 帖子类型 (对应API的Question)
export interface Post {
  id: string
  question_id?: number  // API返回的ID
  author: Author
  category: string
  title: string
  content?: string
  images?: string[]
  topic?: string
  topics?: TopicInfo[]  // API返回的话题列表
  mentions?: string[]  // @提及的用户
  time: string
  create_time?: string  // API返回的创建时间
  comments: number
  answer_count?: number  // API返回的回答数
  likes: number
  like_count?: number  // API返回的点赞数
  collects?: number  // 收藏数
  favorite_count?: number  // API返回的收藏数
  view_count?: number  // 浏览数
  solved?: boolean  // 是否已解决
  status?: number  // API返回的状态 (0待解决，1已解决，2未解决，3已关闭)
  is_featured?: number  // 是否精选
  is_anonymous?: number  // 是否匿名
  liked?: boolean   // 是否已点赞
  collected?: boolean  // 是否已收藏
  commented?: boolean  // 是否已评论
  asker_code?: string  // 提问者工号
  asker_name?: string  // 提问者姓名
  related_dept_ids?: number[]  // 相关部门ID
  related_staff_codes?: string[]  // 相关员工工号
}

// 评论类型 (对应API的Answer)
export interface Comment {
  id: string
  answer_id?: number  // API返回的ID
  author: string
  avatar: string
  forum_avatar?: string  // 头像URL
  content: string
  time: string
  create_time?: string  // API返回的创建时间
  likes: number
  like_count?: number  // API返回的点赞数
  liked?: boolean
  favorited?: boolean  // 是否已收藏
  replies?: CommentReply[]
  answerer_code?: string  // 回答者工号
  answerer_name?: string  // 回答者姓名
  is_official?: number  // 是否官方回答
  is_pinned?: number  // 是否置顶
  points_awarded?: number  // 获得积分
  is_useful?: number  // 是否有用
  view_count?: number  // 浏览数
  favorite_count?: number  // 收藏数
  images?: string[]  // 图片
  parent_answer_id?: number | null  // 父回答ID
  question_id?: number  // 问题ID
}

// 评论回复类型
export interface CommentReply {
  id: string
  answer_id?: number  // API返回的ID
  author: string
  avatar: string
  forum_avatar?: string  // 头像URL
  replyTo: string  // 回复给谁
  content: string
  time: string
  create_time?: string  // API返回的创建时间
  likes: number
  like_count?: number  // API返回的点赞数
  liked?: boolean
  answerer_code?: string  // 回答者工号
  answerer_name?: string  // 回答者姓名
  is_official?: number  // 是否官方回答
  points_awarded?: number  // 获得积分
  is_useful?: number  // 是否有用
  images?: string[]  // 图片
}

// 帖子分类
export type PostCategory = 'suggest' | 'help' | 'complain' | 'select' | 'all' | '建议类' | '求助类' | '吐槽类' | '精选'

// 分类选项
export interface CategoryOption {
  id: PostCategory
  name: string
}

