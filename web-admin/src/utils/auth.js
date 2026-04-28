import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const ExpiresInKey = 'Admin-Expires-In'

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
  Cookies.remove(TokenKey)
  Cookies.remove(ExpiresInKey)
}

export function getExpiresIn() {
  return Cookies.get(ExpiresInKey) || -1
}

export function setExpiresIn(time) {
  return Cookies.set(ExpiresInKey, time)
}

export function removeExpiresIn() {
  return Cookies.remove(ExpiresInKey)
}
