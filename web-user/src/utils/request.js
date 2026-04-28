import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken, isValidJwt } from '@/utils/auth'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

const publicPaths = [
  '/',
  '/category',
  '/search',
  '/login',
  '/register'
]

function isPublicPath(path) {
  if (publicPaths.includes(path)) return true
  if (path.startsWith('/content/')) return true
  return false
}

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

service.interceptors.request.use(config => {
  const isToken = (config.headers || {}).isToken === false
  const token = getToken()
  if (token && !isToken) {
    if (isValidJwt(token)) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
  }
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  return config
}, error => {
  Promise.reject(error)
})

service.interceptors.response.use(res => {
  const code = res.data.code || 200
  const msg = res.data.msg || '未知错误'
  if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
    return res.data
  }
  if (code === 401) {
    removeToken()
    localStorage.removeItem('userInfo')
    if (!isPublicPath(window.location.pathname)) {
      ElMessage.error('登录已过期，请重新登录')
      setTimeout(() => {
        location.href = '/login'
      }, 1500)
    }
    return Promise.reject('登录已过期')
  } else if (code === 500) {
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  } else if (code !== 200) {
    ElMessage.error(msg)
    return Promise.reject('error')
  }
  return Promise.resolve(res.data)
}, error => {
  let message = error.message
  if (message === 'Network Error') {
    message = '后端接口连接异常'
  } else if (message.includes('timeout')) {
    message = '系统接口请求超时'
  } else if (message.includes('Request failed with status code')) {
    const statusCode = message.slice(-3)
    if (statusCode === '401') {
      removeToken()
      localStorage.removeItem('userInfo')
      if (!isPublicPath(window.location.pathname)) {
        location.href = '/login'
      }
      return Promise.reject('登录已过期')
    }
    message = '系统接口' + statusCode + '异常'
  }
  ElMessage.error(message)
  return Promise.reject(error)
})

export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && value !== '' && typeof (value) !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof (value[key]) !== 'undefined') {
            const params = propName + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

export default service
