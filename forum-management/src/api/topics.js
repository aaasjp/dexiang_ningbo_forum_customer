import request from '@/utils/request'

/**
 * 获取话题列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页大小
 */
export function getTopicsList(params) {
  return request({
    url: '/topics/list',
    method: 'get',
    params
  })
}

/**
 * 创建话题
 * @param {Object} data - 话题数据
 * @param {string} data.title - 话题标题
 * @param {string} data.description - 话题描述
 * @param {string} data.cover_image - 封面图片
 */
export function createTopic(data) {
  return request({
    url: '/admin/topics/create',
    method: 'post',
    data
  })
}

/**
 * 更新话题
 * @param {number} topicId - 话题ID
 * @param {Object} data - 话题数据
 * @param {string} data.title - 话题标题 (可选)
 * @param {string} data.description - 话题描述 (可选)
 * @param {string} data.cover_image - 封面图片 (可选)
 * @param {number} data.status - 状态 (可选)
 */
export function updateTopic(topicId, data) {
  return request({
    url: `/admin/topics/update/${topicId}`,
    method: 'put',
    data
  })
}

/**
 * 获取话题详情
 * @param {number} topicId - 话题ID
 */
export function getTopicDetail(topicId) {
  return request({
    url: `/topics/detail/${topicId}`,
    method: 'get'
  })
}

/**
 * 获取话题下的问题列表
 * @param {number} topicId - 话题ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页大小
 */
export function getTopicQuestions(topicId, params) {
  return request({
    url: `/topics/questions/list/${topicId}`,
    method: 'get',
    params
  })
}

/**
 * 删除话题（逻辑删除）
 * @param {number} topicId - 话题ID
 */
export function deleteTopic(topicId) {
  return request({
    url: `/admin/topics/delete/${topicId}`,
    method: 'delete'
  })
}


