import Cookies from 'js-cookie'

const TokenKey = 'User-Token'

export function isValidJwt(token) {
  if (!token || typeof token !== 'string') return false
  return token.split('.').length === 3
}

export function getToken() {
  const token = Cookies.get(TokenKey)
  if (token && !isValidJwt(token)) {
    Cookies.remove(TokenKey)
    return null
  }
  return token
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
