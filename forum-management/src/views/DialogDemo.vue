<template>
  <div class="dialog-demo">
    <h2 class="page-title">表单弹框演示</h2>

    <div class="content-wrapper">
      <h3 class="section-title">弹框组件演示</h3>
      
      <div class="demo-section">
        <h4 class="demo-title">1. 积分规则表单弹框</h4>
        <div class="demo-buttons">
          <el-button type="warning" @click="showPointsForm('add')">新增积分规则</el-button>
          <el-button type="warning" @click="showPointsForm('edit')">编辑积分规则</el-button>
        </div>
        <div class="demo-result" v-if="pointsFormResult">
          <strong>提交结果：</strong>
          <pre>{{ JSON.stringify(pointsFormResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">2. 积分调整弹框</h4>
        <div class="demo-buttons">
          <el-button type="warning" @click="showPointsAdjust">积分调整（初始9900分）</el-button>
        </div>
        <div class="demo-result" v-if="pointsAdjustResult">
          <strong>提交结果：</strong>
          <pre>{{ JSON.stringify(pointsAdjustResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">3. 话题表单弹框</h4>
        <div class="demo-buttons">
          <el-button type="warning" @click="showTopicForm('add')">创建新话题</el-button>
          <el-button type="warning" @click="showTopicForm('edit')">编辑话题</el-button>
        </div>
        <div class="demo-result" v-if="topicFormResult">
          <strong>提交结果：</strong>
          <pre>{{ JSON.stringify(topicFormResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">4. 内容编辑弹框</h4>
        <div class="demo-buttons">
          <el-button type="warning" @click="showContentForm">编辑内容</el-button>
        </div>
        <div class="demo-result" v-if="contentFormResult">
          <strong>提交结果：</strong>
          <pre>{{ JSON.stringify(contentFormResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">5. 删除确认弹框</h4>
        <div class="demo-buttons">
          <el-button type="danger" @click="showDeleteConfirm">删除确认</el-button>
        </div>
        <div class="demo-result" v-if="deleteConfirmed">
          <strong>结果：</strong> 用户已确认删除
        </div>
      </div>
    </div>

    <!-- 积分规则表单弹框 -->
    <PointsFormDialog
      v-model="dialogStates.pointsForm"
      :title="dialogTitles.pointsForm"
      :data="dialogData.pointsForm"
      @confirm="handlePointsFormConfirm"
    />

    <!-- 积分调整弹框 -->
    <PointsAdjustDialog
      v-model="dialogStates.pointsAdjust"
      :initial-points="9900"
      @confirm="handlePointsAdjustConfirm"
    />

    <!-- 话题表单弹框 -->
    <TopicFormDialog
      v-model="dialogStates.topicForm"
      :title="dialogTitles.topicForm"
      :data="dialogData.topicForm"
      @confirm="handleTopicFormConfirm"
    />

    <!-- 内容编辑弹框 -->
    <ContentFormDialog
      v-model="dialogStates.contentForm"
      :data="dialogData.contentForm"
      @confirm="handleContentFormConfirm"
    />

    <!-- 删除确认弹框 -->
    <DeleteConfirmDialog
      v-model="dialogStates.deleteConfirm"
      title="删除任务"
      message="确定删除该任务吗？"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import PointsFormDialog from '../components/PointsFormDialog.vue'
import PointsAdjustDialog from '../components/PointsAdjustDialog.vue'
import TopicFormDialog from '../components/TopicFormDialog.vue'
import ContentFormDialog from '../components/ContentFormDialog.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'

// 弹框显示状态
const dialogStates = reactive({
  pointsForm: false,
  pointsAdjust: false,
  topicForm: false,
  contentForm: false,
  deleteConfirm: false
})

// 弹框标题
const dialogTitles = reactive({
  pointsForm: '新增',
  topicForm: '创建新话题'
})

// 弹框数据
const dialogData = reactive({
  pointsForm: {},
  topicForm: {},
  contentForm: {}
})

// 结果展示
const pointsFormResult = ref(null)
const pointsAdjustResult = ref(null)
const topicFormResult = ref(null)
const contentFormResult = ref(null)
const deleteConfirmed = ref(false)

// 显示积分规则表单
const showPointsForm = (mode) => {
  if (mode === 'add') {
    dialogTitles.pointsForm = '新增'
    dialogData.pointsForm = {}
  } else {
    dialogTitles.pointsForm = '编辑'
    dialogData.pointsForm = {
      action: '发布问题',
      points: 30
    }
  }
  pointsFormResult.value = null
  dialogStates.pointsForm = true
}

const handlePointsFormConfirm = (data) => {
  pointsFormResult.value = data
}

// 显示积分调整弹框
const showPointsAdjust = () => {
  pointsAdjustResult.value = null
  dialogStates.pointsAdjust = true
}

const handlePointsAdjustConfirm = (data) => {
  pointsAdjustResult.value = data
}

// 显示话题表单
const showTopicForm = (mode) => {
  if (mode === 'add') {
    dialogTitles.topicForm = '创建新话题'
    dialogData.topicForm = {}
  } else {
    dialogTitles.topicForm = '编辑话题'
    dialogData.topicForm = {
      coverImage: '',
      topicName: '技术交流',
      description: '这是一个技术交流话题的描述内容'
    }
  }
  topicFormResult.value = null
  dialogStates.topicForm = true
}

const handleTopicFormConfirm = (data) => {
  topicFormResult.value = data
}

// 显示内容编辑弹框
const showContentForm = () => {
  dialogData.contentForm = {
    department: '销售部',
    topic: '银行知识'
  }
  contentFormResult.value = null
  dialogStates.contentForm = true
}

const handleContentFormConfirm = (data) => {
  contentFormResult.value = data
}

// 显示删除确认弹框
const showDeleteConfirm = () => {
  deleteConfirmed.value = false
  dialogStates.deleteConfirm = true
}

const handleDeleteConfirm = () => {
  deleteConfirmed.value = true
}
</script>

<style scoped>
.dialog-demo {
  width: 100%;
}

.page-title {
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  margin-bottom: 16px;
}

.content-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  min-height: calc(100vh - 120px);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
}

.demo-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.demo-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 16px 0;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.demo-result strong {
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.demo-result pre {
  margin: 0;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  overflow-x: auto;
}
</style>



