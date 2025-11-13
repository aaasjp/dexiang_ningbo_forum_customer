<template>
  <FormDialog
    v-model="visible"
    :title="title"
    :form-data="formData"
    :rules="formRules"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #form="{ formData }">
      <el-form-item label="行为" prop="action">
        <el-select 
          v-model="formData.action" 
          placeholder="被评为精选问答"
          clearable
        >
          <el-option label="发布问题" value="发布问题" />
          <el-option label="发布回复" value="发布回复" />
          <el-option label="被评为精选问答" value="被评为精选问答" />
          <el-option label="点赞" value="点赞" />
          <el-option label="收藏" value="收藏" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="积分值" prop="points">
        <el-input 
          v-model.number="formData.points" 
          placeholder="请输入积分"
          type="number"
        />
      </el-form-item>
    </template>
  </FormDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import FormDialog from './FormDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '新增'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formData = ref({
  action: '',
  points: null
})

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal && props.data) {
    formData.value = { ...props.data }
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const formRules = {
  action: [
    { required: true, message: '请选择行为', trigger: 'change' }
  ],
  points: [
    { required: true, message: '请输入积分值', trigger: 'blur' },
    { type: 'number', message: '积分值必须是数字', trigger: 'blur' }
  ]
}

const handleConfirm = (data) => {
  emit('confirm', data)
}

const handleCancel = () => {
  visible.value = false
}

const handleClose = () => {
  formData.value = {
    action: '',
    points: null
  }
}
</script>



