import { get, post, put } from './request'

// 用户资料类型
export interface UserProfile {
  staff_code: string
  name: string
  forum_avatar?: string
  nickname?: string
  forum_tag?: string
  question_count: number
  answer_count: number
  total_points: number
  birthday?: string
  forum_gender?: number
  self_introduction?: string
  job_title?: string // 岗位
  is_followed?: boolean // 是否已关注（仅在查看他人主页时有此字段）
}

// 积分记录类型
export interface PointRecord {
  record_id: number
  points: number
  type: string
  description: string
  create_time: string
}

// 积分响应类型
export interface PointsResponse {
  total_points: number
  records: PointRecord[]
}

// 关注用户类型
export interface FollowedUser {
  staff_code: string
  name: string
  nickname?: string
  forum_avatar?: string
  forum_tag?: string
  follow_time: string
}

// 关注用户列表响应
export interface FollowedUsersResponse {
  items: FollowedUser[]
}

/**
 * 获取用户主页信息（当前用户）
 */
export function getUserProfile() {
  return get<UserProfile>('/api/user/profile')
}

/**
 * 获取他人主页信息
 * @param staffCode 用户工号
 */
export function getOtherUserProfile(staffCode: string) {
  return get<UserProfile>(`/api/user/profile/${staffCode}`)
}

/**
 * 获取用户积分记录
 */
export function getUserPoints(page = 1, pageSize = 50) {
  return get<PointsResponse>('/api/user/points', {
    page,
    page_size: pageSize
  })
}

/**
 * 关注/取消关注用户
 */
export function toggleFollowUser(targetCode: string) {
  return post<{ followed: boolean }>(`/api/user/follow/${targetCode}`)
}

/**
 * 获取我关注的用户列表
 */
export function getFollowedUsers(page = 1, pageSize = 20) {
  return get<FollowedUsersResponse>('/api/user/followed-users', {
    page,
    page_size: pageSize
  })
}

/**
 * 编辑用户资料
 */
export interface UpdateProfileData {
  nickname?: string
  birthday?: string
  forum_gender?: number
  self_introduction?: string
  forum_avatar?: string
}

export function updateUserProfile(data: UpdateProfileData) {
  return put<UserProfile>('/api/user/profile-update', data)
}

/**
 * 每日签到
 */
export interface SignInResponse {
  signed: boolean
  points: number
  message: string
}

export function signIn() {
  return post<SignInResponse>('/api/auth/sign-in')
}

/**
 * 用户列表项类型
 */
export interface UserListItem {
  staff_code: string
  name: string
  nickname?: string
  forum_avatar?: string
  forum_tag?: string
  question_count: number
  answer_count: number
  total_points: number
  follower_count: number
  is_followed: boolean
  self_introduction?: string
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  items: UserListItem[]
  total: number
}

/**
 * 获取用户列表（按被关注数量排序）
 */
export function getUserList(page = 1, pageSize = 20, keyword = '') {
  return get<UserListResponse>('/api/user/list', {
    page,
    page_size: pageSize,
    keyword
  })
}

