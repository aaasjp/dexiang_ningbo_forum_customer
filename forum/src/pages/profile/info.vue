<template>
  <div class="profile-info-page">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="back-btn" @click="goBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </div>
      <div class="header-title">编辑资料</div>
    </div>

    <!-- 头像编辑区 -->
    <div class="avatar-section" @click="goToAvatarEdit">
      <div class="avatar-wrapper">
        <img 
          v-if="avatarUrl" 
          :src="avatarUrl" 
          alt="头像" 
          class="avatar-image"
        />
        <div v-else class="avatar-placeholder">
          <span class="placeholder-text">{{ userNameLastTwo }}</span>
        </div>
        <div class="avatar-edit-icon">
          <img src="../../assets/images/profile/edit.png" alt="edit" />
        </div>
      </div>
    </div>

    <!-- 表单列表 -->
    <div class="form-container">
      <!-- 第一组：用户名和介绍 -->
      <div class="form-group">
        <!-- 用户名 -->
        <div class="form-item">
          <div class="form-label">用户名</div>
          <div class="form-value-left">
            <span class="value-text" style="color: #808080;">{{ username }}</span>
          </div>
        </div>

      </div>
      <!-- 第二组：一句话介绍自己 -->
      <div class="form-group">
        <!-- 一句话介绍自己 -->
        <div class="form-item" @click="startEditIntro">
          <div class="form-label" v-if="!intro">一句话介绍自己</div>
          <div class="form-value-left" v-if="intro">
            <span class="value-text">{{ intro }}</span>
          </div>
          <el-icon :size="16" class="arrow-icon">
            <Edit />
          </el-icon>
        </div>
      </div>
      <!-- 第三组：性别、生日、岗位 -->
      <div class="form-group">
        <!-- 性别 -->
        <div class="form-item form-item-disabled">
          <div class="form-label">性别</div>
          <div class="form-value-left">
            <span class="value-text">{{ genderText }}</span>
          </div>
        </div>

        <!-- 生日 -->
        <div class="form-item" @click="showBirthdayPicker">
          <div class="form-label">生日</div>
          <div class="form-value-left">
            <span class="value-text">{{ birthday || '请选择' }}</span>
          </div>
          <el-icon :size="16" class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </div>

        <!-- 岗位 -->
        <div class="form-item form-item-disabled">
          <div class="form-label">岗位</div>
          <div class="form-value-left">
            <span class="value-text">{{ position || '未设置' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 生日选择器弹窗 -->
    <div v-if="showBirthdayModal" class="modal-overlay" @click.self="showBirthdayModal = false">
      <div class="modal-content birthday-modal">
        <div class="modal-title">修改生日</div>
        <div class="date-picker">
          <div class="picker-column" ref="yearColumn">
            <!-- 上方占位 -->
            <div class="picker-item picker-placeholder"></div>
            <div 
              v-for="year in years" 
              :key="year"
              class="picker-item"
              :class="{ active: selectedYear === year }"
              :data-value="year"
              @click="selectYear(year)"
            >
              {{ year }}年
            </div>
            <!-- 下方占位 -->
            <div class="picker-item picker-placeholder"></div>
          </div>
          <div class="picker-column" ref="monthColumn">
            <!-- 上方占位 -->
            <div class="picker-item picker-placeholder"></div>
            <div 
              v-for="month in 12" 
              :key="month"
              class="picker-item"
              :class="{ active: selectedMonth === month }"
              :data-value="month"
              @click="selectMonth(month)"
            >
              {{ String(month).padStart(2, '0') }}月
            </div>
            <!-- 下方占位 -->
            <div class="picker-item picker-placeholder"></div>
          </div>
          <div class="picker-column" ref="dayColumn">
            <!-- 上方占位 -->
            <div class="picker-item picker-placeholder"></div>
            <div 
              v-for="day in daysInMonth" 
              :key="day"
              class="picker-item"
              :class="{ active: selectedDay === day }"
              :data-value="day"
              @click="selectDay(day)"
            >
              {{ String(day).padStart(2, '0') }}日
            </div>
            <!-- 下方占位 -->
            <div class="picker-item picker-placeholder"></div>
          </div>
        </div>
        <button class="modal-btn primary" @click="confirmBirthday">完成</button>
        <button class="modal-btn" @click="showBirthdayModal = false">取消</button>
      </div>
    </div>

    <!-- 性别选择器弹窗 -->
    <div v-if="showGenderModal" class="modal-overlay" @click.self="showGenderModal = false">
      <div class="modal-content gender-modal">
        <div class="modal-title">设置性别</div>
        <div class="modal-subtitle">每半年只能更改一次，上次修改时间：2025-06-01</div>
        <div class="gender-picker">
          <div class="picker-column" ref="genderColumn">
            <!-- 上方占位 -->
            <div class="picker-item picker-placeholder"></div>
            <!-- 性别选项 -->
            <div 
              v-for="option in genderOptions" 
              :key="option.value"
              class="picker-item"
              :class="{ active: tempGender === option.value }"
              :data-value="option.value"
              @click="selectGender(option.value)"
            >
              {{ option.label }}
            </div>
            <!-- 下方占位 -->
            <div class="picker-item picker-placeholder"></div>
          </div>
        </div>
        <button class="modal-btn primary" @click="confirmGender">完成</button>
        <button class="modal-btn" @click="showGenderModal = false">取消</button>
      </div>
    </div>

    <!-- 底部编辑输入框 -->
    <BottomEditInput
      v-model:visible="showBottomEdit"
      :title="editTitle"
      :placeholder="editPlaceholder"
      :model-value="editValue"
      :max-length="editMaxLength"
      @confirm="handleEditConfirm"
      @cancel="handleEditCancel"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Edit } from '@element-plus/icons-vue'
import { getUserProfile, updateUserProfile, type UpdateProfileData } from '../../api/user'
import BottomEditInput from '../../components/common/BottomEditInput.vue'

const router = useRouter()

// Refs for picker columns
const yearColumn = ref<HTMLElement>()
const monthColumn = ref<HTMLElement>()
const dayColumn = ref<HTMLElement>()
const genderColumn = ref<HTMLElement>()

// 表单数据
const username = ref('')
const intro = ref('')
const gender = ref<number>(1) // 1: 男, 2: 女 (默认为男)
const birthday = ref('')
const position = ref('')
const avatarUrl = ref('')

// 底部编辑输入框
const showBottomEdit = ref(false)
const editType = ref<'intro'>('intro')
const editTitle = ref('')
const editPlaceholder = ref('')
const editValue = ref('')
const editMaxLength = ref(50)

// 弹窗控制
const showBirthdayModal = ref(false)
const showGenderModal = ref(false)

// 生日选择器数据
const selectedYear = ref(2000)
const selectedMonth = ref(10)
const selectedDay = ref(1)

// 性别临时选择
const tempGender = ref(1)

// 性别选项（只有男女）
const genderOptions = [
  { value: 1, label: '男' },
  { value: 2, label: '女' }
]

// 计算属性
const genderText = computed(() => {
  return gender.value === 2 ? '女' : '男'
})

const userNameLastTwo = computed(() => {
  return username.value ? username.value.slice(-2) : '用户'
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const result = []
  for (let i = currentYear; i >= currentYear - 100; i--) {
    result.push(i)
  }
  return result
})

const daysInMonth = computed(() => {
  const days = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  return days
})

// 加载用户资料
const loadUserProfile = async () => {
  try {
    const res = await getUserProfile()
    if (res.data) {
      username.value = res.data.name || ''
      intro.value = res.data.self_introduction || ''
      // 性别：如果没有返回或为0，默认为男(1)
      gender.value = res.data.forum_gender && res.data.forum_gender !== 0 ? res.data.forum_gender : 1
      birthday.value = res.data.birthday || ''
      avatarUrl.value = res.data.forum_avatar || ''
      position.value = res.data.job_title || ''
    }
  } catch (error: any) {
    //ElMessage.error(error.message || '加载用户资料失败')
  }
}

// 更新用户资料
const updateProfile = async (data: UpdateProfileData) => {
  try {
    const res = await updateUserProfile(data)
    if (res.data) {
      //ElMessage.success('更新成功')
      // 更新本地数据
      if (data.self_introduction !== undefined) intro.value = data.self_introduction
      if (data.forum_gender !== undefined) gender.value = data.forum_gender
      if (data.birthday !== undefined) birthday.value = data.birthday
      if (data.forum_avatar !== undefined) avatarUrl.value = data.forum_avatar
    }
  } catch (error: any) {
    //ElMessage.error(error.message || '更新失败')
  }
}

// 方法
const goBack = () => {
  router.back()
}

// 跳转到头像编辑页面
const goToAvatarEdit = () => {
  router.push('/profile/avatar')
}

// 一句话介绍编辑
const startEditIntro = () => {
  editType.value = 'intro'
  editTitle.value = '一句话介绍自己'
  editPlaceholder.value = '一句话介绍自己'
  editValue.value = intro.value
  editMaxLength.value = 20
  showBottomEdit.value = true
}

// 处理编辑确认
const handleEditConfirm = async (value: string) => {
  if (editType.value === 'intro') {
    if (value !== intro.value) {
      await updateProfile({ self_introduction: value })
    }
  }
}

// 处理编辑取消
const handleEditCancel = () => {
  // 不需要做什么，组件会自动关闭
}

// 生日选择
const showBirthdayPicker = () => {
  if (birthday.value) {
    const [year, month, day] = birthday.value.split('-').map(Number)
    selectedYear.value = year || 2000
    selectedMonth.value = month || 1
    selectedDay.value = day || 1
  } else {
    const now = new Date()
    selectedYear.value = now.getFullYear() - 20
    selectedMonth.value = 1
    selectedDay.value = 1
  }
  
  showBirthdayModal.value = true
  
  // 等待 DOM 更新后滚动到选中位置
  nextTick(() => {
    scrollToSelected(yearColumn.value, selectedYear.value)
    scrollToSelected(monthColumn.value, selectedMonth.value)
    scrollToSelected(dayColumn.value, selectedDay.value)
    setupScrollListener(yearColumn.value, (value) => selectedYear.value = value)
    setupScrollListener(monthColumn.value, (value) => selectedMonth.value = value)
    setupScrollListener(dayColumn.value, (value) => selectedDay.value = value)
  })
}

const confirmBirthday = async () => {
  const newBirthday = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
  showBirthdayModal.value = false
  
  if (newBirthday !== birthday.value) {
    await updateProfile({ birthday: newBirthday })
  }
}

// 性别选择确认
const confirmGender = async () => {
  showGenderModal.value = false
  
  if (tempGender.value !== gender.value) {
    await updateProfile({ forum_gender: tempGender.value })
  }
}

// 点击选择年份
const selectYear = (year: number) => {
  selectedYear.value = year
  scrollToSelected(yearColumn.value, year, true)
}

// 点击选择月份
const selectMonth = (month: number) => {
  selectedMonth.value = month
  scrollToSelected(monthColumn.value, month, true)
}

// 点击选择日期
const selectDay = (day: number) => {
  selectedDay.value = day
  scrollToSelected(dayColumn.value, day, true)
}

// 点击选择性别
const selectGender = (value: number) => {
  tempGender.value = value
  scrollToSelected(genderColumn.value, value, true)
}

// 滚动到选中项
const scrollToSelected = (column: HTMLElement | undefined, value: any, smooth: boolean = false) => {
  if (!column) return
  
  const items = column.querySelectorAll('.picker-item:not(.picker-placeholder)')
  const targetItem = Array.from(items).find(item => {
    const itemValue = (item as HTMLElement).dataset.value
    return itemValue == value
  })
  
  if (targetItem) {
    const itemHeight = 40
    const containerHeight = 120
    const scrollTop = (targetItem as HTMLElement).offsetTop - (containerHeight / 2) + (itemHeight / 2)
    
    if (smooth) {
      // 使用平滑滚动
      column.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      })
    } else {
      // 直接跳转（用于初始化）
      column.scrollTop = scrollTop
    }
  }
}

