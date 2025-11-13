import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserProfile, type UserProfile } from '../api/user'

export const useUserStore = defineStore('user', () => {
  const userProfile = ref<UserProfile | null>(null)
  const isLogin = ref(false)
  const loading = ref(false)

  // 从 localStorage 加载用户信息
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('userProfile')
      if (stored) {
        userProfile.value = JSON.parse(stored)
        isLogin.value = true
      }
    } catch (error) {
      console.error('从 localStorage 加载用户信息失败:', error)
    }
  }

  // 保存到 localStorage
  const saveToStorage = () => {
    if (userProfile.value) {
      try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile.value))
      } catch (error) {
        console.error('保存用户信息到 localStorage 失败:', error)
      }
    }
  }

  // 获取用户信息（从服务器）
  const fetchUserProfile = async (forceRefresh = false) => {
    // 如果已经有数据且不是强制刷新，直接返回
    if (userProfile.value && !forceRefresh) {
      return userProfile.value
    }

    // 如果正在加载中，等待加载完成
    if (loading.value) {
      return new Promise((resolve) => {
        const checkLoading = setInterval(() => {
          if (!loading.value) {
            clearInterval(checkLoading)
            resolve(userProfile.value)
          }
        }, 100)
      })
    }

    try {
      loading.value = true
      const res = await getUserProfile()
      if (res.code === 200) {
        userProfile.value = res.data
        isLogin.value = true
        saveToStorage()
        return res.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 设置用户信息
  const setUser = (userData: UserProfile) => {
    userProfile.value = userData
    isLogin.value = true
    saveToStorage()
  }

  // 登出
  const logout = () => {
    userProfile.value = null
    isLogin.value = false
    localStorage.removeItem('userProfile')
  }

  // 初始化时从 localStorage 加载
  loadFromStorage()

  return {
    userProfile,
    isLogin,
    loading,
    fetchUserProfile,
    setUser,
    logout
  }
})

