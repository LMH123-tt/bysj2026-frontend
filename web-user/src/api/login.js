import request from '@/utils/request'

export function login(username, password, code, uuid) {
  return request({
    url: '/content/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: { username, password, code, uuid }
  })
}

export function register(data) {
  return request({
    url: '/content/user/register',
    headers: { isToken: false },
    method: 'post',
    data: data
  })
}

export function getCodeImg() {
  return request({
    url: '/code',
    headers: { isToken: false },
    method: 'get',
    timeout: 20000
  })
}
