<template>
  <div class="post-list-page">
    <div class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>帖子列表</h1>
      <button class="create-btn" @click="goToCreate">发布</button>
    </div>
    <div class="filter-bar">
      <select v-model="sortBy">
        <option value="latest">最新</option>
        <option value="hot">最热</option>
        <option value="recommend">推荐</option>
      </select>
      <select v-model="topicFilter">
        <option value="">全部话题</option>
        <option value="1">话题 1</option>
        <option value="2">话题 2</option>
        <option value="3">话题 3</option>
      </select>
    </div>
    <div class="content">
      <div
        class="post-item"
        v-for="i in 20"
        :key="i"
        @click="goToDetail(i)"
      >
        <div class="post-header">
          <div class="author">
            <span class="avatar">👤</span>
            <span class="username">用户名 {{ i }}</span>
          </div>
          <span class="time">{{ i }}小时前</span>
        </div>
        <h3>帖子标题 {{ i }}</h3>
        <p>这是帖子的内容简介，可以显示部分内容...</p>
        <div class="post-tags">
          <span class="tag">标签1</span>
          <span class="tag">标签2</span>
        </div>
        <div class="post-stats">
          <span>👁 {{ i * 100 }} 浏览</span>
          <span>💬 {{ i * 10 }} 评论</span>
          <span>👍 {{ i * 5 }} 点赞</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const sortBy = ref('latest')
const topicFilter = ref('')

const goBack = () => {
  router.back()
}

const goToDetail = (id: number) => {
  router.push(`/post/${id}`)
}

const goToCreate = () => {
  router.push('/post/create')
}
</script>

<style scoped>
.post-list-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn,
.create-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.back-btn {
  color: #1890ff;
}

.create-btn {
  color: #1890ff;
  font-weight: 600;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filter-bar {
  background: #fff;
  padding: 10px 20px;
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e5e5e5;
}

.filter-bar select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.content {
  padding: 10px;
}

.post-item {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  font-size: 20px;
}

.username {
  font-size: 14px;
  font-weight: 600;
}

.time {
  font-size: 12px;
  color: #999;
}

.post-item h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.post-item p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tag {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 3px;
  font-size: 12px;
  color: #666;
}

.post-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}
</style>
