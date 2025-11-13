<template>
  <div class="publish-page" @click="handlePageClick">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="close-btn" @click="goBack">
        <el-icon :size="24">
          <Close />
        </el-icon>
      </div>
      <div class="header-title">{{ isEditMode ? '编辑' : '提问' }}</div>
      <button 
        class="publish-btn" 
        :class="{ disabled: !canPublish || isSubmitting }"
        @click="handleSubmit"
      >
        {{ isSubmitting ? (isEditMode ? '保存中...' : '发布中...') : (isEditMode ? '保存' : '发布') }}
      </button>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 问题类型 -->
      <CategorySelector 
        v-model="selectedCategory" 
        :categories="categories" 
      />
      <div class="text-container">
        <!-- 标题输入 -->
        <div class="title-section white-block">
          <textarea
            ref="titleInput"
            v-model="title"
            class="title-input"
            placeholder="请输入标题"
            rows="2"
            maxlength="100"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          ></textarea>
        </div>

        <!-- 内容输入 -->
        <div class="content-section white-block">
          <textarea
            ref="contentInput"
            v-model="content"
            class="content-input"
            placeholder="请输入内容"
            rows="4"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          ></textarea>

          <!-- 图片上传区域 -->
          <div class="image-upload-area" v-if="uploadedImages.length > 0">
            <div
              v-for="(image, index) in uploadedImages"
              :key="index"
              class="image-item"
            >
              <img :src="image" alt="上传的图片" />
              <div class="image-remove" @click="removeImage(index)">
                <el-icon :size="16">
                  <Close />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 字数统计 -->
          <div class="char-count">
            <span :class="{ 'over-limit': content.length > 200 }">{{ content.length }}</span>
            <span class="limit-text">/200</span>
          </div>
        </div>
      </div>

      <div class="text-container">
        <!-- @提及区域 -->
        <MentionSection 
          :mentioned-users="mentionedUsers" 
          @open-modal="openMentionModal" 
        />

        <!-- 匿名提问 -->
        <div v-if="isAnonymousAllowed" class="anonymous-section white-block">
          <img src="../../assets/images/icon/anonymous.png" alt="匿名提问" class="action-icon" />
          <span class="anonymous-label">匿名提问</span>
          <el-switch v-model="isAnonymous" />
        </div>
        
        <!-- 强制实名提示 -->
        <!-- <div v-else class="anonymous-section white-block forced-real-name">
          <img src="../../assets/images/icon/anonymous.png" alt="实名提问" class="action-icon" />
          <span class="anonymous-label">实名提问</span>
          <span class="forced-tip">所选部门/人员要求实名</span>
        </div> -->
      </div>

      <!-- 话题标签 -->
      <div class="topic-tags-wrapper" v-if="selectedTopics.length > 0">
        <div class="topic-tags-scroll">
          <div
            v-for="(topic, index) in selectedTopics"
            :key="index"
            class="topic-tag"
          >
            <span class="tag-icon">#</span>
            <span class="tag-text">{{ topic }}</span>
            <div class="tag-close" @click="removeTopic(index)">
              <el-icon :size="12">
                <Close />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部固定区域 -->
    <BottomToolbar 
      :is-keyboard-active="isKeyboardActive"
      @upload-image="uploadImage"
      @open-topic-modal="openTopicModal"
    />

    <!-- @提及弹窗 -->
    <MentionModal
      :show="showMentionModal"
      :departments="departments"
      :selected-members="selectedMembers"
      @close="showMentionModal = false"
      @complete="handleMentionComplete"
    />

    <!-- 添加话题弹窗 -->
    <TopicModal
      :show="showTopicModal"
      :topics="topics"
      @close="showTopicModal = false"
      @select="addTopic"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Close
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CategorySelector from '@/components/publish/CategorySelector.vue'
import MentionSection from '@/components/publish/MentionSection.vue'
import BottomToolbar from '@/components/publish/BottomToolbar.vue'
import MentionModal from '@/components/publish/MentionModal.vue'
import TopicModal from '@/components/publish/TopicModal.vue'
import { getDepartmentTree, type DepartmentInfo } from '@/api/department'
import { getTopicList, type Topic } from '@/api/topic'
import { createQuestion, updateQuestion, getQuestionDetail, type CreateQuestionData, type UpdateQuestionData } from '@/api/question'
import { uploadImages } from '@/api/upload'

const router = useRouter()
const route = useRoute()

// 编辑模式
const isEditMode = ref(false)
const editQuestionId = ref<number>()

// 问题类型映射
const categoryMap: Record<string, string> = {
  'free': '自由提问',
  'help': '求助类',
  'suggest': '建议类',
  'complain': '吐槽类'
}

