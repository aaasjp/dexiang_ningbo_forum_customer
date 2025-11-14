<template>
  <div class="post-create-page">
    <div class="header">
      <button class="cancel-btn" @click="goBack">取消</button>
      <h1>发布帖子</h1>
      <button class="submit-btn" @click="handleSubmit">发布</button>
    </div>
    <div class="content">
      <div class="form-group">
        <input
          type="text"
          class="title-input"
          placeholder="请输入帖子标题"
          v-model="title"
        />
      </div>
      <div class="form-group">
        <select class="topic-select" v-model="selectedTopic">
          <option value="">选择话题</option>
          <option value="1">话题 1</option>
          <option value="2">话题 2</option>
          <option value="3">话题 3</option>
        </select>
      </div>
      <div class="form-group">
        <div class="tags-input">
          <div class="tag" v-for="(tag, index) in tags" :key="index">
            {{ tag }}
            <span class="remove-tag" @click="removeTag(index)">×</span>
          </div>
          <input
            type="text"
            placeholder="添加标签（回车确认）"
            v-model="tagInput"
            @keyup.enter="addTag"
          />
        </div>
      </div>
      <div class="form-group">
        <textarea
          class="content-input"
          placeholder="分享你的想法和见解..."
          v-model="content"
          rows="12"
        ></textarea>
      </div>
      <div class="form-group">
        <div class="toolbar">
          <button class="tool-btn">📷 图片</button>
          <button class="tool-btn">🎥 视频</button>
          <button class="tool-btn">🔗 链接</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const title = ref('')
const content = ref('')
const selectedTopic = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')

const goBack = () => {
  router.back()
}

const addTag = () => {
  if (tagInput.value.trim() && tags.value.length < 5) {
    tags.value.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
}

const handleSubmit = () => {
  if (!title.value || !content.value) {
    alert('请填写标题和内容')
    return
  }
  // 提交逻辑
  alert('发布成功！')
  router.push('/post')
}
</script>

<style scoped>
.post-create-page {
  width: 100%;
  background: #ffffff;
}

.header {
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cancel-btn,
.submit-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.cancel-btn {
  color: #666;
}

.submit-btn {
  color: #1890ff;
  font-weight: 600;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.content {
  padding: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.title-input,
.topic-select,
.content-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
}

.title-input {
  font-size: 16px;
  font-weight: 600;
}

.content-input {
  resize: vertical;
  font-family: inherit;
  line-height: 1.8;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 15px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  min-height: 44px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #1890ff;
  color: #fff;
  border-radius: 15px;
  font-size: 13px;
}

.remove-tag {
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.tags-input input {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  font-size: 14px;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.tool-btn {
  padding: 8px 15px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.tool-btn:hover {
  background: #e8e8e8;
}
</style>
