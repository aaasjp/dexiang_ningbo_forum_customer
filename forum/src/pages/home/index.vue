<template>
  <div class="home-page">
    <!-- 黑色半透明蒙层 -->
    <div 
      class="overlay" 
      v-if="showDropdown"
      @click="closeDropdown"
    ></div>

    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-tabs">
        <div
          class="header-tab"
          :class="{ active: mainTab === 'recommend' }"
          @click="handleRecommendClick"
        >
          {{ getRecommendLabel() }}
          <span class="dropdown-icon" :class="{ open: showDropdown }">▼</span>
        </div>
        <div
          class="header-tab"
          :class="{ active: mainTab === 'follow' }"
          @click="switchMainTab('follow')"
        >
          关注
        </div>
      </div>
      <div class="search-btn" @click="goToSearch">
        <el-icon class="search-icon" :size="20">
          <Search />
        </el-icon>
      </div>
    </div>

    <!-- 下拉菜单 -->
    <div class="dropdown-menu" v-if="showDropdown">
      <div
        v-for="category in categories"
        :key="category.id"
        class="dropdown-item"
        :class="{ active: activeCategory === category.id }"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </div>
    </div>

    <!-- 二级 Tab（推荐 Tab 下显示） -->
    <div class="sub-tabs" v-if="mainTab === 'recommend' && !showDropdown">
      <div
        v-for="tab in subTabs"
        :key="tab.id"
        class="sub-tab-item"
        :class="{ active: activeSubTab === tab.id }"
        @click="switchSubTab(tab.id)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 关注列表（关注 Tab 下显示） -->
    <div class="follow-list" v-if="mainTab === 'follow' && !showDropdown">
      <div
        v-for="user in followUsers"
        :key="user.id"
        class="follow-user-item"
        @click="handleUserClick(user)"
      >
        <div class="user-avatar">{{ user.avatar }}</div>
        <div class="user-name">{{ user.name }}</div>
      </div>
      <div class="follow-more-item">
        <div class="more-icon">+</div>
        <div class="more-text">关注更多</div>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="content">
      <!-- 关注页空状态 -->
      <div v-if="mainTab === 'follow' && filteredPosts.length === 0" class="empty-follow">
        <div class="empty-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <!-- 左边的黄色人物 -->
            <rect x="20" y="30" width="35" height="45" rx="8" fill="#FFD700"/>
            <circle cx="30" cy="45" r="3" fill="#333"/>
            <circle cx="45" cy="45" r="3" fill="#333"/>
            <path d="M 30 55 Q 37.5 58 45 55" stroke="#333" stroke-width="2" fill="none"/>
            <rect x="25" y="80" width="8" height="15" rx="4" fill="#333"/>
            <rect x="42" y="80" width="8" height="15" rx="4" fill="#333"/>
            <path d="M 20 75 L 15 85 L 20 85" fill="#333"/>
            <path d="M 55 75 L 60 85 L 55 85" fill="#333"/>
            
            <!-- 右边的黄色人物 -->
            <rect x="65" y="30" width="35" height="45" rx="8" fill="#FFD700"/>
            <circle cx="75" cy="45" r="3" fill="#333"/>
            <circle cx="90" cy="45" r="3" fill="#333"/>
            <path d="M 75 55 Q 82.5 58 90 55" stroke="#333" stroke-width="2" fill="none"/>
            <rect x="70" y="80" width="8" height="15" rx="4" fill="#333"/>
            <rect x="87" y="80" width="8" height="15" rx="4" fill="#333"/>
            <path d="M 65 75 L 60 85 L 65 85" fill="#333"/>
            <path d="M 100 75 L 105 85 L 100 85" fill="#333"/>
            
            <!-- 手拉手 -->
            <path d="M 55 60 Q 60 55 65 60" stroke="#333" stroke-width="3" fill="none"/>
          </svg>
        </div>
        <div class="empty-text">还未关注任何人，可以去推荐页看看</div>
        <div class="empty-btn" @click="goToRecommend">去看看</div>
      </div>
      
      <!-- 正常帖子列表 - 使用无限滚动组件 -->
      <InfiniteScroll
        v-else
        :loading="loading"
        :no-more="noMore"
        :is-empty="isEmpty"
        :enable-pull-refresh="true"
        @load-more="loadMore"
        @refresh="refresh"
      >
        <div class="post-list">
          <PostCard
            v-for="post in filteredPosts"
            :key="post.id"
            :post="post"
            @click="handlePostClick(post)"
          />
        </div>
      </InfiniteScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import PostCard from '../../components/post/PostCard.vue'
