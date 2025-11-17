<template>
  <div class="post-detail-page" @click="handlePageClick">
    <!-- 顶部导航 -->
    <PostDetailHeader
      :title="getCategoryName(postData.category)"
      :is-own-post="isOwnPost"
      @back="goBack"
      @search="goToSearch"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 帖子内容 -->
    <PostContent
      ref="postContentRef"
      :author="postData.author"
      :time="postData.time"
      :mentions="postData.mentions"
      :related-mentions="relatedMentions"
      :title="postData.title"
      :content="postData.content || ''"
      :images="postData.images"
      :topic="postData.topic"
      :topics="postData.topics"
      :solved="postData.solved"
      :show-solve-status="dataLoaded && postData.category !== 'free'"
      :can-change-solve-status="isOwnPost && postData.category !== 'free'"
      :show-follow-btn="!isOwnPost"
      :is-followed="isFollowed"
      :is-anonymous="postData.is_anonymous === 1"
      @author-click="goToUserProfile"
      @solve-click="handleSolveClick"
      @follow-click="handleFollow"
    />

    <!-- 评论区域 -->
    <CommentList
      :comments="comments"
      :is-own-post="isOwnPost"
      :current-user-code="currentUserCode"
      @reply="handleReply"
      @like="handleLikeComment"
      @more="handleMoreComment"
      @reply-to-reply="handleReplyToReply"
      @like-reply="handleLikeReply"
      @useful="handleUsefulComment"
      @edit="handleEditComment"
      @delete="handleDeleteComment"
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
      :is-edit-mode="isEditingComment"
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
    <div v-if="showGuide" class="guide-overlay" @click.self="closeGuide">
      <div class="guide-wrapper" :style="guidePositionStyle">
        <img src="../../assets/images/detail/guide.png" alt="引导提示" class="guide-image" />
        <button class="guide-know-btn" @click="closeGuide">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PostDetailHeader from '../../components/post/PostDetailHeader.vue'
import PostContent from '../../components/post/PostContent.vue'
import CommentList from '../../components/post/CommentList.vue'
import ActionBar from '../../components/post/ActionBar.vue'
import ReplyInput from '../../components/post/ReplyInput.vue'
import { getQuestionDetail, toggleLikeQuestion, toggleFavoriteQuestion, updateQuestionStatus, deleteQuestion } from '../../api/question'
import { getAnswersByQuestion, createAnswer, toggleLikeAnswer, markAnswerAsUseful, updateAnswer, deleteAnswer } from '../../api/answer'
import { toggleFollowUser } from '../../api/user'
import { getDepartmentTree } from '../../api/department'
import { transformQuestionDetailToPost, transformAnswerToComment } from '../../utils/transform'
import type { Post, Comment, CommentReply } from '../../types/post'
import type { DepartmentInfo, StaffInfo } from '../../api/department'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 当前用户工号 - 从 store 中获取
const currentUserCode = computed(() => userStore.userProfile?.staff_code || '')

// 是否已关注作者
const isFollowed = ref(false)

// 加载状态
const loading = ref(false)
const dataLoaded = ref(false)

// 帖子数据
const postData = ref<Post>({
  id: (route.query.id || route.params.id) as string || '1',
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

// @部门和人员
const relatedMentions = ref<string[]>([])
const departmentMap = ref<Map<number, string>>(new Map())
const staffMap = ref<Map<string, string>>(new Map())

// 组件ref
const postContentRef = ref<InstanceType<typeof PostContent>>()

// 状态
const showSolveModal = ref(false)
const showGuide = ref(false)
const showReplyInput = ref(false)
const replyToUser = ref<string>()
const replyPlaceholder = ref('说点什么...')
const replyInputRef = ref<InstanceType<typeof ReplyInput>>()
const currentReplyAnswerId = ref<number>()
const isEditingComment = ref(false)
const editingCommentId = ref<number>()

// 引导位置样式
const guidePositionStyle = ref<Record<string, string>>({})

// 判断是否是自己的帖子
const isOwnPost = computed(() => {
  return postData.value.asker_code === currentUserCode.value
})

// 获取分类名称
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'suggest': '建议',
    'help': '求助',
    'complain': '吐槽',
    'free': '自由提问'
  }
  return categoryMap[category] || '帖子'
}

