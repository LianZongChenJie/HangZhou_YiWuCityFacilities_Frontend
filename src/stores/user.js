import { defineStore } from 'pinia'
import { mockUsers } from '@/mock/users'
import { HOME_PATH } from '@/utils/constants'

const KEY = 'yw-fee-user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null
  }),
  getters: {
    role: (s) => s.user?.role || '',
    displayName: (s) => s.user?.name || '',
    username: (s) => s.user?.username || ''
  },
  actions: {
    restore() {
      try {
        const raw = sessionStorage.getItem(KEY)
        if (raw) {
          const data = JSON.parse(raw)
          this.token = data.token
          this.user = data.user
        }
      } catch {
        this.token = ''
        this.user = null
      }
    },
    login({ username, password, role }) {
      const found = mockUsers.find((u) => {
        if (role) return u.role === role && u.enabled
        return u.username === username && u.password === password && u.enabled
      })
      if (!found) return { ok: false, message: '账号或密码错误' }
      this.token = 'mock-token'
      this.user = { ...found }
      sessionStorage.setItem(KEY, JSON.stringify({ token: this.token, user: this.user }))
      return { ok: true, path: HOME_PATH[found.role] }
    },
    switchRole(role) {
      return this.login({ role })
    },
    logout() {
      this.token = ''
      this.user = null
      sessionStorage.removeItem(KEY)
    }
  }
})
