import request from '@/utils/request'

export function adminLogin(payload) {
  return request({
    url: '/admin/login',
    method: 'post',
    data: payload
  })
}


