import request from '@/utils/request'

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.dept_id - 部门ID (可选)
 * @param {string} params.forum_tag - 论坛标签/角色 (可选)
 * @param {string} params.keyword - 关键词 (可选)
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页大小
 */
export function getUsersList(params) {
  return request({
    url: '/admin/staffs/list',
    method: 'get',
    params
  })
}

/**
 * 更新用户禁用状态
 * @param {string} staffCode - 员工工号
 * @param {number} isForbidden - 是否禁用 (0取消禁用, 1禁用)
 */
export function updateForbiddenStatus(staffCode, isForbidden) {
  return request({
    url: `/admin/staffs/forbidden/${staffCode}`,
    method: 'put',
    params: { is_forbidden: isForbidden }
  })
}

/**
 * 更新部门管理员状态
 * @param {string} staffCode - 员工工号
 * @param {number} deptId - 部门ID
 * @param {number} status - 状态 (0取消权限, 1恢复权限)
 */
export function updateDeptAdminStatus(staffCode, deptId, status) {
  return request({
    url: `/admin/dept-admins/status/${staffCode}`,
    method: 'put',
    params: { 
      dept_id: deptId,
      status: status 
    }
  })
}

/**
 * 调整员工积分
 * @param {string} staffCode - 员工工号
 * @param {number} currentPoints - 当前积分
 * @param {number} newPoints - 调整后的积分
 */
export function adjustStaffPoints(staffCode, currentPoints, newPoints) {
  return request({
    url: `/admin/staffs/points/${staffCode}`,
    method: 'put',
    params: {
      current_points: currentPoints,
      new_points: newPoints
    }
  })
}

/**
 * 修改用户标签（角色）- 只有超级管理员可以操作
 * @param {string} staffCode - 员工工号
 * @param {number} tagId - 标签ID
 */
export function updateForumTag(staffCode, tagId) {
  return request({
    url: `/admin/staffs/forum-tag/${staffCode}`,
    method: 'put',
    params: { tag_id: tagId }
  })
}

/**
 * 取消/恢复用户虚拟角色（小助手）
 * @param {string} staffCode - 员工工号
 * @param {number} status - 状态 (0取消虚拟角色, 1恢复虚拟角色)
 * @param {number} deptId - 部门ID (可选)
 */
export function updateVirtualRole(staffCode, status, deptId) {
  const params = { status }
  if (deptId) {
    params.dept_id = deptId
  }
  return request({
    url: `/admin/staffs/virtual-role/${staffCode}`,
    method: 'put',
    params
  })
}

/**
 * 取消/恢复超级管理员权限（只有超级管理员可以操作）
 * @param {string} staffCode - 员工工号
 * @param {number} status - 状态 (0取消权限, 1恢复权限)
 */
export function updateSuperAdminStatus(staffCode, status) {
  return request({
    url: `/admin/super-admins/status/${staffCode}`,
    method: 'put',
    params: { status }
  })
}

/**
 * 获取当前用户信息
 */
export function getCurrentUserProfile() {
  return request({
    url: '/user/profile',
    method: 'get'
  })
}

/**
 * 获取用户标签列表
 * @param {Object} params - 查询参数
 * @param {number} params.status - 状态筛选 (可选)
 */
export function getUserTagsList(params) {
  return request({
    url: '/admin/user-tags/list',
    method: 'get',
    params
  })
}

/**
 * 创建用户标签
 * @param {Object} params - 标签参数
 * @param {string} params.tag_name - 标签名称
 * @param {string} params.tag_description - 标签描述 (可选)
 * @param {number} params.sort_order - 排序 (可选，默认0)
 * @param {number} params.status - 状态 (可选，默认1)
 */
export function createUserTag(params) {
  return request({
    url: '/admin/user-tags/create',
    method: 'post',
    params
  })
}

/**
 * 删除用户标签
 * @param {number} tagId - 标签ID
 */
export function deleteUserTag(tagId) {
  return request({
    url: `/admin/user-tags/delete/${tagId}`,
    method: 'delete'
  })
}

/**
 * 批量更新用户标签
 * @param {Array} tags - 标签数组，每个标签包含：
 *   - tag_id: 标签ID（新增时为null）
 *   - tag_name: 标签名称
 *   - operation: 操作方式（create新增，update更新，delete删除）
 */
export function batchUpdateUserTags(tags) {
  return request({
    url: '/admin/user-tags/batch-update',
    method: 'put',
    data: { tags }
  })
}

