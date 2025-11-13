import type { Post, Comment } from '../types/post'

// Mock 帖子数据
export const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'momo',
      avatar: '👤',
      badge: '专家'
    },
    category: 'select',
    title: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。首要任务是优...',
    content: '',
    images: [],
    topic: '如何提高客户满意度',
    time: '1小时前',
    comments: 62500,
    likes: 90100,
    solved: true,
    liked: true,
    commented: false
  },
  {
    id: '2',
    author: {
      name: '小叶子',
      avatar: '👤',
      badge: ''
    },
    category: 'help',
    title: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。首要任务是优...',
    content: '',
    images: ['图片', '图片', '图片'],
    topic: '',
    time: '1小时前',
    comments: 0,
    likes: 0,
    solved: false,
    liked: false,
    commented: false
  },
  {
    id: '3',
    author: {
      name: '小叶子',
      avatar: '👤',
      badge: ''
    },
    category: 'complain',
    title: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。首要任务是优...',
    content: '',
    images: ['图片1', '图片2', '图片3'],
    topic: '',
    time: '1小时前',
    comments: 62500,
    likes: 90100,
    solved: true
  },
  {
    id: '4',
    author: {
      name: '小叶子',
      avatar: '👤',
      badge: ''
    },
    category: 'suggest',
    title: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。首要任务是优...',
    content: '',
    images: [],
    topic: '如何提高客户满意度',
    time: '1小时前',
    comments: 0,
    likes: 0,
    solved: false
  },
  {
    id: '5',
    author: {
      name: '张三',
      avatar: '👨',
      badge: '活跃'
    },
    category: 'help',
    title: '如何优化移动端的用户体验？',
    content: '最近在做移动端项目，想请教一下大家有什么好的优化建议...',
    images: [],
    topic: '移动端开发',
    time: '2小时前',
    comments: 45,
    likes: 89,
    solved: true
  },
  {
    id: '6',
    author: {
      name: '李四',
      avatar: '👩',
      badge: ''
    },
    category: 'complain',
    title: '今天遇到的一些糟心事',
    content: '分享一下今天的经历，希望大家引以为戒...',
    images: ['图片1', '图片2'],
    topic: '',
    time: '3小时前',
    comments: 156,
    likes: 234,
    solved: false
  },
  {
    id: '7',
    author: {
      name: '王五',
      avatar: '🧑',
      badge: '专家'
    },
    category: 'suggest',
    title: '关于提升团队协作效率的几点建议',
    content: '基于多年的团队管理经验，我总结了以下几点...',
    images: [],
    topic: '团队管理',
    time: '5小时前',
    comments: 78,
    likes: 156,
    solved: true
  },
  {
    id: '8',
    author: {
      name: '赵六',
      avatar: '👨‍💼',
      badge: ''
    },
    category: 'help',
    title: 'Vue3 项目中如何优雅地处理全局状态？',
    content: '项目越来越大，状态管理变得复杂，求推荐最佳实践...',
    images: ['代码截图'],
    topic: 'Vue开发',
    time: '6小时前',
    comments: 92,
    likes: 178,
    solved: false
  },
  {
    id: '9',
    author: {
      name: '陈经理',
      avatar: '👨‍💼',
      badge: '专家'
    },
    category: 'select',
    title: '办理流程优化实践：从繁琐到高效的转变之路',
    content: '通过系统化梳理和数字化改造，我们成功将办理时间缩短了60%...',
    images: [],
    topic: '办理流程的快速梳理',
    time: '2小时前',
    comments: 156,
    likes: 342,
    solved: true,
    liked: false,
    commented: false
  },
  {
    id: '10',
    author: {
      name: '业务小王',
      avatar: '👤',
      badge: ''
    },
    category: 'help',
    title: '新员工如何快速掌握各类业务办理流程？',
    content: '刚入职不久，面对复杂的业务流程有点懵，求前辈指点...',
    images: [],
    topic: '办理流程的快速梳理',
    time: '3小时前',
    comments: 45,
    likes: 67,
    solved: false,
    liked: false,
    commented: false
  },
  {
    id: '11',
    author: {
      name: '效率达人',
      avatar: '⚡',
      badge: '活跃'
    },
    category: 'suggest',
    title: '分享一套超实用的流程管理工具和方法',
    content: '使用这些工具后，团队效率提升明显，强烈推荐给大家...',
    images: ['工具截图1', '工具截图2'],
    topic: '办理流程的快速梳理',
    time: '5小时前',
    comments: 89,
    likes: 234,
    solved: true,
    liked: true,
    commented: false
  },
  {
    id: '12',
    author: {
      name: '流程专员',
      avatar: '📋',
      badge: ''
    },
    category: 'suggest',
    title: '建议增加流程可视化功能，方便新人学习',
    content: '如果能有流程图展示，相信会大大降低学习成本...',
    images: [],
    topic: '办理流程的快速梳理',
    time: '1天前',
    comments: 23,
    likes: 56,
    solved: false,
    liked: false,
    commented: false
  },
  {
    id: '13',
    author: {
      name: '客服主管',
      avatar: '👩‍💼',
      badge: '专家'
    },
    category: 'select',
    title: '标准化流程手册已更新，附详细操作指南',
    content: '最新版流程手册已发布，包含所有常见业务场景的处理方法...',
    images: ['手册封面'],
    topic: '办理流程的快速梳理',
    time: '1天前',
    comments: 178,
    likes: 445,
    solved: true,
    liked: false,
    commented: false
  },
  {
    id: '14',
    author: {
      name: '小李',
      avatar: '👤',
      badge: ''
    },
    category: 'complain',
    title: '某些流程设计不合理，希望能优化改进',
    content: '在实际操作中发现有些环节重复且繁琐，建议简化...',
    images: [],
    topic: '办理流程的快速梳理',
    time: '2天前',
    comments: 67,
    likes: 123,
    solved: false,
    liked: false,
    commented: false
  },
  {
    id: '15',
    author: {
      name: '培训师',
      avatar: '👨‍🏫',
      badge: '活跃'
    },
    category: 'suggest',
    title: '定期开展流程培训，提升团队整体水平',
    content: '建议每月组织一次流程培训，分享最佳实践和常见问题...',
    images: [],
    topic: '办理流程的快速梳理',
    time: '3天前',
    comments: 34,
    likes: 89,
    solved: true,
    liked: false,
    commented: false
  },
  {
    id: '16',
    author: {
      name: '老张',
      avatar: '👨',
      badge: '专家'
    },
    category: 'help',
    title: '遇到特殊情况时，流程该如何灵活调整？',
    content: '标准流程很清楚，但实际工作中经常遇到特殊情况...',
    images: [],
    topic: '办理流程的快速梳理',
    time: '3天前',
    comments: 56,
    likes: 112,
    solved: true,
    liked: false,
    commented: false
  }
]

