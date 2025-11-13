import request from '@/utils/request'

/**
 * 获取操作日志列表
 * @param {Object} params - 查询参数
 * @param {string} params.user_code - 用户工号 (可选)
 * @param {string} params.operation_type - 操作类型 (可选)
 * @param {string} params.start_time - 开始时间 (可选)
 * @param {string} params.end_time - 结束时间 (可选)
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页大小
 */
export function getLogsList(params) {
  return request({
    url: '/admin/logs/list',
    method: 'get',
    params
  })
}

/**
 * 查看操作记录详情
 * @param {number} logId - 日志ID
 */
export function getLogDetail(logId) {
  return request({
    url: `/api/admin/logs/${logId}`,
    method: 'get'
  })
}


