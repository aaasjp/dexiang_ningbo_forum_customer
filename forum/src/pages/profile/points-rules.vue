<template>
  <div class="points-rules-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">积分规则</div>
    </div>

    <!-- 规则内容 -->
    <div class="rules-content">
      <div class="rule-section">
        <div class="section-title">第一章：总则与宗旨</div>
        
        <div class="article">
          <div class="article-title">第1条 目的</div>
          <div class="article-content">
            为感谢广大用户对【您的平台/品牌名称】的长期支持与厚爱，特制定本积分规则。我们旨在通过积分奖励计划，回馈用户的每一次消费、互动与分享，提升用户的忠诚度与归属感，同时为用户带来更多元化的价值与更优质的服务体验。
            <br><br>
            头像、生日、性别等），一次性奖励50积分。
          </div>
        </div>

        <div class="article">
          <div class="article-title">第2条 原则</div>
          <div class="article-content">
            为感谢广大用户对【您的平台/品牌名称】的长期支持与厚爱，特制定本积分规则。我们旨在通过积分奖励计划，回馈用户的每一次消费、互动与分享，提升用户的忠诚度与归属感，同时为用户带来更多元化的价值与更优质的服务体验。
            <br><br>
            头像、生日、性别等），一次性奖励50积分。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.points-rules-page {
  width: 100%;
  
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
}

/* 顶部导航 */
.header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
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
  flex-shrink: 0;
}

.header-title {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  text-align: center;
  margin-right: 20px;
}

/* 规则内容 */
.rules-content {
  padding: 16px;
}

.rule-section {
  margin-bottom: 24px;
}

.section-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.article {
  margin-bottom: 20px;
}

.article-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.article-content {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  line-height: 1.8;
  text-align: justify;
}
</style>
