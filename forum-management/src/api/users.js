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
 * 修改用户标签（角色）
 * @param {string} staffCode - 员工工号
 * @param {string} forumTag - 新的标签值（如 '普通用户'、'专家'）
 */
export function updateForumTag(staffCode, forumTag) {
  return request({
    url: `/admin/staffs/forum-tag/${staffCode}`,
    method: 'put',
    params: { forum_tag: forumTag }
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

