import request from '@/utils/request'

export const getRouters = () => {
  return request({
    url: '/system/menu/getRouters',
    method: 'get'
  })
}

export function treeselect() {
  return request({
    url: '/system/menu/treeselect',
    method: 'get'
  })
}

export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  })
}
