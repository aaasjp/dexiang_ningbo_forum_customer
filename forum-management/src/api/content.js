import request from '@/utils/request'

/**
 * 获取问题列表 (管理端)
 * @param {Object} params - 查询参数
 * @param {string} params.category - 问题分类 (可选)
 * @param {number} params.status - 状态 (可选)
 * @param {number} params.dept_id - 部门ID (可选)
 * @param {string} params.keyword - 关键词 (可选)
 * @param {string} params.start_time - 开始时间 (可选)
 * @param {string} params.end_time - 结束时间 (可选)
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页大小
 */
export function getQuestionsList(params) {
  return request({
    url: '/admin/questions/list',
    method: 'get',
    params
  })
}

/**
 * 标记精选
 * @param {number} questionId - 问题ID
 * @param {number} isFeatured - 是否精选 (0否, 1是)
 */
export function markFeatured(questionId, isFeatured) {
  return request({
    url: `/admin/questions/mark-featured/${questionId}`,
    method: 'put',
    params: { is_featured: isFeatured }
  })
}

/**
 * 删除问题
 * @param {number} questionId - 问题ID
 */
export function deleteQuestion(questionId) {
  return request({
    url: `/admin/questions/delete/${questionId}`,
    method: 'delete'
  })
}

/**
 * 问题下线/上线
 * @param {number} questionId - 问题ID
 * @param {number} isOffline - 是否下线 (0上线, 1下线)
 */
export function updateOfflineStatus(questionId, isOffline) {
  return request({
    url: `/admin/questions/offline/${questionId}`,
    method: 'put',
    params: { is_offline: isOffline }
  })
}

/**
 * 人力转办
 * @param {number} questionId - 问题ID
 * @param {Object} data - 转办数据
 * @param {Array<number>} data.dept_ids - 部门ID列表
 * @param {Array<number>} data.topic_ids - 话题ID列表
 */
export function transferQuestion(questionId, data) {
  return request({
    url: `/admin/questions/transfer/${questionId}`,
    method: 'post',
    data
  })
}

/**
 * 删除回答
 * @param {number} answerId - 回答ID
 */
export function deleteAnswer(answerId) {
  return request({
    url: `/admin/answers/delete/${answerId}`,
    method: 'delete'
  })
}


