<template>
  <div class="user-list-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="header-back" @click="goBack">
        <el-icon :size="24">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">用户列表</div>
      <div class="header-placeholder"></div>
    </div>

    <!-- 用户列表 -->
    <div class="content">
      <InfiniteScroll
        :loading="loading"
        :no-more="noMore"
        :is-empty="isEmpty"
        :enable-pull-refresh="true"
        @load-more="loadMore"
        @refresh="refresh"
      >
        <div class="user-list">
          <div
            v-for="user in users"
            :key="user.staff_code"
            class="user-item"
            @click="goToUserProfile(user.staff_code)"
          >
            <!-- 左侧：头像和信息 -->
            <div class="user-info">
              <Avatar :src="user.forum_avatar" :name="user.name" :size="48" />
              <div class="user-details">
                <div class="user-name-row">
                  <span class="user-name">{{ user.nickname || user.name }}</span>
                  <span v-if="user.forum_tag === '专家'" class="user-badge">{{ user.forum_tag }}</span>
                </div>
                <div class="user-stats">
                  <span>{{ user.answer_count }}回答</span>
                  <span class="dot">·</span>
                  <span>{{ formatCount(user.follower_count) }}关注</span>
                </div>
              </div>
            </div>

            <!-- 右侧：关注按钮 -->
            <div class="user-action" @click.stop="toggleFollow(user)">
              <div
                class="follow-btn"
                :class="{ followed: user.is_followed }"
              >
                {{ user.is_followed ? '已关注' : '关注' }}
              </div>
            </div>
          </div>
        </div>
      </InfiniteScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import InfiniteScroll from '../../components/common/InfiniteScroll.vue'
import Avatar from '../../components/common/Avatar.vue'
import { getUserList, toggleFollowUser, type UserListItem } from '../../api/user'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'

const router = useRouter()

// 使用无限滚动 Hook
const {
  list: users,
  loading,
  isEmpty,
  noMore,
  loadMore,
  refresh
} = useInfiniteScroll<UserListItem>(
  async (page: number, pageSize: number) => {
    return await getUserList(page, pageSize)
  },
  {
    pageSize: 20
  }
)

// 格式化数字
const formatCount = (count: number | undefined): string => {
  if (!count && count !== 0) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 切换关注状态
const toggleFollow = async (user: UserListItem) => {
  try {
    const response = await toggleFollowUser(user.staff_code)
    user.is_followed = response.data.followed
    
    if (user.is_followed) {
      user.follower_count = (user.follower_count || 0) + 1
      //ElMessage.success('关注成功')
    } else {
      user.follower_count = Math.max(0, (user.follower_count || 0) - 1)
      //ElMessage.success('取消关注')
    }
  } catch (error) {
    console.error('切换关注状态失败:', error)
    //ElMessage.error('操作失败，请重试')
  }
}

// 跳转到用户主页
const goToUserProfile = (staffCode: string) => {
  router.push({
    path: '/profile/user',
    query: {
      code: staffCode
    }
  })
}

// 返回
const goBack = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  refresh()
})
</script>

<style scoped>
.user-list-page {
  width: 100%;
  max-width: 100vw;
  background: #FFFFFF;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-back {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #333;
  width: 40px;
}

.header-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  text-align: center;
  flex: 1;
}

.header-placeholder {
  width: 40px;
}

/* 内容区域 */
.content {
  background: #fff;
  min-height: calc(100vh - 60px);
}

/* 用户列表 */
.user-list {
  padding: 0;
}

/* 用户项 */
.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #F5F5F5;
}

.user-item:active {
  background: #FAFAFA;
}

.user-item:last-child {
  border-bottom: none;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-family: PingFang SC, PingFang SC;
  font-size: 16px;
  color: #1A1A1A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
  font-weight: 500;
}

.user-badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 400;
  white-space: nowrap;
  flex-shrink: 0;
  height: 20px;
  color: #A56D39;
  text-align: left;
  font-style: normal;
  text-transform: none;
  font-family: PingFang SC, PingFang SC;
  
  /* 背景渐变 */
  background: linear-gradient(133deg, #FDF3EA 0%, #F5E9DE 100%);
  
  /* 左上和右下圆角 */
  position: relative;
  border: 1px solid #DEB691;
  border-radius: 10px 0 10px 0;  /* 左上 右上 右下 左下 */
  background-clip: padding-box;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #999;
}

.dot {
  color: #E0E0E0;
}

/* 关注按钮 */
.user-action {
  flex-shrink: 0;
  margin-left: 12px;
}

.follow-btn {
  width: 64px;
  height: 30px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  background: #FFD700;
  color: #1A1A1A;
  /* border: 1px solid #FFD700; */
}

.follow-btn:active {
  transform: scale(0.95);
}

.follow-btn.followed {
    width: 64px;
    height: 30px;
    background: #F7F7F7;
    border-radius: 18px 18px 18px 18px;
    color: #B3B3B3;
}
</style>

