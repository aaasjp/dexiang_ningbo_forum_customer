<template>
  <div class="profile-home-page">
    <div class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>个人主页</h1>
    </div>
    <div class="user-card">
      <div class="avatar">👤</div>
      <h2>用户昵称</h2>
      <p>这是我的个性签名</p>
      <div class="stats">
        <div class="stat-item">
          <div class="value">128</div>
          <div class="label">关注</div>
        </div>
        <div class="stat-item">
          <div class="value">256</div>
          <div class="label">粉丝</div>
        </div>
        <div class="stat-item">
          <div class="value">1024</div>
          <div class="label">获赞</div>
        </div>
      </div>
      <button class="follow-btn" v-if="isOthers">+ 关注</button>
    </div>
    <div class="tabs">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'posts' }"
        @click="activeTab = 'posts'"
      >
        帖子
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'replies' }"
        @click="activeTab = 'replies'"
      >
        回复
      </div>
    </div>
    <div class="content">
      <div v-if="activeTab === 'posts'" class="post-list">
        <div class="post-item" v-for="i in 10" :key="i">
          <h3>帖子标题 {{ i }}</h3>
          <p>帖子内容简介...</p>
          <div class="post-meta">
            <span>100 浏览</span>
            <span>10 评论</span>
          </div>
        </div>
      </div>
      <div v-else class="reply-list">
        <div class="reply-item" v-for="i in 8" :key="i">
          <div class="reply-content">回复内容 {{ i }}</div>
          <div class="reply-meta">
            <span>回复了帖子：帖子标题</span>
            <span>{{ i }}小时前</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeTab = ref<'posts' | 'replies'>('posts')

// 判断是否是查看他人主页
const isOthers = computed(() => {
  return route.params.id !== undefined
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.profile-home-page {
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

.user-card {
  background: #fff;
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #e5e5e5;
}

.avatar {
  font-size: 80px;
  margin-bottom: 15px;
}

.user-card h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.user-card > p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-item .label {
  font-size: 13px;
  color: #666;
}

.follow-btn {
  padding: 10px 40px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  position: relative;
  color: #666;
}

.tab-item.active {
  color: #1890ff;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background: #1890ff;
  border-radius: 2px;
}

.content {
  padding: 10px;
}

.post-item,
.reply-item {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
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
}

.post-meta,
.reply-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.reply-content {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.6;
}

.reply-meta {
  justify-content: space-between;
}
</style>