// 反向映射：从中文到英文
const categoryReverseMap: Record<string, string> = {
  '自由提问': 'free',
  '求助类': 'help',
  '建议类': 'suggest',
  '吐槽类': 'complain'
}

// 问题类型
const categories = [
  { id: 'free', name: '自由提问' },
  { id: 'help', name: '求助类' },
  { id: 'suggest', name: '建议类' },
  { id: 'complain', name: '吐槽类' }
]

// 表单数据
const selectedCategory = ref('free')
const title = ref('')
const content = ref('')
const uploadedImages = ref<string[]>([])
const isAnonymous = ref(false)
const isAnonymousAllowed = ref(true)  // 是否允许匿名
const mentionedUsers = ref<string[]>([])
const selectedTopics = ref<string[]>([])

// 弹窗控制
const showMentionModal = ref(false)
const showTopicModal = ref(false)

// 打开@提及弹窗
const openMentionModal = () => {
  showMentionModal.value = true
  // 如果还没有加载过部门数据，则加载
  if (departments.value.length === 0) {
    loadDepartments()
  }
}

// 打开话题弹窗
const openTopicModal = () => {
  showTopicModal.value = true
  // 如果还没有加载过话题数据，则加载
  if (topics.value.length === 0) {
    loadTopics()
  }
}
// 键盘状态
const isKeyboardActive = ref(false)
const titleInput = ref<HTMLTextAreaElement>()
const contentInput = ref<HTMLTextAreaElement>()

// 部门数据
const departments = ref<DepartmentInfo[]>([])
// 选中的成员
const selectedMembers = ref<Map<string, Set<string>>>(new Map())

// 话题数据
const topics = ref<Topic[]>([])

// 加载部门树数据
const loadDepartments = async () => {
  try {
    const res = await getDepartmentTree()
    if (res.code === 200) {
      departments.value = res.data.departments
    } else {
      ElMessage.error(res.message || '获取部门数据失败')
    }
  } catch (error) {
    console.error('获取部门数据失败:', error)
    ElMessage.error('获取部门数据失败')
  }
}

