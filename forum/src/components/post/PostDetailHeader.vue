<template>
  <div class="post-detail-header">
    <div class="back-btn" @click="onBack">
      <el-icon :size="20">
        <ArrowLeft />
      </el-icon>
    </div>
    <div class="header-title-wrapper">
      <div class="header-title">
        {{ title }}
        <el-icon :size="14" class="arrow-icon">
          <ArrowRight />
        </el-icon>
      </div>
    </div>
    <div class="header-actions">
      <div class="search-btn" @click="onSearch">
        <el-icon :size="20">
          <Search />
        </el-icon>
      </div>
      <div class="more-btn" @click="toggleMoreMenu">
        <el-icon :size="20">
          <More />
        </el-icon>
      </div>
    </div>

    <!-- 更多菜单 - 自己的帖子 -->
    <div v-if="showMenu && isOwnPost" class="more-menu">
      <div class="menu-item" @click="onEdit">编辑</div>
      <div class="menu-item" @click="onShare">分享</div>
      <div class="menu-item" @click="onDelete">删除</div>
    </div>

    <!-- 更多菜单 - 他人的帖子 -->
    <div v-if="showMenu && !isOwnPost" class="more-menu">
      <div class="menu-item" @click="onShare">分享</div>
      <div class="menu-item" @click="onReport">举报</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, ArrowRight, Search, More } from '@element-plus/icons-vue'

defineOptions({
  name: 'PostDetailHeader'
})

interface Props {
  title: string
  isOwnPost?: boolean  // 是否是自己的帖子
}

interface Emits {
  (e: 'back'): void
  (e: 'search'): void
  (e: 'edit'): void
  (e: 'share'): void
  (e: 'delete'): void
  (e: 'report'): void
}

withDefaults(defineProps<Props>(), {
  isOwnPost: false
})

const emit = defineEmits<Emits>()

const showMenu = ref(false)

const onBack = () => {
  emit('back')
}

const onSearch = () => {
  emit('search')
}

const toggleMoreMenu = () => {
  showMenu.value = !showMenu.value
}

const onEdit = () => {
  showMenu.value = false
  emit('edit')
}

const onShare = () => {
  showMenu.value = false
  emit('share')
}

const onDelete = () => {
  showMenu.value = false
  emit('delete')
}

const onReport = () => {
  showMenu.value = false
  emit('report')
}
</script>

<style scoped>
.post-detail-header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #F5F5F5;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
}

.header-title-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 8px;
}

.header-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #FFF5E5;
  border-radius: 12px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #FF6B00;
}

.arrow-icon {
  color: #FF6B00;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.search-btn,
.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transform: rotate(90deg);
}

/* 更多菜单 */
.more-menu {
  position: absolute;
  top: 48px;
  right: 16px;
  background: #4A4A4A;
  border-radius: 8px;
  overflow: hidden;
  z-index: 101;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-item {
  width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

