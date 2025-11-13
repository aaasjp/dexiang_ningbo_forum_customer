<template>
  <div class="comment-input-bar">
    <input
      v-model="inputValue"
      type="text"
      class="comment-input"
      :placeholder="placeholder"
      @focus="onFocus"
      @keyup.enter="onSubmit"
    />
    <button 
      v-if="showSubmitBtn && inputValue.trim()" 
      class="submit-btn"
      @click="onSubmit"
    >
      发送
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({
  name: 'CommentInput'
})

interface Props {
  placeholder?: string
  modelValue?: string
  showSubmitBtn?: boolean  // 是否显示发送按钮
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'submit', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '快写下你的想法吧！',
  modelValue: '',
  showSubmitBtn: true
})

const emit = defineEmits<Emits>()

const inputValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const onFocus = () => {
  emit('focus')
}

const onSubmit = () => {
  if (inputValue.value.trim()) {
    emit('submit', inputValue.value.trim())
    inputValue.value = ''
  }
}
</script>

<style scoped>
.comment-input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.comment-input {
  flex: 1;
  padding: 8px 16px;
  background: #F7F7F7;
  border: none;
  border-radius: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #1A1A1A;
  outline: none;
}

.comment-input::placeholder {
  color: #999;
}

.submit-btn {
  padding: 8px 16px;
  background: #FFDD00;
  border: none;
  border-radius: 20px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1A1A1A;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.submit-btn:active {
  transform: scale(0.95);
}
</style>