// 设置滚动监听
const setupScrollListener = (column: HTMLElement | undefined, onChange: (value: any) => void) => {
  if (!column) return
  
  let scrollTimeout: number | undefined
  
  const handleScroll = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = window.setTimeout(() => {
      const containerHeight = 120
      const itemHeight = 40
      const scrollTop = column.scrollTop
      const centerPosition = scrollTop + containerHeight / 2
      
      const items = column.querySelectorAll('.picker-item:not(.picker-placeholder)')
      let closestItem: HTMLElement | null = null
      let minDistance = Infinity
      
      items.forEach(item => {
        const itemElement = item as HTMLElement
        const itemTop = itemElement.offsetTop
        const itemCenter = itemTop + itemHeight / 2
        const distance = Math.abs(itemCenter - centerPosition)
        
        if (distance < minDistance) {
          minDistance = distance
          closestItem = itemElement
        }
      })
      
      if (closestItem) {
        const value = (closestItem as HTMLElement).dataset.value
        if (value) {
          onChange(isNaN(Number(value)) ? value : Number(value))
        }
      }
    }, 100)
  }
  
  column.addEventListener('scroll', handleScroll)
}

// 页面加载时获取用户资料
onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.profile-info-page {
  width: 100%;
  background: #FFFFFF;
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

/* 头像编辑区 */
.avatar-section {
  background: #F5F5F5;
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
}

.avatar-image,
.avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder .placeholder-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 24px;
  color: #FFFFFF;
  user-select: none;
}

