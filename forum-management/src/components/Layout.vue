<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img">
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/content">
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </el-menu-item>
        <el-menu-item index="/topics">
          <el-icon><ChatDotRound /></el-icon>
          <span>话题管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/points">
          <el-icon><TrophyBase /></el-icon>
          <span>积分规则</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <Avatar 
                :src="userInfo.forum_avatar" 
                :name="userInfo.name"
                :size="32"
                class="user-avatar"
              />
              <span class="username">{{ userInfo.name || '加载中...' }}</span>
              <el-icon class="arrow-down"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis,
  Document,
  ChatDotRound,
  User,
  TrophyBase,
  ArrowDown,
  OfficeBuilding
} from '@element-plus/icons-vue'
import Avatar from './Avatar.vue'
import { getCurrentUserProfile } from '@/api/users'
import { clearGwSession } from '@/utils/request'

const router = useRouter()
const route = useRoute()

const activeMenu = ref(route.path)
const userInfo = ref({
  name: '',
  forum_avatar: '',
  staff_code: ''
})

const currentTitle = computed(() => {
  return route.meta.title || ''
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await getCurrentUserProfile()
    if (response.code === 200 && response.data) {
      userInfo.value = response.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    clearGwSession()
    ElMessage.success('已退出登录')
    router.replace('/login')
  }
}

watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
})

const handleMenuSelect = (index) => {
  router.push(index)
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  min-width: 1520px;
}

.sidebar {
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  height: 100vh;
}

.logo {
  display: flex;
  align-items: center;
  width: 98px;
  height: 32px;
  margin: 12px 16px;

}

.logo-img {
  width: 98px;
  height: 32px;
  display: block;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 4px;
}

.sidebar-menu .el-menu-item.is-active {
  color: #FF7800;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-avatar {
  flex-shrink: 0;
}

.username {
  font-size: 14px;
  color: #333;
}

.arrow-down {
  font-size: 12px;
  color: #999;
}

.main-content {
  background: #f5f5f5;
  padding: 24px;
  overflow-y: auto;
}
</style>