// 加载部门树数据
const loadDepartmentData = async () => {
  try {
    const response = await getDepartmentTree({ include_children: true })
    const departments = response.data.departments
    
    // 构建部门和员工映射
    const buildMaps = (depts: DepartmentInfo[]) => {
      depts.forEach((dept) => {
        departmentMap.value.set(dept.dept_id, dept.dept_name)
        
        // 添加员工信息
        if (dept.staffs) {
          dept.staffs.forEach((staff: StaffInfo) => {
            // 如果是虚拟角色，在括号中显示虚拟角色名称
            const displayName = staff.is_virtual && staff.virtual_staff_name
              ? `${staff.name}（${staff.virtual_staff_name}）`
              : staff.name
            staffMap.value.set(staff.staff_code, displayName)
          })
        }
        
        // 递归处理子部门
        if (dept.children && dept.children.length > 0) {
          buildMaps(dept.children)
        }
      })
    }
    
    buildMaps(departments)
  } catch (error) {
    console.error('加载部门数据失败:', error)
  }
}

// 更新关联提及信息
const updateRelatedMentions = () => {
  const mentions: string[] = []
  
  // 添加部门名称
  if (postData.value.related_dept_ids && postData.value.related_dept_ids.length > 0) {
    postData.value.related_dept_ids.forEach((deptId: number) => {
      const deptName = departmentMap.value.get(deptId)
      if (deptName) {
        mentions.push(deptName)
      }
    })
  }
  
  // 添加员工名称
  if (postData.value.related_staff_codes && postData.value.related_staff_codes.length > 0) {
    postData.value.related_staff_codes.forEach((staffCode: string) => {
      const staffName = staffMap.value.get(staffCode)
      if (staffName) {
        mentions.push(staffName)
      }
    })
  }
  
  relatedMentions.value = mentions
}

