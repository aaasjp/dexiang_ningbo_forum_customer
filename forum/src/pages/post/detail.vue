<template>
  <div class="post-detail-page" @click="handlePageClick">
    <!-- 顶部导航 -->
    <PostDetailHeader
      :title="getCategoryName(postData.category)"
      :is-own-post="isOwnPost"
      @back="goBack"
      @search="goToSearch"
      @edit="handleEdit"
      @share="handleShare"
      @delete="handleDelete"
      @report="handleReport"
    />

    <!-- 帖子内容 -->
    <PostContent
      :author="postData.author"
      :time="postData.time"
      :mentions="postData.mentions"
      :title="postData.title"
      :content="postData.content || ''"
      :topic="postData.topic"
      :solved="postData.solved"
      :show-solve-status="postData.category === 'help'"
      :can-change-solve-status="isOwnPost && postData.category === 'help'"
      :show-follow-btn="!isOwnPost"
      :is-followed="isFollowed"
      @author-click="goToUserProfile"
      @solve-click="handleSolveClick"
      @follow-click="handleFollow"
    />

    <!-- 评论区域 -->
    <CommentList
      :comments="comments"
      @reply="handleReply"
      @like="handleLikeComment"
      @more="handleMoreComment"
      @reply-to-reply="handleReplyToReply"
      @like-reply="handleLikeReply"
      @share="handleShareComment"
      @report="handleReportComment"
    />

    <!-- 底部操作栏 -->
    <ActionBar
      v-if="!showReplyInput"
      :likes="postData.likes"
      :collects="postData.collects || 0"
      :liked="postData.liked"
      :collected="postData.collected"
      @answer="handleAnswer"
      @like="handleLikePost"
      @collect="handleCollect"
      @input-focus="handleAnswer"
      @comment-submit="handleCommentSubmit"
    />

    <!-- 回复输入框 -->
    <ReplyInput
      v-if="showReplyInput"
      ref="replyInputRef"
      :placeholder="replyPlaceholder"
      :reply-to="replyToUser"
      @send="handleReplySend"
      @cancel-reply="handleCancelReply"
      @blur="handleReplyBlur"
    />

    <!-- 切换状态弹窗 -->
    <div v-if="showSolveModal" class="modal-overlay" @click.self="showSolveModal = false">
      <div class="modal-content solve-modal">
        <div class="modal-title">问题状态切换</div>
        <div class="modal-text">
          是否将问题状态切换至"{{ postData.solved ? '未解决' : '已解决' }}"？
        </div>
        <div class="modal-buttons">
          <button class="modal-btn cancel" @click="showSolveModal = false">取消</button>
          <button class="modal-btn confirm" @click="confirmSolve">完成</button>
        </div>
      </div>
    </div>

    <!-- 引导提示 -->
    <div v-if="showGuide" class="guide-overlay" @click="closeGuide">
      <div class="guide-content">
        <div class="guide-arrow"></div>
        <div class="guide-box">
          <div class="guide-text">点击此解决状态按钮即可切换问题状态</div>
          <button class="guide-btn" @click="closeGuide">我知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import PostDetailHeader from '../../components/post/PostDetailHeader.vue'
import PostContent from '../../components/post/PostContent.vue'
import CommentList from '../../components/post/CommentList.vue'
import ActionBar from '../../components/post/ActionBar.vue'
import ReplyInput from '../../components/post/ReplyInput.vue'
import { getQuestionDetail, toggleLikeQuestion, toggleFavoriteQuestion, updateQuestionStatus } from '../../api/question'
import { getAnswersByQuestion, createAnswer, toggleLikeAnswer } from '../../api/answer'
import { toggleFollowUser } from '../../api/user'
import { transformQuestionDetailToPost, transformAnswerToComment } from '../../utils/transform'
import type { Post, Comment, CommentReply } from '../../types/post'

const router = useRouter()
const route = useRoute()

// 当前用户工号（模拟）
const currentUserCode = ref('staff001')
const currentUserName = ref('张三')

// 是否已关注作者
const isFollowed = ref(false)

// 加载状态
const loading = ref(false)

// 帖子数据
const postData = ref<Post>({
  id: route.params.id as string || '1',
  author: {
    name: '加载中...',
    avatar: '👤'
  },
  category: 'help',
  title: '加载中...',
  content: '',
  time: '',
  solved: false,
  likes: 0,
  collects: 0,
  comments: 0
})

// 评论数据
const comments = ref<Comment[]>([])

// 状态
const showSolveModal = ref(false)
const showGuide = ref(false)
const showReplyInput = ref(false)
const replyToUser = ref<string>()
const replyPlaceholder = ref('说点什么...')
const replyInputRef = ref<InstanceType<typeof ReplyInput>>()
const currentReplyAnswerId = ref<number>()