// 获取所有帖子
export const getAllPosts = (): Post[] => {
  return mockPosts
}

// 根据分类获取帖子
export const getPostsByCategory = (category: string): Post[] => {
  if (category === 'all') {
    return mockPosts
  }
  return mockPosts.filter(post => post.category === category)
}

// 根据 ID 获取帖子
export const getPostById = (id: string): Post | undefined => {
  return mockPosts.find(post => post.id === id)
}

// 获取关注的帖子（模拟）
export const getFollowPosts = (): Post[] => {
  // 返回关注用户的帖子
  return mockPosts.filter(post => ['1', '2', '5', '7'].includes(post.id))
}

// 话题类型定义
export interface Topic {
  id: string
  name: string
  icon: string
  description: string
  discussCount: number
  followCount: number
  isFollowed: boolean
  rank?: number
  bgColor: string
}

// Mock 话题数据
export const mockTopics: Topic[] = [
  {
    id: '1',
    name: '银行如何提高用户满意度让你...',
    icon: '💡',
    description: '探讨银行提升客户满意度的策略与方法',
    discussCount: 12200,
    followCount: 5600,
    isFollowed: false,
    rank: 1,
    bgColor: '#FFE5E5'
  },
  {
    id: '2',
    name: '办理流程的快速梳理',
    icon: '📋',
    description: '分享高效办理各类业务流程的经验',
    discussCount: 980,
    followCount: 4200,
    isFollowed: false,
    rank: 2,
    bgColor: '#FFF4E5'
  },
  {
    id: '3',
    name: '如何提高工作效率',
    icon: '⚡',
    description: '讨论提升工作效率的技巧和工具',
    discussCount: 12200,
    followCount: 6800,
    isFollowed: false,
    rank: 3,
    bgColor: '#FFFBE5'
  },
  {
    id: '4',
    name: '如何提高工作效率',
    icon: '💼',
    description: '分享职场效率提升的方法论',
    discussCount: 2300,
    followCount: 1200,
    isFollowed: false,
    rank: 4,
    bgColor: '#E5F5FF'
  },
  {
    id: '5',
    name: '数字化转型实践',
    icon: '🚀',
    description: '探讨企业数字化转型的路径与挑战',
    discussCount: 8900,
    followCount: 3500,
    isFollowed: false,
    rank: 5,
    bgColor: '#F0E5FF'
  },
  {
    id: '6',
    name: '客户体验优化',
    icon: '⭐',
    description: '分享提升客户体验的最佳实践',
    discussCount: 7600,
    followCount: 2900,
    isFollowed: false,
    rank: 6,
    bgColor: '#E5FFE5'
  },
  {
    id: '7',
    name: '金融科技创新',
    icon: '💰',
    description: '讨论金融科技领域的最新趋势',
    discussCount: 6500,
    followCount: 2400,
    isFollowed: false,
    rank: 7,
    bgColor: '#FFE5F5'
  },
  {
    id: '8',
    name: '团队协作技巧',
    icon: '🤝',
    description: '分享团队高效协作的方法',
    discussCount: 5400,
    followCount: 2100,
    isFollowed: false,
    rank: 8,
    bgColor: '#E5FFFF'
  },
  {
    id: '9',
    name: '产品设计思维',
    icon: '🎨',
    description: '探讨产品设计的理念与方法',
    discussCount: 4800,
    followCount: 1900,
    isFollowed: false,
    rank: 9,
    bgColor: '#FFF0E5'
  },
  {
    id: '10',
    name: '数据分析实战',
    icon: '📊',
    description: '分享数据分析的技巧与案例',
    discussCount: 4200,
    followCount: 1600,
    isFollowed: false,
    rank: 10,
    bgColor: '#E5E5FF'
  }
]