.avatar-edit-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit-icon img {
  display: block;
  width: 100%;
  height: 100%;
}
/* 表单容器 */
.form-container {
  padding: 0 16px;
}

/* 表单组 */
.form-group {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

/* 表单项 */
.form-item {
  display: flex;
  align-items: center;
  height: 46px;
  padding: 0 16px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.form-item:active {
  background: #FAFAFA;
}

.form-item-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-item-disabled:active {
  background: transparent;
}

.form-label {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #808080;
  min-width: 50px;
  flex-shrink: 0;
}

.form-value-left {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.value-text {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #1A1A1A;
}

.placeholder-text {
  color: #999;
}

.arrow-icon {
  color: #999;
  flex-shrink: 0;
  margin-left: auto;
}

/* 弹窗遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  
  padding: 24px 16px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
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

.modal-subtitle {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #999;
  text-align: center;
  margin-bottom: 24px;
}

.modal-btn {
  width: 100%;
  height: 46px;
  background: #F7F7F7;
  border: none;
  border-radius: 23px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
}

.modal-btn:active {
  transform: scale(0.95);
}

.modal-btn.primary {
  background: #FFDD00;
  color: #1A1A1A;
  font-weight: 500;
}

/* 生日选择器 */
.date-picker {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  height: 120px;
  overflow: hidden;
  position: relative;
}

/* 中间选中区域背景 */
.date-picker::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  background: #F5F5F5;
  z-index: 0;
  pointer-events: none;
}

.picker-column {
  flex: 1;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  position: relative;
  z-index: 1;
}

.picker-column::-webkit-scrollbar {
  display: none;
}

.picker-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  color: #808080;
  cursor: pointer;
  scroll-snap-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.picker-item:not(.picker-placeholder):active {
  transform: scale(0.95);
  color: #1A1A1A;
}

.picker-item.active {
  color: #1A1A1A;
  font-weight: 600;
  font-size: 18px;
}

/* 性别选择器 */
.gender-picker {
  display: flex;
  margin-bottom: 24px;
  height: 120px;
  overflow: hidden;
  position: relative;
}

/* 中间选中区域背景 */
.gender-picker::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  background: #F5F5F5;
  z-index: 0;
  pointer-events: none;
}

.gender-picker .picker-column {
  flex: 1;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  position: relative;
  z-index: 1;
}

.gender-picker .picker-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  color: #808080;
  cursor: pointer;
  scroll-snap-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.gender-picker .picker-item:not(.picker-placeholder):active {
  transform: scale(0.95);
  color: #1A1A1A;
}

.gender-picker .picker-item.active {
  color: #1A1A1A;
  font-weight: 600;
  font-size: 18px;
}

/* 占位项 */
.picker-placeholder {
  pointer-events: none;
  color: transparent !important;
}

</style>
