<template>
  <FormDialog
    v-model="visible"
    title="编辑"
    :form-data="formData"
    :rules="formRules"
    width="520px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #form="{ formData }">
      <el-form-item label="所属话题" prop="topicIds" label-position="top">
        <el-select
          v-model="formData.topicIds"
          multiple
          filterable
          placeholder="请选择话题（最多5个）"
          style="width: 100%; height: 40px;"
          :max-collapse-tags="5"
          @change="handleTopicChange"
        >
          <el-option
            v-for="topic in topicList"
            :key="topic.topic_id"
            :label="'#' + topic.title"
            :value="topic.topic_id"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>#{{ topic.title }}</span>
              <span style="font-size: 12px; color: #999;">{{ topic.question_count || 0 }}讨论</span>
            </div>
          </el-option>
        </el-select>
        <div class="hint-text">最多选择5个话题</div>
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getTopicsList } from '@/api/topics'
import { updateQuestionTopics } from '@/api/content'
import { ElMessage } from 'element-plus'
import FormDialog from './FormDialog.vue'

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

// 表单数据
const formData = ref({
  topicIds: []
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
  if (props.data) {
    // 初始化话题（与 ContentFormDialog 保持一致）
    if (props.data.topics && props.data.topics.length > 0) {
      formData.value.topicIds = props.data.topics.map(t => t.topic_id)
    } else {
      formData.value.topicIds = []
    }
  } else {
    formData.value.topicIds = []
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

// 处理话题选择变化
const handleTopicChange = (value) => {
  if (value.length > 5) {
    formData.value.topicIds = value.slice(0, 5)
  }
}

// 表单验证规则（话题可以为空，表示移除所有话题）
const formRules = {
  topicIds: []
}

// 确认
const handleConfirm = async () => {
  try {
    // 使用新的 API 接口提交
    if (props.data && props.data.question_id) {
      await updateQuestionTopics(props.data.question_id, formData.value.topicIds)
      ElMessage.success('更新话题成功')
      emit('confirm')
    } else {
      ElMessage.error('问题ID不存在')
    }
  } catch (error) {
    console.error('更新话题失败:', error)
    ElMessage.error('更新话题失败')
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 关闭时重置
const handleClose = () => {
  formData.value.topicIds = []
}
</script>

<style scoped>
.hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
</style>