import InfiniteScroll from '../../components/common/InfiniteScroll.vue'
import type { Post, CategoryOption } from '../../types/post'
import { getQuestionList } from '../../api/question'
import { getFollowedUsers } from '../../api/user'
import { transformQuestionToPost, mapCategoryToApi } from '../../utils/transform'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'

const router = useRouter()

// 主 Tab：推荐/关注
const mainTab = ref<'recommend' | 'follow'>('recommend')

// 分类筛选
const activeCategory = ref('all')

// 下拉菜单显示状态
const showDropdown = ref(false)

// 二级 Tab 状态
const activeSubTab = ref('all')

// 关注用户列表
const followUsers = ref<any[]>([])

// 使用无限滚动 Hook
const {
  list: allPosts,
  loading,
  isEmpty,
  noMore,
  loadMore,
  refresh
} = useInfiniteScroll<Post>(
  async (page: number, pageSize: number) => {
    const params: any = {
      page,
      page_size: pageSize
    }
    
    // 如果选择了分类，添加分类参数
    if (activeCategory.value !== 'all') {
      params.category = mapCategoryToApi(activeCategory.value)
    }
    
    // 根据二级 Tab 添加 status 参数
    if (activeSubTab.value === 'solved') {
      params.status = 1 // 已解决
    } else if (activeSubTab.value === 'unsolved') {
      params.status = 0 // 待解决
    }
    
    return await getQuestionList(params)
  },
  {
    pageSize: 20,
    transform: transformQuestionToPost
  }
)

// 分类列表
const categories: CategoryOption[] = [
  { id: 'all', name: '推荐' },
  { id: 'suggest', name: '建议' },
  { id: 'help', name: '求助' },
  { id: 'complain', name: '吐槽' }
]

// 二级 Tab 列表
const subTabs = [
  { id: 'all', name: '全部' },
  { id: 'solved', name: '已解决' },
  { id: 'unsolved', name: '未解决' }
]

// 获取推荐按钮的标签文本
const getRecommendLabel = () => {
  const category = categories.find(c => c.id === activeCategory.value)
  return category ? category.name : '推荐'
}

// 处理推荐按钮点击
const handleRecommendClick = () => {
  // 如果当前不在推荐 Tab，先切换到推荐 Tab
  if (mainTab.value !== 'recommend') {
    mainTab.value = 'recommend'
    showDropdown.value = false
  } else {
    // 如果已经在推荐 Tab，则切换下拉菜单
    showDropdown.value = !showDropdown.value
  }
}

// 关闭下拉菜单
const closeDropdown = () => {
  showDropdown.value = false
}

// 选择分类
const selectCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  mainTab.value = 'recommend'
  showDropdown.value = false
  // 刷新列表
  refresh()
}

// 切换主 Tab
const switchMainTab = (tab: 'recommend' | 'follow') => {
  mainTab.value = tab
  showDropdown.value = false
  if (tab === 'follow') {
    loadFollowUsers()
  }
}

// 切换二级 Tab
const switchSubTab = (tabId: string) => {
  activeSubTab.value = tabId
  // 刷新列表，应用新的 status 筛选
  refresh()
}

// 加载关注用户列表
const loadFollowUsers = async () => {
  try {
    const response = await getFollowedUsers(1, 20)
    followUsers.value = response.data.items.map(user => ({
      id: user.staff_code,
      name: user.nickname || user.name,
      avatar: '👤',
      badge: user.forum_tag || ''
    }))
  } catch (error) {
    console.error('加载关注用户列表失败:', error)
  }
}

// 处理用户点击
const handleUserClick = (user: any) => {
  // 跳转到用户主页
  router.push(`/profile/user?code=${user.id}`)
}

// 过滤帖子
const filteredPosts = computed(() => {
  let posts = allPosts.value
  
  // 按二级 Tab 筛选
  if (activeSubTab.value === 'solved') {
    // 筛选已解决的帖子 (status === 1)
    posts = posts.filter(post => post.status === 1)
  } else if (activeSubTab.value === 'unsolved') {
    // 筛选未解决的帖子 (status === 0 或 2)
    posts = posts.filter(post => post.status === 0 || post.status === 2)
  }
  
  return posts
})

