<template>
  <div class="questions-page">
    <div class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>我的提问</h1>
    </div>
    <div class="content">
      <div class="question-item" v-for="i in 15" :key="i">
        <h3>我的问题标题 {{ i }}</h3>
        <p>问题的详细描述内容...</p>
        <div class="question-meta">
          <span>{{ i * 10 }} 浏览</span>
          <span>{{ i * 2 }} 回答</span>
          <span>{{ i }}小时前</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.questions-page {
  width: 100%;
  background: #ffffff;
}

.header {
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #1890ff;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.content {
  padding: 10px;
}

.question-item {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.question-item h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.question-item p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.question-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}
</style>
