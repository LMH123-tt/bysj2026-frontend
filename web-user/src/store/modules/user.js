import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/login'
import { getToken, setToken, removeToken, isValidJwt } from '@/utils/auth'

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    id: '',
    name: '',
    nickName: '',
    avatar: '',
    roles: [],
    permissions: []
  }),
  actions: {
    login(userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        loginApi(username, password, code, uuid).then(res => {
          const data = res.data || res
          const token = data.access_token || data.token
          if (token && isValidJwt(token)) {
            setToken(token)
            this.token = token
          } else {
            reject(new Error('登录返回的令牌格式无效'))
            return
          }
          this.id = data.userid || data.userId
          this.name = data.username || data.userName
          this.nickName = data.nickName || ''
          this.avatar = data.avatar || ''
          this.roles = ['ROLE_DEFAULT']
          this.permissions = []
          localStorage.setItem('userInfo', JSON.stringify({
            userId: data.userid || data.userId,
            userName: data.username || data.userName,
            nickName: data.nickName || '',
            avatar: data.avatar || ''
          }))
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    restoreUser() {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo)
          this.id = user.userId
          this.name = user.userName
          this.nickName = user.nickName
          this.avatar = user.avatar || ''
          this.roles = ['ROLE_DEFAULT']
          this.permissions = []
        } catch (e) {
          console.error('Failed to restore user:', e)
        }
      }
    },
    logOut() {
      return new Promise(resolve => {
        this.token = ''
        this.roles = []
        this.permissions = []
        removeToken()
        localStorage.removeItem('userInfo')
        resolve()
      })
    }
  }
})

export default useUserStore
