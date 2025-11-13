import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const activeTab = ref('home')

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setActiveTab = (tab: string) => {
    activeTab.value = tab
  }

  return {
    loading,
    activeTab,
    setLoading,
    setActiveTab
  }
})

