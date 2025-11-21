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
 * 获取问题详情 (管理端)
 * @param {number} questionId - 问题ID
 */
export function getQuestionDetail(questionId) {
  return request({
    url: `/admin/questions/detail/${questionId}`,
    method: 'get'
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

/**
 * 更换问题关联的话题
 * @param {number} questionId - 问题ID
 * @param {Array<number>} topicIds - 新的话题ID列表（可以为空列表，表示移除所有话题）
 */
export function updateQuestionTopics(questionId, topicIds) {
  return request({
    url: `/admin/questions/update-topics/${questionId}`,
    method: 'put',
    data: topicIds
  })
}

/**
 * 导出问题列表 (CSV格式)
 * @param {Object} params - 查询参数
 * @param {string} params.category - 问题分类 (可选)
 * @param {number} params.status - 状态 (可选)
 * @param {number} params.dept_id - 部门ID (可选)
 * @param {string} params.keyword - 关键词 (可选)
 * @param {string} params.start_time - 开始时间 (可选)
 * @param {string} params.end_time - 结束时间 (可选)
 */
export function exportQuestions(params) {
  return request({
    url: '/admin/questions/export',
    method: 'get',
    params,
    responseType: 'blob' // 设置响应类型为blob以便下载文件
  })
}

/**
 * 取消/恢复问题违规标记
 * @param {number} questionId - 问题ID
 * @param {number} isIllegal - 是否违规 (0取消违规标记, 1标记为违规)
 */
export function toggleInappropriate(questionId, isIllegal) {
  return request({
    url: `/admin/questions/toggle-illegal/${questionId}`,
    method: 'put',
    params: { is_illegal: isIllegal }
  })
}

/**
 * 获取问题的回答列表 (管理端)
 * @param {number} questionId - 问题ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码 (默认1)
 * @param {number} params.page_size - 每页大小 (默认50)
 */
export function getAnswersList(questionId, params) {
  return request({
    url: `/admin/answers/list/question/${questionId}`,
    method: 'get',
    params
  })
}

/**
 * 删除回答 (管理端)
 * @param {number} answerId - 回答ID
 */
export function deleteAnswerById(answerId) {
  return request({
    url: `/admin/answers/delete/${answerId}`,
    method: 'delete'
  })
}

/**
 * 导出问题的回答列表 (CSV格式)
 * @param {number} questionId - 问题ID
 */
export function exportAnswers(questionId) {
  return request({
    url: `/admin/answers/export/question/${questionId}`,
    method: 'get',
    responseType: 'blob' // 设置响应类型为blob以便下载文件
  })
}


