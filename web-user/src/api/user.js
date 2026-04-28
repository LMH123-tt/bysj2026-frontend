import request from '@/utils/request'

export function getUserInfo() {
  return request({
    url: '/content/user/info',
    method: 'get'
  })
}

export function updateUserProfile(data) {
  return request({
    url: '/content/user/update',
    method: 'put',
    data: data
  })
}

export function updateUserPwd(oldPassword, newPassword) {
  return request({
    url: '/content/user/password',
    method: 'put',
    data: { oldPassword, newPassword }
  })
}

export function getViewHistory(params) {
  return request({
    url: '/content/user/history',
    method: 'get',
    params: params
  })
}
