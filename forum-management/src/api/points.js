import request from '@/utils/request'

/**
 * 获取奖励规则列表
 * @param {Object} params - 查询参数
 * @param {number} params.status - 状态 (可选)
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页大小
 */
export function getRewardRulesList(params) {
  return request({
    url: '/admin/reward-rules/list',
    method: 'get',
    params
  })
}

/**
 * 创建奖励规则
 * @param {Object} data - 规则数据
 * @param {string} data.rule_name - 规则名称
 * @param {string} data.rule_code - 规则代码
 * @param {number} data.points - 积分
 * @param {string} data.rule_description - 规则描述
 * @param {Object} data.conditions - 条件 (可选)
 */
export function createRewardRule(data) {
  return request({
    url: '/admin/reward-rules/create',
    method: 'post',
    data
  })
}

/**
 * 更新奖励规则
 * @param {number} ruleId - 规则ID
 * @param {Object} data - 规则数据
 * @param {number} data.points - 积分
 * @param {string} data.rule_description - 规则描述
 */
export function updateRewardRule(ruleId, data) {
  return request({
    url: `/api/admin/reward-rules/update/${ruleId}`,
    method: 'put',
    data
  })
}

/**
 * 删除奖励规则
 * @param {number} ruleId - 规则ID
 */
export function deleteRewardRule(ruleId) {
  return request({
    url: `/api/admin/reward-rules/delete/${ruleId}`,
    method: 'delete'
  })
}


