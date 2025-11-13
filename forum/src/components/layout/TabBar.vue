<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="tab-item"
      :class="{ active: activeTab === tab.name }"
      @click="handleTabClick(tab)"
    >
      <div class="tab-icon" :class="{ 'publish-icon': tab.name === 'publish' }">
        <img 
          v-if="tab.name === 'home'" 
          :src="activeTab === 'home' ? indexSelectIcon : indexIcon" 
          class="icon-img" 
          alt="首页"
        />
        <img 
          v-else-if="tab.name === 'topic'" 
          :src="activeTab === 'topic' ? subjectSelectIcon : subjectIcon" 
          class="icon-img" 
          alt="话题"
        />
        <div v-else-if="tab.name === 'publish'" class="publish-btn">
          <!-- <span class="plus-icon">+</span> -->
          <el-icon :size="24"><Plus /></el-icon>
        </div>
        <img 
          v-else-if="tab.name === 'message'" 
          :src="activeTab === 'message' ? messageSelectIcon : messageIcon" 
          class="icon-img" 
          alt="消息"
        />
        <img 
          v-else-if="tab.name === 'profile'" 
          :src="activeTab === 'profile' ? mySelectIcon : myIcon" 
          class="icon-img" 
          alt="我的"
        />
      </div>
      <div class="tab-label" v-if="tab.name !== 'publish'">{{ tab.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../../stores/app'
import { Plus } from '@element-plus/icons-vue'
// 导入图标
import indexIcon from '../../assets/images/tabbar-icon/index.png'
import indexSelectIcon from '../../assets/images/tabbar-icon/index-select.png'
import subjectIcon from '../../assets/images/tabbar-icon/subject.png'
import subjectSelectIcon from '../../assets/images/tabbar-icon/subject-select.png'
import messageIcon from '../../assets/images/tabbar-icon/message.png'
import messageSelectIcon from '../../assets/images/tabbar-icon/message-select.png'
import myIcon from '../../assets/images/tabbar-icon/my.png'
import mySelectIcon from '../../assets/images/tabbar-icon/my-select.png'

interface Tab {
  name: string
  label: string
  path: string
}

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const tabs: Tab[] = [
  { name: 'home', label: '首页', path: '/home' },
  { name: 'topic', label: '话题', path: '/topic' },
  { name: 'publish', label: '', path: '/publish' },
  { name: 'message', label: '消息', path: '/message' },
  { name: 'profile', label: '我的', path: '/profile' }
]

const activeTab = computed(() => {
  const path = route.path
  if (path.startsWith('/home')) return 'home'
  if (path.startsWith('/topic') && path === '/topic') return 'topic'
  if (path.startsWith('/publish')) return 'publish'
  if (path.startsWith('/message') && path === '/message') return 'message'
  if (path.startsWith('/profile') && path === '/profile') return 'profile'
  return appStore.activeTab
})

const handleTabClick = (tab: Tab) => {
  appStore.setActiveTab(tab.name)
  router.push(tab.path)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  min-height: 50px;
  height: calc(50px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  padding-bottom: constant(safe-area-inset-bottom);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 4px 0;  /* 1vw → 4px */
  position: relative;
  min-width: 0;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;  /* 0.5vw → 2px */
}

.icon-img {
  width: 24px;
  height: 24px;
  display: block;
}

.tab-label {
  font-size: 11px;  /* clamp(10px, 2.9vw, 11px) → 11px */
  color: #8a8a8a;
  transition: color 0.3s;
  white-space: nowrap;
}

.tab-item.active .tab-label {
  color: #333;
  font-weight: bold;
}

/* 发布按钮特殊样式 */
.publish-icon {
  position: relative;
  margin-bottom: 0;
}

.publish-btn {
  width: 40px;  /* clamp(40px, 11.7vw, 44px) → 44px */
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  position: absolute;
  top: -22px;
}

.plus-icon {
  font-size: 36px;
  color: #1A1A1A;
  font-weight: 400;
  text-align: center;
  line-height: 100%;
  position: relative;
  top: -2px;
}

.tab-item:active {
  opacity: 0.7;
}
</style>

