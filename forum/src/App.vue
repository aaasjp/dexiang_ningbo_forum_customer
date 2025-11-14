<template>
  <div id="app">
    <Layout>
      <router-view />
    </Layout>
    <ImageViewer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Layout from './components/layout/Layout.vue'
import ImageViewer from './components/common/ImageViewer.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

// 应用初始化时获取用户信息
onMounted(async () => {
  try {
    // 如果 localStorage 中没有用户信息，或者需要刷新，则从服务器获取
    if (!userStore.userProfile) {
      await userStore.fetchUserProfile()
    }
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

#app {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  position: relative;
}
</style>
