import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  username: string
  avatar: string
  email: string
  points: number
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLogin = ref(false)

  const setUser = (userData: User) => {
    user.value = userData
    isLogin.value = true
  }

  const logout = () => {
    user.value = null
    isLogin.value = false
  }

  return {
    user,
    isLogin,
    setUser,
    logout
  }
})

