import request from '@/utils/request'

/**
 * 获取 Dashboard 数据
 * @param {Object} params - 查询参数
 * @param {string} params.start_time - 开始时间 (可选)
 * @param {string} params.end_time - 结束时间 (可选)
 */
export function getDashboardData(params) {
  return request({
    url: '/admin/dashboard',
    method: 'get',
    params
  })
}


