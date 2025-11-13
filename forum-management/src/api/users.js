import request from '@/utils/request'

/**
 * 获取用户列表（管理端）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {number} params.dept_id - 部门ID (可选)
 * @param {string} params.forum_tag - 论坛角色标签 (可选)
 * @param {string} params.keyword - 搜索关键词（工号或姓名）(可选)
 * @see API文档 9.13 用户列表
 */
export function getUsersList(params) {
  return request({
    url: '/admin/staffs/list',
    method: 'get',
    params
  })
}

/**
 * 禁用/取消禁用员工（仅超级管理员）
 * @param {string} staffCode - 员工工号
 * @param {number} isForbidden - 是否禁用（0-取消禁用，1-禁用）
 * @see API文档 9.19 禁用/取消禁用员工
 */
export function updateForbiddenStatus(staffCode, isForbidden) {
  return request({
    url: `/admin/staffs/forbidden/${staffCode}`,
    method: 'put',
    params: {
      is_forbidden: isForbidden
    }
  })
}

/**
 * 取消/恢复部门管理员权限（仅超级管理员）
 * @param {string} staffCode - 员工工号
 * @param {number} deptId - 部门ID
 * @param {number} status - 状态（0-取消权限，1-恢复权限）
 * @see API文档 9.20 取消/恢复部门管理员权限
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
 * 调整员工积分（仅超级管理员）
 * @param {string} staffCode - 员工工号
 * @param {number} currentPoints - 当前积分
 * @param {number} newPoints - 调整后的积分
 * @see API文档 9.22 调整员工积分
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
 * 修改员工论坛标签（角色）
 * @param {string} staffCode - 员工工号
 * @param {string} forumTag - 论坛标签（普通用户/专家/管理员）
 */
export function updateForumTag(staffCode, forumTag) {
  return request({
    url: `/admin/staffs/forum-tag/${staffCode}`,
    method: 'put',
    params: {
      forum_tag: forumTag
    }
  })
}