// 加载话题列表
const loadTopics = async () => {
  try {
    const res = await getTopicList(1, 100) // 获取前100个话题
    if (res.code === 200) {
      topics.value = res.data.items
    } else {
      ElMessage.error(res.message || '获取话题列表失败')
    }
  } catch (error) {
    console.error('获取话题列表失败:', error)
    ElMessage.error('获取话题列表失败')
  }
}
// 是否可以发布
const canPublish = computed(() => {
  return title.value.trim() !== '' && content.value.trim() !== ''
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 存储实际的图片文件
const imageFiles = ref<File[]>([])

// 上传图片
const uploadImage = () => {
  // 创建文件选择器
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    
    if (files) {
      Array.from(files).forEach(file => {
        if (uploadedImages.value.length >= 9) {
          ElMessage.warning('最多只能上传9张图片')
          return
        }
        
        // 验证文件大小（最大5MB）
        if (file.size > 5 * 1024 * 1024) {
          ElMessage.error(`图片 ${file.name} 超过5MB限制`)
          return
        }
        
        // 存储文件对象
        imageFiles.value.push(file)
        
        // 创建预览 URL
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            uploadedImages.value.push(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }
  
  input.click()
}

// 删除图片
const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
}

// 完成@提及选择
const handleMentionComplete = (members: string[], selectedMap: Map<string, Set<string>>, anonymousAllowed: boolean) => {
  mentionedUsers.value = members
  selectedMembers.value = selectedMap
  isAnonymousAllowed.value = anonymousAllowed
  
  // 如果不允许匿名，强制关闭匿名开关
  if (!anonymousAllowed) {
    isAnonymous.value = false
  }
  
  showMentionModal.value = false
}

// 添加话题
const addTopic = (topicName: string) => {
  if (!selectedTopics.value.includes(topicName) && selectedTopics.value.length < 3) {
    selectedTopics.value.push(topicName)
  }
  showTopicModal.value = false
}

// 删除话题
const removeTopic = (index: number) => {
  selectedTopics.value.splice(index, 1)
}

// 发布中状态
const isSubmitting = ref(false)

// 加载编辑数据
const loadEditData = async (questionId: number) => {
  try {
    const res = await getQuestionDetail(questionId)
    if (res.code === 200) {
      const data = res.data
      
      // 填充基本信息
      title.value = data.title
      content.value = data.content
      
      // 填充分类
      const categoryKey = categoryReverseMap[data.category] || 'free'
      selectedCategory.value = categoryKey
      
      // 填充匿名状态
      isAnonymous.value = data.is_anonymous === 1
      
      // 填充图片（如果有）
      if (data.images && data.images.length > 0) {
        uploadedImages.value = [...data.images]
        // 注意：编辑模式下，图片已经是URL，不需要重新上传
      }
      
      // 填充话题
      if (data.topics && data.topics.length > 0) {
        selectedTopics.value = data.topics.map(t => t.title)
      }
      
      // 填充@提及的部门和人员
      if (data.related_dept_ids || data.related_staff_codes) {
        // 需要先加载部门数据
        await loadDepartments()
        
        // 重建selectedMembers
        const newSelectedMembers = new Map<string, Set<string>>()
        
        if (data.related_dept_ids && data.related_dept_ids.length > 0) {
          data.related_dept_ids.forEach(deptId => {
            if (!newSelectedMembers.has(String(deptId))) {
              newSelectedMembers.set(String(deptId), new Set())
            }
          })
        }
        
        if (data.related_staff_codes && data.related_staff_codes.length > 0) {
          // 这里简化处理，将员工放在第一个部门下
          // 实际应该根据员工所属部门来分配
          data.related_staff_codes.forEach(staffCode => {
            const firstDeptId = data.related_dept_ids?.[0]
            if (firstDeptId) {
              const deptKey = String(firstDeptId)
              if (!newSelectedMembers.has(deptKey)) {
                newSelectedMembers.set(deptKey, new Set())
              }
              newSelectedMembers.get(deptKey)?.add(staffCode)
            }
          })
          
          // 更新mentionedUsers显示
          mentionedUsers.value = data.related_staff_codes
        }
        
        selectedMembers.value = newSelectedMembers
      }
    } else {
      ElMessage.error(res.message || '加载问题数据失败')
      router.back()
    }
  } catch (error) {
    console.error('加载问题数据失败:', error)
    ElMessage.error('加载问题数据失败')
    router.back()
  }
}

// 提交发布或编辑
const handleSubmit = async () => {
  if (!canPublish.value || isSubmitting.value) {
    return
  }

  try {
    isSubmitting.value = true

    // 1. 处理图片上传
    let imageUrls: string[] = []
    
    if (isEditMode.value) {
      // 编辑模式：区分已有URL和新上传的文件
      const existingUrls: string[] = []
      const newFiles: File[] = []
      
      uploadedImages.value.forEach((img, index) => {
        if (img.startsWith('http://') || img.startsWith('https://')) {
          // 已有的URL
          existingUrls.push(img)
        } else {
          // 新上传的文件（base64）
          if (imageFiles.value[index]) {
            newFiles.push(imageFiles.value[index])
          }
        }
      })
      
      // 上传新文件
      if (newFiles.length > 0) {
        const uploadRes = await uploadImages(newFiles)
        if (uploadRes.code === 200 && uploadRes.data.image_urls) {
          imageUrls = [...existingUrls, ...uploadRes.data.image_urls]
        } else {
          ElMessage.error('图片上传失败')
          return
        }
      } else {
        imageUrls = existingUrls
      }
    } else {
      // 新建模式：上传所有图片
      if (imageFiles.value.length > 0) {
        const uploadRes = await uploadImages(imageFiles.value)
        if (uploadRes.code === 200 && uploadRes.data.image_urls) {
          imageUrls = uploadRes.data.image_urls
        } else {
          ElMessage.error('图片上传失败')
          return
        }
      }
    }

    // 2. 提取部门ID和员工工号
    const relatedDeptIds: number[] = []
    const relatedStaffCodes: string[] = []
    
    selectedMembers.value.forEach((staffCodes, deptId) => {
      const deptIdNum = parseInt(deptId)
      if (!isNaN(deptIdNum)) {
        relatedDeptIds.push(deptIdNum)
      }
      staffCodes.forEach(code => {
        relatedStaffCodes.push(code)
      })
    })

    // 3. 获取话题ID（根据话题名称查找对应的ID）
    const topicIds: number[] = []
    selectedTopics.value.forEach(topicName => {
      const topic = topics.value.find(t => t.title === topicName)
      if (topic) {
        topicIds.push(topic.topic_id)
      }
    })

    // 4. 构建请求数据
    if (isEditMode.value && editQuestionId.value) {
      // 编辑模式
      const updateData: UpdateQuestionData = {
        title: title.value.trim(),
        content: content.value.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        category: categoryMap[selectedCategory.value] || '自由提问',
        related_dept_ids: relatedDeptIds.length > 0 ? relatedDeptIds : undefined,
        related_staff_codes: relatedStaffCodes.length > 0 ? relatedStaffCodes : undefined,
        topic_ids: topicIds.length > 0 ? topicIds : undefined
      }
      
      const res = await updateQuestion(editQuestionId.value, updateData)
      if (res.code === 200) {
        ElMessage.success('保存成功！')
        // 直接返回上一页（详情页），而不是跳转到新的详情页
        // 这样历史栈中不会有重复的详情页
        router.back()
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } else {
      // 新建模式
      const questionData: CreateQuestionData = {
        title: title.value.trim(),
        content: content.value.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        category: categoryMap[selectedCategory.value] || '自由提问',
        is_anonymous: isAnonymous.value ? 1 : 0,
        related_dept_ids: relatedDeptIds.length > 0 ? relatedDeptIds : undefined,
        related_staff_codes: relatedStaffCodes.length > 0 ? relatedStaffCodes : undefined,
        topic_ids: topicIds.length > 0 ? topicIds : undefined
      }

      const res = await createQuestion(questionData)
      if (res.code === 200) {
        ElMessage.success('发布成功！')
        // 跳转到首页
        router.push(`/home`)
      } else {
        ElMessage.error(res.message || '发布失败')
      }
    }
  } catch (error) {
    console.error(isEditMode.value ? '保存失败:' : '发布失败:', error)
    ElMessage.error(isEditMode.value ? '保存失败，请稍后重试' : '发布失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 输入框聚焦处理
const handleInputFocus = () => {
  isKeyboardActive.value = true
}

// 输入框失焦处理
const handleInputBlur = () => {
  // 延迟处理，避免点击其他元素时立即关闭
  setTimeout(() => {
    isKeyboardActive.value = false
  }, 100)
}

// 页面点击处理
const handlePageClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // 如果点击的不是输入框，则失焦
  if (!target.closest('textarea')) {
    titleInput.value?.blur()
    contentInput.value?.blur()
  }
}

// 监听窗口大小变化（键盘弹出/收起）
const handleResize = () => {
  // 可以根据窗口高度变化判断键盘状态
  // 这里简化处理，主要依赖 focus/blur 事件
}

// 生命周期
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  
  // 检查是否是编辑模式
  if (route.query.edit === '1' && route.query.id) {
    isEditMode.value = true
    editQuestionId.value = Number(route.query.id)
    
    // 加载问题数据
    await loadEditData(editQuestionId.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.publish-page {
  width: 100%;
  
  min-height: 100vh;
  background: #F5F5F5;
  overflow-x: hidden;
  padding-bottom: 80px;
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
  border-bottom: 1px solid #F5F5F5;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333;
}

.header-title {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #1A1A1A;
  text-align: center;
}

.publish-btn {
  padding: 6px 20px;
  height: 32px;
  background: #FFDD00;
  color: #1A1A1A;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.publish-btn:active {
  transform: scale(0.95);
}

.publish-btn.disabled {
  background: #F7F7F7;
  color: #999;
  cursor: not-allowed;
}

/* 主内容区域 */
.main-content {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.text-container {
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* 白色区块 */
.white-block {
  background: #fff;
  /* border-radius: 8px; */
  padding: 12px;
}

/* 标题输入 */
.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #1A1A1A;
  line-height: 1.5;
  resize: none;
}

.title-input::placeholder {
  color: #CCCCCC;
}

/* 内容输入 */
.content-section {
  position: relative;
}

.content-input {
  width: 100%;
  border: none;
  outline: none;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  line-height: 1.6;
  resize: none;
  margin-bottom: 12px;
}

.content-input::placeholder {
  color: #CCCCCC;
}

/* 图片上传区域 */
.image-upload-area {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

/* 字数统计 */
.char-count {
  text-align: right;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
}

.char-count .over-limit {
  color: #FF3B30;
}

.char-count .limit-text {
  color: #999;
}

/* 匿名提问 */
.action-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.anonymous-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.anonymous-label {
  flex: 1;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  text-align: left;
}

/* 强制实名 */
.forced-real-name {
  opacity: 0.6;
}

.forced-tip {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

/* 话题标签区域 */
.topic-tags-wrapper {
  padding: 0 16px;
  margin-top: 12px;
  margin-bottom: 80px;
}

.topic-tags-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0;
}

.topic-tags-scroll::-webkit-scrollbar {
  display: none;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  background: #FFFFFF;
  border: 1px solid rgba(255, 221, 0, 0.3);
  border-radius: 16px;
  font-family: PingFang SC, PingFang SC;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}

.tag-icon {
  color: #FFDD00;
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
}

.tag-text {
  font-size: 12px;
  font-weight: 400;
  color: #88662F;
  line-height: 1;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #88662F;
  margin-left: 4px;
  padding: 0;
  line-height: 1;
}

.tag-close:active {
  color: #666;
}

</style>
