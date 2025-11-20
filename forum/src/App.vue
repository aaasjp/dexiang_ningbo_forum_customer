<template>
  <div class="app-container">
    <Layout>
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Home', 'Topic', 'Message', 'Profile']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </Layout>
    <ImageViewer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Layout from './components/layout/Layout.vue'
import ImageViewer from './components/common/ImageViewer.vue'
import { useUserStore } from './stores/user'
import { refreshMockSession } from './api/request'

const userStore = useUserStore()

// 应用初始化时获取用户信息
onMounted(async () => {
  try {
    // 检查 URL 中是否有 session 参数
    const urlParams = new URLSearchParams(window.location.search)
    const sessionFromUrl = urlParams.get('session')
    
    if (sessionFromUrl) {
      // 如果 URL 中有 session 参数，刷新 MOCK_SESSION
      refreshMockSession()
      console.log('从 URL 获取到 session 参数，已更新 MOCK_SESSION')
    }
    
    // 不管 localStorage 中有没有用户信息，都强制从服务器重新获取
    await userStore.fetchUserProfile(true)
    console.log('用户信息已更新到 localStorage')
  } catch (error) {
    console.error('初始化用户信息失败:', error)
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #e5e5e5;
}

#app,
.app-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  position: relative;
  /* 移除 min-height: 100vh，让内容自然撑开高度 */
}
</style>