// 获取所有话题
export const getAllTopics = (): Topic[] => {
  return mockTopics
}

// 根据 ID 获取话题
export const getTopicById = (id: string): Topic | undefined => {
  return mockTopics.find(topic => topic.id === id)
}

// 搜索话题
export const searchTopics = (keyword: string): Topic[] => {
  if (!keyword.trim()) {
    return mockTopics
  }
  return mockTopics.filter(topic => 
    topic.name.toLowerCase().includes(keyword.toLowerCase()) ||
    topic.description.toLowerCase().includes(keyword.toLowerCase())
  )
}

// 关注用户类型定义
export interface FollowUser {
  id: string
  name: string
  avatar: string
  badge?: string
}

// Mock 关注用户数据
export const mockFollowUsers: FollowUser[] = [
  {
    id: '1',
    name: '小叶子',
    avatar: '👤',
    badge: ''
  },
  {
    id: '2',
    name: 'momo',
    avatar: '👨‍💼',
    badge: '专家'
  },
  {
    id: '3',
    name: '张三',
    avatar: '👨',
    badge: '活跃'
  },
  {
    id: '4',
    name: '李四',
    avatar: '👩',
    badge: ''
  },
  {
    id: '5',
    name: '王五',
    avatar: '🧑',
    badge: '专家'
  },
  {
    id: '6',
    name: '赵六',
    avatar: '👨‍💼',
    badge: ''
  },
  {
    id: '7',
    name: '钱七',
    avatar: '👩‍💼',
    badge: '活跃'
  },
  {
    id: '8',
    name: '孙八',
    avatar: '🧑‍💼',
    badge: ''
  }
]

// 获取关注用户列表
export const getFollowUsers = (): FollowUser[] => {
  return mockFollowUsers
}

// 消息类型定义
export interface Message {
  id: string
  type: 'official' | 'department' | 'user' // 官方消息、部门消息、用户消息
  title: string
  avatar: string
  content: string
  time: string
  unread: boolean
  unreadCount?: number
}

// 消息详情类型
export interface MessageDetail {
  id: string
  type: 'official' | 'department' | 'user'
  title: string
  tag?: string
  tagColor?: string
  items: {
    id: string
    title: string
    content: string
    time: string
    unread?: boolean
  }[]
}

// Mock 消息列表数据
export const mockMessages: Message[] = [
  {
    id: '1',
    type: 'official',
    title: '官方消息',
    avatar: '🔔',
    content: '新话题榜单总结',
    time: '1分钟前',
    unread: true,
    unreadCount: 1
  },
  {
    id: '2',
    type: 'department',
    title: '部门消息',
    avatar: '📢',
    content: '新话题榜单总结',
    time: '1分钟前',
    unread: true,
    unreadCount: 1
  },
  {
    id: '3',
    type: 'user',
    title: '小叶子',
    avatar: '👤',
    content: '回答了问题  银行如何提高客户满意度?',
    time: '3小时前',
    unread: false
  },
  {
    id: '4',
    type: 'user',
    title: '小叶子',
    avatar: '👨‍💼',
    content: '回答了问题  银行如何提高客户满意度?',
    time: '08-12',
    unread: false
  },
  {
    id: '5',
    type: 'user',
    title: '小叶子',
    avatar: '🧑',
    content: '回答了问题  银行如何提高客户满意度?',
    time: '06-12',
    unread: false
  }
]

// Mock 官方消息详情
export const mockOfficialMessages: MessageDetail = {
  id: '1',
  type: 'official',
  title: '官方消息',
  items: [
    {
      id: '1',
      title: '积分规则变化',
      content: '积分系统焕新！即日起，签到、任务奖励翻倍，商城好礼上新。您的账户已收到【XX】积分升级礼，速来查看使用吧！',
      time: '08-12'
    },
    {
      id: '2',
      title: '积分规则变化',
      content: '积分系统焕新！即日起，签到、任务奖励翻倍，商城好礼上新。您的账户已收到【XX】积分升级礼，速来查看使用吧！',
      time: '08-12'
    },
    {
      id: '3',
      title: '积分规则变化',
      content: '积分系统焕新！即日起，签到、任务奖励翻倍，商城好礼上新。您的账户已收到【XX】积分升级礼，速来查看使用吧！',
      time: '08-12'
    }
  ]
}

