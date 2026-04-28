import request from '@/utils/request'

export function getCacheStats() {
  return request({
    url: '/content/cache/stats',
    method: 'get'
  })
}

export function clearAllCache() {
  return request({
    url: '/content/cache/clear',
    method: 'delete'
  })
}

export function clearDetailCache() {
  return request({
    url: '/content/cache/clear/detail',
    method: 'delete'
  })
}

export function clearListCache() {
  return request({
    url: '/content/cache/clear/list',
    method: 'delete'
  })
}

export function clearSearchCache() {
  return request({
    url: '/content/cache/clear/search',
    method: 'delete'
  })
}

export function clearCategoryCache() {
  return request({
    url: '/content/cache/clear/category',
    method: 'delete'
  })
}
