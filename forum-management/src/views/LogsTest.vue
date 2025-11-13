<template>
  <div class="test-page">
    <h2>操作记录 API 测试页面</h2>
    
    <div class="test-section">
      <el-button type="primary" @click="testApi" :loading="loading">
        测试 API 调用
      </el-button>
      
      <div v-if="result" class="result">
        <h3>响应结果：</h3>
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      
      <div v-if="error" class="error">
        <h3>错误信息：</h3>
        <pre>{{ error }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getLogsList } from '@/api/logs'

const loading = ref(false)
const result = ref(null)
const error = ref(null)

const testApi = async () => {
  console.log('开始测试 API 调用')
  loading.value = true
  result.value = null
  error.value = null
  
  try {
    const params = {
      page: 1,
      page_size: 10
    }
    console.log('请求参数:', params)
    
    const res = await getLogsList(params)
    console.log('API 响应:', res)
    
    result.value = res
  } catch (err) {
    console.error('API 错误:', err)
    error.value = err.message || JSON.stringify(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-page {
  padding: 24px;
}

.test-section {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
}

.result, .error {
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.error {
  background: #ffebee;
  color: #c62828;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>



