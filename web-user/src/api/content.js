import request from '@/utils/request'

export function listContent(query) {
  return request({
    url: '/content/info/published',
    method: 'get',
    params: query
  })
}

export function listRecommend(query) {
  return request({
    url: '/content/info/recommended',
    method: 'get',
    params: query
  })
}

export function getContent(contentId) {
  return request({
    url: '/content/info/view/' + contentId,
    method: 'get'
  })
}

export function listCategory() {
  return request({
    url: '/content/category/enabled',
    method: 'get'
  })
}

export function listContentByCategory(categoryId, query) {
  return request({
    url: '/content/info/published',
    method: 'get',
    params: { categoryId: categoryId, ...query }
  })
}

export function searchContent(keyword, query) {
  return request({
    url: '/content/info/search',
    method: 'get',
    params: { keyword, ...query }
  })
}

export function getHotContent(limit) {
  return request({
    url: '/content/info/hot',
    method: 'get',
    params: { limit }
  })
}

export function getLatestContent(limit) {
  return request({
    url: '/content/info/latest',
    method: 'get',
    params: { limit }
  })
}

export function getPersonalizedContent(limit) {
  return request({
    url: '/content/info/personalized',
    method: 'get',
    params: { limit }
  })
}

export function getRanking(categoryId, period, limit) {
  return request({
    url: '/content/info/ranking',
    method: 'get',
    params: { categoryId, period, limit }
  })
}

export function getRelatedContent(contentId, limit) {
  return request({
    url: '/content/info/related/' + contentId,
    method: 'get',
    params: { limit }
  })
}

export function shareContent(contentId) {
  return request({
    url: '/content/info/share/' + contentId,
    method: 'post'
  })
}

export function getViewHistory(params) {
  return request({
    url: '/content/user/history',
    method: 'get',
    params: params
  })
}

export function searchUsers(keyword) {
  return request({
    url: '/content/user/search',
    method: 'get',
    params: { keyword }
  })
}

export function getFriendList(status) {
  return request({ url: '/content/social/friend/list', method: 'get', params: { status } })
}

export function getFriendRequests() {
  return request({ url: '/content/social/friend/requests', method: 'get' })
}

export function addFriend(friendId) {
  return request({ url: '/content/social/friend/add', method: 'post', data: { friendId } })
}

export function acceptFriend(friendId) {
  return request({ url: '/content/social/friend/accept/' + friendId, method: 'put' })
}

export function deleteFriend(friendId) {
  return request({ url: '/content/social/friend/' + friendId, method: 'delete' })
}

export function getUnreadFriendCount() {
  return request({ url: '/content/social/friend/unread', method: 'get' })
}

export function getMessageList(friendId) {
  return request({ url: '/content/social/message/list/' + friendId, method: 'get' })
}

export function getRecentChats() {
  return request({ url: '/content/social/message/recent', method: 'get' })
}

export function sendMessage(receiverId, content) {
  return request({ url: '/content/social/message/send', method: 'post', data: { receiverId, content } })
}

export function getUnreadMessageCount() {
  return request({ url: '/content/social/message/unread', method: 'get' })
}

export function favoriteContent(contentId) {
  return request({
    url: '/content/favorite',
    method: 'post',
    data: { contentId: contentId }
  })
}

export function cancelFavorite(contentId) {
  return request({
    url: '/content/favorite/cancel',
    method: 'delete',
    params: { contentId: contentId }
  })
}

export function checkFavorite(contentId) {
  return request({
    url: '/content/favorite/check',
    method: 'get',
    params: { contentId: contentId }
  })
}

export function listFavorites(query) {
  return request({
    url: '/content/favorite/my',
    method: 'get',
    params: query
  })
}

export function likeContent(contentId) {
  return request({
    url: '/content/info/like/' + contentId,
    method: 'post'
  })
}

export function checkLike(contentId) {
  return request({
    url: '/content/info/like/check/' + contentId,
    method: 'get'
  })
}

export function getCommentList(params) {
  return request({
    url: '/content/comment/list',
    method: 'get',
    params: params
  })
}

export function addComment(data) {
  return request({
    url: '/content/comment',
    method: 'post',
    data: data
  })
}

export function publishContent(data) {
  return request({
    url: '/content/info/publish',
    method: 'post',
    data: data
  })
}

export function myContentList(query) {
  return request({
    url: '/content/info/my',
    method: 'get',
    params: query
  })
}

export function userUpdateContent(data) {
  return request({
    url: '/content/info/user/update',
    method: 'put',
    data: data
  })
}

export function userDeleteContent(contentId) {
  return request({
    url: '/content/info/user/' + contentId,
    method: 'delete'
  })
}

export function getNotificationList() {
  return request({ url: '/content/notification/list', method: 'get' })
}

export function getUnreadNotificationCount() {
  return request({ url: '/content/notification/unread', method: 'get' })
}

export function markNotificationRead(id) {
  return request({ url: '/content/notification/read/' + id, method: 'put' })
}

export function markAllNotificationRead() {
  return request({ url: '/content/notification/readAll', method: 'put' })
}

export function deleteNotification(id) {
  return request({ url: '/content/notification/' + id, method: 'delete' })
}

export function getHotTags() {
  return request({ url: '/content/info/tags', method: 'get' })
}

export function getUserProfile(userId) {
  return request({ url: '/content/user/profile/' + userId, method: 'get' })
}

export function getUserContent(userId, query) {
  return request({ url: '/content/info/user-content/' + userId, method: 'get', params: query })
}
