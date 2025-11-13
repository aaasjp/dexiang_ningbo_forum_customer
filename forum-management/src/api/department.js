import request from '@/utils/request'

/**
 * 查询部门组织和人员
 * @param {Object} params - 查询参数
 * @param {number} params.dept_id - 部门ID (可选)
 * @param {boolean} params.include_children - 是否包括子部门 (可选, 默认true)
 */
export function getDepartmentTree(params) {
  return request({
    url: '/department/tree',
    method: 'get',
    params
  })
}


