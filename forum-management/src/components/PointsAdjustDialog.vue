<template>
  <FormDialog
    v-model="visible"
    title="积分调整"
    :form-data="formData"
    :rules="formRules"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #form="{ formData }">
      <el-form-item label="初始积分">
        <el-input 
          v-model="formData.initialPoints" 
          disabled
        />
      </el-form-item>
      
      <el-form-item label="积分值修改" prop="adjustPoints">
        <el-input 
          v-model.number="formData.adjustPoints" 
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
  initialPoints: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formData = ref({
  initialPoints: 0,
  adjustPoints: null
})

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    formData.value.initialPoints = props.initialPoints
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const formRules = {
  adjustPoints: [
    { required: true, message: '请输入积分值', trigger: 'blur' },
    { type: 'number', message: '积分值必须是数字', trigger: 'blur' }
  ]
}

const handleConfirm = (data) => {
  emit('confirm', {
    adjustPoints: data.adjustPoints,
    newPoints: data.initialPoints + data.adjustPoints
  })
}

const handleCancel = () => {
  visible.value = false
}

const handleClose = () => {
  formData.value = {
    initialPoints: 0,
    adjustPoints: null
  }
}
</script>



