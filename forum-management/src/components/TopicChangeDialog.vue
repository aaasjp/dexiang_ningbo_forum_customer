<template>
  <el-dialog
    v-model="visible"
    title="编辑"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="topic-change-form" style="padding: 30px 0 80px 0;">
      <el-form-item label="更换所属话题" prop="topicId">
        <el-select
          v-model="formData.topicId"
          filterable
          placeholder="请选择所属话题"
          style="width: 100%; height: 40px;"
        >
          <el-option
            v-for="topic in topicList"
            :key="topic.topic_id"
            :label="topic.title"
            :value="topic.topic_id"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>{{ topic.title }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
        <el-button class="confirm-btn" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getTopicsList } from '@/api/topics'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  },
  currentTopicId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)

// 表单数据
const formData = ref({
  topicId: null
})

// 话题列表
const topicList = ref([])

// 监听弹窗显示
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    initFormData()
    loadTopics()
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 初始化表单数据
const initFormData = () => {
  if (props.data && props.data.topics && props.data.topics.length > 0) {
    // 如果问题有话题，默认选择第一个
    formData.value.topicId = props.data.topics[0].topic_id
  } else if (props.currentTopicId) {
    // 否则使用当前话题ID
    formData.value.topicId = props.currentTopicId
  } else {
    formData.value.topicId = null
  }
}

// 加载话题列表
const loadTopics = async () => {
  try {
    const res = await getTopicsList({ page: 1, page_size: 100 })
    if (res.data && res.data.items) {
      topicList.value = res.data.items
    }
  } catch (error) {
    console.error('获取话题列表失败:', error)
  }
}

// 表单验证规则
const formRules = {
  topicId: [
    { 
      required: true, 
      message: '请选择所属话题', 
      trigger: 'change'
    }
  ]
}

// 确认
const handleConfirm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      const result = {
        topic_ids: [formData.value.topicId]
      }
      emit('confirm', result)
      visible.value = false
    }
  })
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 关闭时重置
const handleClose = () => {
  formRef.value?.resetFields()
  formData.value.topicId = null
}
</script>

<style scoped>
/* 表单样式 */
.topic-change-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.topic-change-form :deep(.el-form-item__label) {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 8px;
  padding: 0;
}

.topic-change-form :deep(.el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before) {
  color: #ff4d4f;
  margin-right: 4px;
}

/* Select 选择器样式 */
.topic-change-form :deep(.el-select) {
  width: 100%;
}

.topic-change-form :deep(.el-select .el-input__wrapper) {
  height: 40px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #d9d9d9 inset;
  padding: 0 12px;
}

.topic-change-form :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #fa8c16 inset;
}

.topic-change-form :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #fa8c16 inset;
}

.topic-change-form :deep(.el-select .el-input__inner) {
  height: 38px;
  line-height: 38px;
  color: #1a1a1a;
  font-size: 14px;
}

.topic-change-form :deep(.el-select .el-input__inner::placeholder) {
  color: #bfbfbf;
}

.topic-change-form :deep(.el-select .el-input__suffix) {
  display: flex;
  align-items: center;
}

.topic-change-form :deep(.el-select .el-icon) {
  font-size: 14px;
  color: #999;
}

/* Dialog footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  width: 120px;
  height: 44px;
  background: #FAFAFA;
  border: none;
  color: #4D4D4D;
  border-radius: 4px;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #F0F0F0;
}

.confirm-btn {
  width: 120px;
  height: 44px;
  background: #FF7800;
  border: none;
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #FF8C1A;
}

.confirm-btn:active {
  background: #E66D00;
}
</style>