// 处理帖子点击
const handlePostClick = (post: Post) => {
  router.push(`/post/${post.question_id || post.id}`)
}

// 跳转到推荐页
const goToRecommend = () => {
  mainTab.value = 'recommend'
  activeCategory.value = 'all'
  refresh()
}

// 跳转到搜索页
const goToSearch = () => {
  router.push('/search')
}

// 组件挂载时加载数据
onMounted(() => {
  refresh()
})
</script>

<style scoped>
.home-page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  background: #FFFFFF;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #fff;
  padding: 10px 16px;  /* 直接写 px，自动转换为 rem */
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 1001;
  /* box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); */
}

.header-tabs {
  display: flex;
  gap: 20px;  /* 直接写 px，自动转换为 rem */
  flex: 1;
}

.header-tab {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-tab.active {
  height: 28px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 20px;
  color: #1A1A1A;
  text-align: left;
  font-style: normal;
  text-transform: none;
  position: relative;
}

.header-tab.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 40%;
  transform: translateX(-50%);
  width: 32px;
  height: 4px;
  background: #FFD700;
  border-radius: 2px;
}

.dropdown-icon {
  font-size: 10px;
  color: #999;
  transition: transform 0.3s;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  color: #666;
}

/* 二级 Tab */
.sub-tabs {
  display: flex;
  background: #fff;
  padding: 12px 16px;  /* 直接写 px */
  gap: 12px;           /* 直接写 px */
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  /* border-bottom: 1px solid #f0f0f0; */
  scrollbar-width: none;
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 1000;
}

.sub-tabs::-webkit-scrollbar {
  display: none;
}

.sub-tab-item {
  padding: 6px 16px;   /* 直接写 px */
  height: 28px;        /* 直接写 px */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px; /* 直接写 px */
  background: #F7F7F7;
  color: #666;
  font-size: 14px;     /* 直接写 px */
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  border: 1px solid transparent;
  white-space: nowrap;
}

.sub-tab-item.active {
  background: rgba(255, 221, 0, 0.1);
  color: #333;
  font-weight: 500;
  border: 1px solid rgba(255, 221, 0, 0.5);
}

.sub-tab-item:active {
  transform: scale(0.95);
}

/* 关注列表 */
.follow-list {
  display: flex;
  background: #fff;
  padding: 12px 16px;
  gap: 16px;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-bottom: 1px solid #F5F5F5;
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 1000;
}

.follow-list::-webkit-scrollbar {
  display: none;
}

.follow-user-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.follow-user-item:active .user-avatar {
  transform: scale(0.95);
}

.user-name {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #666;
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.more-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.follow-more-item:active .more-icon {
  transform: scale(0.95);
}

.more-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
  text-align: center;
  white-space: nowrap;
}

/* 黑色半透明蒙层 */
.overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 下拉菜单 */
.dropdown-menu {
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: #fff;
  z-index: 1000;
  padding: 12px 16px;  /* 直接写 px */
  display: flex;
  gap: 12px;           /* 直接写 px */
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  animation: slideDown 0.3s;
  scrollbar-width: none;
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.dropdown-menu::-webkit-scrollbar {
  display: none;
}

.dropdown-item {
  padding: 10px 20px;  /* 直接写 px */
  height: 40px;        /* 直接写 px */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 23px; /* 直接写 px */
  background: #F7F7F7;
  color: #666;
  font-size: 14px;     /* 直接写 px */
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  white-space: nowrap;
}

.dropdown-item.active {
  background: #FFDD00;
  color: #333;
  font-weight: 500;
}

.dropdown-item:active {
  transform: scale(0.95);
}

/* 内容区域 */
.content {
  padding: 0;
  padding-top: 100px;
}

/* 关注页空状态 */
.empty-follow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  min-height: calc(100vh - 150px);
}

.empty-icon {
  margin-bottom: 30px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.6;
}

.empty-btn {
  width: 120px;
  height: 46px;
  border-radius: 23px 23px 23px 23px;
  border: 1px solid #999999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #1A1A1A;
  text-align: center;
  font-style: normal;
  text-transform: none;
}

.empty-btn:hover {
  background: #fafafa;
  border-color: #d9d9d9;
}

.empty-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* 帖子列表容器 */
.post-list {
  background: #fff;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-state .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state .empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 0;
}
</style>