// 加载帖子数据
const loadPostData = async () => {
  try {
    loading.value = true
    const questionId = Number(route.query.id || route.params.id)
    
    // 加载问题详情
    const questionResponse = await getQuestionDetail(questionId)
    postData.value = transformQuestionDetailToPost(questionResponse.data)
    
    // 加载回答列表
    const answersResponse = await getAnswersByQuestion(questionId)
    comments.value = answersResponse.data.items.map(transformAnswerToComment)
    postData.value.comments = comments.value.length
    
    // 更新关联提及信息
    updateRelatedMentions()
    
    // 标记数据已加载
    dataLoaded.value = true
  } catch (error) {
    console.error('加载帖子数据失败:', error)
    //ElMessage.error('加载帖子数据失败')
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
  // 如果是匿名帖子，不允许跳转
  if (postData.value.is_anonymous === 1) {
    return
  }
  
  // 获取作者的工号
  const staffCode = postData.value.author.staff_code || postData.value.asker_code
  if (!staffCode) {
    return
  }
  
  // 如果点击的是自己，跳转到个人中心页
  if (staffCode === currentUserCode.value) {
    router.push('/profile')
  } else {
    // 否则跳转到他人主页
    router.push(`/profile/home/${staffCode}`)
  }
}

// 处理编辑
const handleEdit = () => {
  const questionId = postData.value.question_id || Number(route.query.id || route.params.id)
  // 跳转到发布页，传递编辑参数
  router.push({
    path: '/publish',
    query: {
      edit: '1',
      id: String(questionId)
    }
  })
}

// 处理删除
const handleDelete = async () => {
  // 确认删除
  if (!confirm('确定要删除这个问题吗？删除后将无法恢复。')) {
    return
  }
  
  try {
    const questionId = postData.value.question_id || Number(route.query.id || route.params.id)
    await deleteQuestion(questionId)
    
    // 删除成功后返回上一页
    //ElMessage.success('删除成功')
    router.back()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请稍后重试')
  }
}

// 处理关注
const handleFollow = async () => {
  try {
    if (!postData.value.asker_code) {
      //ElMessage.warning('无法获取作者信息')
      return
    }
    
    const response = await toggleFollowUser(postData.value.asker_code)
    isFollowed.value = response.data.followed
    
    if (isFollowed.value) {
      //ElMessage.success('关注成功')
    } else {
      //ElMessage.info('取消关注')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    //ElMessage.error('操作失败')
  }
}

// 处理解决状态点击
const handleSolveClick = () => {
  showSolveModal.value = true
}

// 确认解决
const confirmSolve = async () => {
  try {
    const questionId = postData.value.question_id || Number(route.query.id || route.params.id)
    const newStatus = postData.value.status === 1 ? 2 : 1  // 1已解决, 0待解决
    
    await updateQuestionStatus(questionId, newStatus)
    
    postData.value.solved = newStatus === 1
    postData.value.status = newStatus
    showSolveModal.value = false
    
    //ElMessage.success(`已标记为${postData.value.solved ? '已解决' : '未解决'}`)
  } catch (error) {
    console.error('更新状态失败:', error)
    //ElMessage.error('更新状态失败')
  }
}

// 计算引导位置
const calculateGuidePosition = () => {
  nextTick(() => {
    const solveBtn = postContentRef.value?.solveStatusBtn
    if (solveBtn) {
      const rect = solveBtn.getBoundingClientRect()
      // 将引导图片定位到按钮位置
      guidePositionStyle.value = {
        position: 'absolute',
        top: `${rect.top - 20}px`,
        left: '50%',
        transform: 'translateX(-50%)'
      }
    }
  })
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
  isEditingComment.value = false
  editingCommentId.value = undefined
  nextTick(() => {
    replyInputRef.value?.focus()
  })
}

// 处理更多评论操作
const handleMoreComment = (_comment: Comment) => {
  //ElMessage.info('更多操作')
}

// 处理点赞评论
const handleLikeComment = async (comment: Comment) => {
  try {
    if (!comment.answer_id) {
      //ElMessage.warning('无法获取评论信息')
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
    //ElMessage.error('操作失败')
  }
}

// 处理回复子回复
const handleReplyToReply = (reply: CommentReply, _comment: Comment) => {
  showReplyInput.value = true
  replyToUser.value = reply.author
  replyPlaceholder.value = `回复 @${reply.author}`
  currentReplyAnswerId.value = reply.answer_id
  isEditingComment.value = false
  editingCommentId.value = undefined
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

// 处理采纳回答为有用/取消有用
const handleUsefulComment = async (comment: Comment) => {
  try {
    if (!comment.answer_id) {
      //ElMessage.warning('无法获取回答信息')
      return
    }
    
    const isCurrentlyUseful = comment.is_useful === 1
    
    await markAnswerAsUseful(comment.answer_id)
    
    // 更新评论的 is_useful 状态（切换）
    const index = comments.value.findIndex((c: Comment) => c.id === comment.id)
    if (index !== -1 && comments.value[index]) {
      comments.value[index].is_useful = isCurrentlyUseful ? 0 : 1
    }
    
    //ElMessage.success(isCurrentlyUseful ? '已取消有用标记' : '已标记为有用回答')
    
    // 重新加载评论列表以获取最新状态
    await loadPostData()
  } catch (error) {
    console.error('操作失败:', error)
    //ElMessage.error('操作失败')
  }
}

// 处理编辑评论
const handleEditComment = (comment: Comment) => {
  if (!comment.answer_id) {
    //ElMessage.warning('无法获取回答信息')
    return
  }
  
  // 设置编辑模式
  isEditingComment.value = true
  editingCommentId.value = comment.answer_id
  showReplyInput.value = true
  replyToUser.value = undefined
  currentReplyAnswerId.value = undefined
  
  // 在输入框中回填内容
  nextTick(() => {
    if (replyInputRef.value) {
      replyInputRef.value.setEditContent(comment.content, comment.images || [])
      replyInputRef.value.focus()
    }
  })
}

// 处理删除评论
const handleDeleteComment = async (comment: Comment) => {
  if (!comment.answer_id) {
    //ElMessage.warning('无法获取回答信息')
    return
  }
  
  // 确认删除
  if (!confirm('确定要删除这条回答吗？')) {
    return
  }
  
  try {
    await deleteAnswer(comment.answer_id)
    //ElMessage.success('删除成功')
    
    // 重新加载评论列表
    await loadPostData()
  } catch (error) {
    console.error('删除失败:', error)
    //ElMessage.error('删除失败')
  }
}

// 处理点赞帖子
const handleLikePost = async () => {
  try {
    const questionId = postData.value.question_id || Number(route.query.id || route.params.id)
    const response = await toggleLikeQuestion(questionId)
    
    postData.value.liked = response.data.liked
    if (postData.value.liked) {
      postData.value.likes++
      //ElMessage.success('点赞成功')
    } else {
      postData.value.likes--
      //ElMessage.info('取消点赞')
    }
  } catch (error) {
    console.error('点赞失败:', error)
    //ElMessage.error('操作失败')
  }
}

// 处理收藏
const handleCollect = async () => {
  try {
    const questionId = postData.value.question_id || Number(route.query.id || route.params.id)
    const response = await toggleFavoriteQuestion(questionId)
    
    postData.value.collected = response.data.favorited
    if (postData.value.collected) {
      postData.value.collects = (postData.value.collects || 0) + 1
      //ElMessage.success('收藏成功')
    } else {
      postData.value.collects = (postData.value.collects || 0) - 1
      //ElMessage.info('取消收藏')
    }
  } catch (error) {
    console.error('收藏失败:', error)
    //ElMessage.error('操作失败')
  }
}

// 处理回答
const handleAnswer = () => {
  showReplyInput.value = true
  replyToUser.value = undefined
  currentReplyAnswerId.value = undefined
  isEditingComment.value = false
  editingCommentId.value = undefined
  replyPlaceholder.value = '快写下你的想法吧！'
  nextTick(() => {
    replyInputRef.value?.focus()
  })
}

// 处理评论提交
const handleCommentSubmit = (text: string) => {
  const newComment: Comment = {
    id: String(comments.value.length + 1),
    author: '我',
    avatar: '👤',
    content: text,
    time: '刚刚',
    likes: 0,
    liked: false
  }
  
  comments.value.unshift(newComment)
  postData.value.comments = comments.value.length
  //ElMessage.success('评论成功')
}

// 处理回复发送
const handleReplySend = async (data: { text: string, images: string[], isAnonymous: boolean }) => {
  try {
    const questionId = postData.value.question_id || Number(route.query.id || route.params.id)
    
    if (isEditingComment.value && editingCommentId.value) {
      // 编辑模式：更新回答
      await updateAnswer(editingCommentId.value, {
        content: data.text,
        images: data.images
      })
      //ElMessage.success('修改成功')
    } else {
      // 新建模式：创建回答
      const answerData = {
        question_id: questionId,
        parent_answer_id: currentReplyAnswerId.value || null,
        content: data.text,
        images: data.images,
        is_anonymous: data.isAnonymous ? 1 : 0
      }
      
      await createAnswer(answerData)
      
      if (replyToUser.value) {
        //ElMessage.success(`回复 @${replyToUser.value} 成功`)
      } else {
        //ElMessage.success('回复成功')
      }
    }
    
    // 重新加载评论列表
    await loadPostData()
  } catch (error) {
    console.error('操作失败:', error)
    //ElMessage.error('操作失败')
  }
  
  // 关闭输入框并重置状态
  showReplyInput.value = false
  replyToUser.value = undefined
  isEditingComment.value = false
  editingCommentId.value = undefined
}

// 取消回复
const handleCancelReply = () => {
  showReplyInput.value = false
  replyToUser.value = undefined
  isEditingComment.value = false
  editingCommentId.value = undefined
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
  
  // 如果点击的是评论区的回复按钮，不关闭
  if (target.closest('.comment-actions') || target.closest('.reply-actions')) {
    return
  }
  
  // 点击其他区域，关闭输入框
  showReplyInput.value = false
  replyToUser.value = undefined
  isEditingComment.value = false
  editingCommentId.value = undefined
}

// 页面加载时检查是否显示引导
onMounted(async () => {
  // 确保用户信息已加载
  if (!userStore.userProfile) {
    await userStore.fetchUserProfile()
  }
  
  // 先加载部门数据，再加载帖子数据
  await loadDepartmentData()
  await loadPostData()
  
  // 只在自己的提问帖子上显示引导
  if (isOwnPost.value && postData.value.category === 'help') {
    const guideShown = localStorage.getItem('guideShown')
    if (!guideShown) {
      setTimeout(() => {
        showGuide.value = true
        calculateGuidePosition()
      }, 1000)
    }
  }
})
</script>

<style scoped>
.post-detail-page {
  width: 100%;
  max-width: 100vw;
  background: #fff;
  overflow-x: hidden;
  padding-top: 48px;
  padding-bottom: 70px;
}

/* 切换状态弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
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
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
}

.guide-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.guide-image {
  width: 275px;
  height: 206px;
  object-fit: contain;
}

.guide-know-btn {
  width: 90px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #FAFAFA;
  background: transparent;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #FAFAFA;
  text-align: center;
  font-style: normal;
  text-transform: none;
  cursor: pointer;
  transition: all 0.2s;
}

.guide-know-btn:active {
  transform: scale(0.95);
  opacity: 0.8;
}
</style>
