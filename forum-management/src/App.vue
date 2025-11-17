<template>
  <div class="app-container">
    <Layout />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Layout from './components/Layout.vue'
import { refreshGwSession } from './utils/request'

// 应用初始化时处理 URL 中的 session 参数
onMounted(() => {
  // 检查 URL 中是否有 session 参数
  const urlParams = new URLSearchParams(window.location.search)
  const sessionFromUrl = urlParams.get('session')
  
  if (sessionFromUrl) {
    // 如果 URL 中有 session 参数，刷新 GW_SESSION
    refreshGwSession()
    console.log('从 URL 获取到 session 参数，已更新 GW_SESSION')
  }
})
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
}
</style>