// Mock 部门消息详情
export const mockDepartmentMessages: MessageDetail = {
  id: '2',
  type: 'department',
  title: '部门消息',
  items: [
    {
      id: '1',
      title: '银行如何提高客户满意度回答',
      content: '',
      time: '08-12',
      unread: true
    },
    {
      id: '2',
      title: '银行如何提高客户满意度回答',
      content: '',
      time: '08-12',
      unread: false
    },
    {
      id: '3',
      title: '银行如何提高客户满意度回答',
      content: '',
      time: '08-12',
      unread: false
    }
  ]
}

// 获取消息列表
export const getMessages = (): Message[] => {
  return mockMessages
}

// 根据 ID 获取消息详情
export const getMessageDetail = (id: string, type: string): MessageDetail | undefined => {
  if (type === 'official') {
    return mockOfficialMessages
  } else if (type === 'department') {
    return mockDepartmentMessages
  }
  return undefined
}

// @我的消息类型
export interface MentionItem {
  id: string
  user: {
    name: string
    avatar: string
  }
  action: string
  time: string
  question: string
  views: number
  replies: number
}

// 积分记录类型
export interface PointRecord {
  id: string
  title: string
  points: number
  date: string
}

// Mock @我的数据
export const mockMentions: MentionItem[] = [
  {
    id: '1',
    user: {
      name: '秋天的雨',
      avatar: '👤'
    },
    action: '邀请你回答',
    time: '9分钟前',
    question: '银行如何提高客户满意度',
    views: 500,
    replies: 12
  },
  {
    id: '2',
    user: {
      name: '秋天的雨',
      avatar: '👤'
    },
    action: '邀请你回答',
    time: '9分钟前',
    question: '银行如何提高客户满意度',
    views: 500,
    replies: 12
  }
]

// Mock 积分记录数据
export const mockPointRecords: PointRecord[] = [
  {
    id: '1',
    title: '每日签到',
    points: 10,
    date: '9月24日'
  },
  {
    id: '2',
    title: '发表不当言论',
    points: -10,
    date: '2024年9月12日'
  },
  {
    id: '3',
    title: '发表不当言论',
    points: -10,
    date: '2024年9月12日'
  },
  {
    id: '4',
    title: '发表不当言论',
    points: -10,
    date: '2024年9月12日'
  }
]

// 获取@我的列表
export const getMentions = (): MentionItem[] => {
  return mockMentions
}

// 获取积分记录
export const getPointRecords = (): PointRecord[] => {
  return mockPointRecords
}

// Mock 评论数据
export const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: '1',
      author: '小叶子',
      avatar: '👨',
      content: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。',
      time: '1小时前',
      likes: 123,
      liked: false,
      replies: [
        {
          id: '1-1',
          author: '大宝哥',
          avatar: '👨‍💼',
          replyTo: '小叶子',
          content: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。',
          time: '1小时前',
          likes: 0,
          liked: false
        },
        {
          id: '1-2',
          author: '大大',
          avatar: '👤',
          replyTo: '大宝哥',
          content: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。',
          time: '1小时前',
          likes: 0,
          liked: false
        }
      ]
    },
    {
      id: '2',
      author: '小叶子',
      avatar: '👨',
      content: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。',
      time: '2025-09-15',
      likes: 230,
      liked: true
    },
    {
      id: '3',
      author: '小叶子',
      avatar: '👤',
      content: '银行提升客户满意度是一项核心战略，需从数字化体验与人性化服务双管齐下。',
      time: '1小时前',
      likes: 0,
      liked: false
    }
  ],
  '2': [
    {
      id: '1',
      author: '张三',
      avatar: '👨',
      content: '这个问题我也遇到过，建议先看看官方文档。',
      time: '1小时前',
      likes: 12,
      liked: false
    }
  ],
  '3': [
    {
      id: '1',
      author: '用户A',
      avatar: '👤',
      content: '确实需要改进，支持你的建议！',
      time: '30分钟前',
      likes: 8,
      liked: false
    },
    {
      id: '2',
      author: '用户B',
      avatar: '👨',
      content: '我也有同样的感受，希望能尽快优化。',
      time: '1小时前',
      likes: 15,
      liked: true
    }
  ]
}

// 根据帖子 ID 获取评论列表
export const getCommentsByPostId = (postId: string): Comment[] => {
  return mockComments[postId] || []
}

