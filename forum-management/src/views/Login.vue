<template>
  <div class="login-page">
    <div class="login-card">
      <div class="card-title">
        <span class="title-line left" />
        <span class="title-text">欢迎登录</span>
        <span class="title-line right" />
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="job_no">
          <el-input
            v-model.trim="form.job_no"
            size="large"
            placeholder="请输入工号"
            :prefix-icon="Memo"
            style="font-size: 16px;"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password" style="margin-top: 40px;">
          <el-input
            v-model="form.password"
            size="large"
            type="password"
            show-password
            placeholder="请输入密码"
            :prefix-icon="Lock"
            style="font-size: 16px;"
          />
        </el-form-item>
        <el-button
          type="primary"
          class="login-button"
          size="large"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Memo, Lock } from '@element-plus/icons-vue'
import { adminLogin } from '@/api'
import { setGwSession } from '@/utils/request'

const APP_ID = '500883957'
const formRef = ref()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  job_no: '',
  password: ''
})

const rules = {
  job_no: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const buildGwSession = (payload) => {
  const parts = [
    `appid=${APP_ID}`,
    `name=${payload?.name ?? ''}`,
    `department=${payload?.department ?? ''}`,
    `orgId=${payload?.orgId ?? ''}`,
    `jobTitle=${payload?.jobTitle ?? ''}`,
    `gender=${payload?.gender ?? ''}`,
    `status=${payload?.status ?? ''}`,
    `jobNo=${payload?.jobNo ?? form.job_no}`
  ]
  return encodeURIComponent(parts.join(','))
}

const handleLogin = () => {
  if (loading.value) return
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await adminLogin({
        job_no: form.job_no,
        password: form.password
      })
      if (res?.code === 200 && res.data) {
        const session = buildGwSession(res.data)
        setGwSession(session)
        ElMessage.success('登录成功')
        router.replace('/dashboard')
        return
      }
      ElMessage.error(res?.detail || '登录失败')
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  background: url('@/assets/background.png') no-repeat center center;
  background-size: cover;
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.background-cubes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cube {
  position: absolute;
  display: block;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  filter: blur(0.5px);
}

.cube-1 {
  width: 240px;
  height: 180px;
  bottom: 12%;
  left: 8%;
}

.cube-2 {
  width: 160px;
  height: 140px;
  bottom: 20%;
  right: 12%;
}

.cube-3 {
  width: 96px;
  height: 96px;
  bottom: 6%;
  left: 22%;
}

.login-card {
  width: 600px;
  height: 462px;
  background: #ffffff;
  border-radius: 16px;
  position: relative;
  z-index: 2;
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.card-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 40px;
}

.title-text {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.title-line {
  width: 180px;
  height: 2px;
  border-radius: 0;
  background: linear-gradient(90deg, rgba(204,204,204,0) 0%, rgba(204,204,204,0.5) 100%);
}

.title-line.right {
  transform: rotate(180deg);
}

.login-button {
  width: 100%;
  height: 60px;
  margin-top: 60px;
  background: #ff7a00;
  border-color: #ff7a00;
  font-size: 18px;
  letter-spacing: 2px;
}

.login-button:hover,
.login-button:focus {
  background: #ff8f1a;
  border-color: #ff8f1a;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  height: 60px;
  padding-left: 16px;
  padding-right: 16px;
}

.login-form :deep(.el-input__inner) {
  height: 100%;
}
</style>