// 判断是否是自己的帖子
const isOwnPost = computed(() => {
  return postData.value.asker_code === currentUserCode.value
})

// 获取分类名称
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'suggest': '建议',
    'help': '提问',
    'complain': '吐槽',
    'select': '精选'
  }
  return categoryMap[category] || '帖子'
}

// 加载帖子数据
const loadPostData = async () => {
  try {
    loading.value = true
    const questionId = Number(route.params.id)
    
    // 加载问题详情
    const questionResponse = await getQuestionDetail(questionId)
    postData.value = transformQuestionDetailToPost(questionResponse.data)
    
    // 加载回答列表
    const answersResponse = await getAnswersByQuestion(questionId)
    comments.value = answersResponse.data.items.map(transformAnswerToComment)
    postData.value.comments = comments.value.length
  } catch (error) {
    console.error('加载帖子数据失败:', error)
    ElMessage.error('加载帖子数据失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到搜索
const goToSearch = () => {
  router.push('/search')
}

// 跳转到用户主页
const goToUserProfile = () => {
  router.push(`/user/${postData.value.author.name}`)
}

// 处理编辑
const handleEdit = () => {
  const questionId = postData.value.question_id || Number(route.params.id)
  // 跳转到发布页，传递编辑参数
  router.push({
    path: '/publish',
    query: {
      edit: '1',
      id: String(questionId)
    }
  })
}

// 处理分享
const handleShare = () => {
  ElMessage.success('分享链接已复制')
}

// 处理删除
const handleDelete = () => {
  ElMessage.warning('确认删除该帖子？')
}

// 处理举报
const handleReport = () => {
  ElMessage.info('举报功能开发中...')
}

// 处理关注
const handleFollow = async () => {
  try {
    if (!postData.value.asker_code) {
      ElMessage.warning('无法获取作者信息')
      return
    }
    
    const response = await toggleFollowUser(postData.value.asker_code)
    isFollowed.value = response.data.followed
    
    if (isFollowed.value) {
      ElMessage.success('关注成功')
    } else {
      ElMessage.info('取消关注')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理解决状态点击
const handleSolveClick = () => {
  showSolveModal.value = true
}

// 确认解决
const confirmSolve = async () => {
  try {
    const questionId = postData.value.question_id || Number(route.params.id)
    const newStatus = postData.value.status === 1 ? 0 : 1  // 1已解决, 0待解决
    
    await updateQuestionStatus(questionId, newStatus)
    
    postData.value.solved = newStatus === 1
    postData.value.status = newStatus
    showSolveModal.value = false
    
    ElMessage.success(`已标记为${postData.value.solved ? '已解决' : '未解决'}`)
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 关闭引导
const closeGuide = () => {
  showGuide.value = false
  localStorage.setItem('guideShown', 'true')
}

// 处理回复
const handleReply = (comment: Comment) => {
  showReplyInput.value = true
  replyToUser.value = comment.author
  replyPlaceholder.value = `回复 @${comment.author}`
  currentReplyAnswerId.value = comment.answer_id
  nextTick(() => {
    replyInputRef.value?.focus()
  })
}

// 处理更多评论操作
const handleMoreComment = (_comment: Comment) => {
  ElMessage.info('更多操作')
}

// 处理点赞评论
const handleLikeComment = async (comment: Comment) => {
  try {
    if (!comment.answer_id) {
      ElMessage.warning('无法获取评论信息')
      return
    }
    
    const response = await toggleLikeAnswer(comment.answer_id)
    
    const index = comments.value.findIndex((c: Comment) => c.id === comment.id)
    if (index !== -1) {
      const currentComment = comments.value[index]
      if (currentComment) {
        currentComment.liked = response.data.liked
        if (currentComment.liked) {
          currentComment.likes++
        } else {
          currentComment.likes--
        }
      }
    }
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理回复子回复
const handleReplyToReply = (reply: CommentReply, _comment: Comment) => {
  showReplyInput.value = true
  replyToUser.value = reply.author
  replyPlaceholder.value = `回复 @${reply.author}`
  currentReplyAnswerId.value = reply.answer_id
  nextTick(() => {
    replyInputRef.value?.focus()
  })
}

// 处理点赞子回复
const handleLikeReply = (reply: CommentReply, comment: Comment) => {
  const commentIndex = comments.value.findIndex((c: Comment) => c.id === comment.id)
  if (commentIndex !== -1 && comments.value[commentIndex]?.replies) {
    const replyIndex = comments.value[commentIndex].replies!.findIndex((r: CommentReply) => r.id === reply.id)
    if (replyIndex !== -1 && comments.value[commentIndex].replies) {
      const currentReply = comments.value[commentIndex].replies![replyIndex]
      if (currentReply) {
        currentReply.liked = !currentReply.liked
        if (currentReply.liked) {
          currentReply.likes++
        } else {
          currentReply.likes--
        }
      }
    }
  }
}

// 处理分享评论
const handleShareComment = (_comment: Comment) => {
  ElMessage.success('评论链接已复制')
}

// 处理举报评论
const handleReportComment = (_comment: Comment) => {
  ElMessage.info('举报功能开发中...')
}

// 处理点赞帖子
const handleLikePost = async () => {
  try {
    const questionId = postData.value.question_id || Number(route.params.id)
    const response = await toggleLikeQuestion(questionId)
    
    postData.value.liked = response.data.liked
    if (postData.value.liked) {
      postData.value.likes++
      ElMessage.success('点赞成功')
    } else {
      postData.value.likes--
      ElMessage.info('取消点赞')
    }
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理收藏
const handleCollect = async () => {
  try {
    const questionId = postData.value.question_id || Number(route.params.id)
    const response = await toggleFavoriteQuestion(questionId)
    
    postData.value.collected = response.data.favorited
    if (postData.value.collected) {
      postData.value.collects = (postData.value.collects || 0) + 1
      ElMessage.success('收藏成功')
    } else {
      postData.value.collects = (postData.value.collects || 0) - 1
      ElMessage.info('取消收藏')
    }
  } catch (error) {
    console.error('收藏失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理回答
const handleAnswer = () => {
  showReplyInput.value = true
  replyToUser.value = undefined
  currentReplyAnswerId.value = undefined
  replyPlaceholder.value = '快写下你的想法吧！'
  nextTick(() => {
    replyInputRef.value?.focus()
  })
}

// 处理评论提交
const handleCommentSubmit = (text: string) => {
  const newComment: Comment = {
    id: String(comments.value.length + 1),
    author: currentUserName.value,
    avatar: '👤',
    content: text,
    time: '刚刚',
    likes: 0,
    liked: false
  }
  
  comments.value.unshift(newComment)
  postData.value.comments = comments.value.length
  ElMessage.success('评论成功')
}

// 处理回复发送
const handleReplySend = async (data: { text: string, images: string[] }) => {
  try {
    const questionId = postData.value.question_id || Number(route.params.id)
    
    const answerData = {
      question_id: questionId,
      parent_answer_id: currentReplyAnswerId.value || null,
      content: data.text,
      images: data.images
    }
    
    await createAnswer(answerData)
    
    if (replyToUser.value) {
      // 回复某个评论
      ElMessage.success(`回复 @${replyToUser.value} 成功`)
    } else {
      // 新评论
      ElMessage.success('回复成功')
    }
    
    // 重新加载评论列表
    await loadPostData()
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  }
  
  // 关闭输入框
  showReplyInput.value = false
  replyToUser.value = undefined
}

// 取消回复
const handleCancelReply = () => {
  showReplyInput.value = false
  replyToUser.value = undefined
}

// 回复输入框失焦
const handleReplyBlur = () => {
  // 不在这里处理关闭，由页面点击事件处理
}

// 页面点击处理
const handlePageClick = (e: MouseEvent) => {
  if (!showReplyInput.value) return
  
  const target = e.target as HTMLElement
  // 如果点击的是回复输入框内部，不关闭
  if (target.closest('.reply-input-wrapper')) {
    return
  }
  
  // 如果点击的是底部操作栏，不关闭（会触发其他事件）
  if (target.closest('.action-bar')) {
    return
  }
  
  // 点击其他区域，关闭输入框
  showReplyInput.value = false
  replyToUser.value = undefined
}

// 页面加载时检查是否显示引导
onMounted(() => {
  loadPostData()
  
  // 只在自己的提问帖子上显示引导
  if (isOwnPost.value && postData.value.category === 'help') {
    const guideShown = localStorage.getItem('guideShown')
    if (!guideShown) {
      setTimeout(() => {
        showGuide.value = true
      }, 1000)
    }
  }
})
</script>

<style scoped>
.post-detail-page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
  padding-bottom: 70px;
}

/* 切换状态弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 80%;
  max-width: 320px;
  padding: 24px;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-title {
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
  text-align: center;
  margin-bottom: 16px;
}

.modal-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  height: 46px;
  border: none;
  border-radius: 23px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn:active {
  transform: scale(0.95);
}

.modal-btn.cancel {
  background: #F7F7F7;
  color: #666;
}

.modal-btn.confirm {
  background: #FFDD00;
  color: #1A1A1A;
}

/* 引导提示 */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
}

.guide-content {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
}

.guide-arrow {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 15px solid #FFDD00;
  margin: 0 auto 0;
  position: relative;
  left: 0;
}

.guide-box {
  background: #FFDD00;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.guide-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #1A1A1A;
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.5;
}

.guide-btn {
  width: 100%;
  height: 40px;
  background: #fff;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
}

.guide-btn:active {
  transform: scale(0.95);
}
</style>
