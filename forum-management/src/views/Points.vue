<template>
  <div class="points-management">
    <!-- 页面标题 -->
    <h2 class="page-title">积分规则</h2>

    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 标题和操作按钮 -->
      <div class="header-section">
        <h3 class="section-title">积分列表</h3>
        <!-- <div class="create-points-btn" @click="handleAdd">新增</div> -->
      </div>

      <!-- 表格 -->
      <div class="table-section">
        <el-table :data="pointsRulesList" style="width: 100%" class="content-table">
          <el-table-column prop="sequence" label="序号" width="200" align="center" />
          <el-table-column prop="action" label="行为" min-width="300" />
          <el-table-column prop="points" label="积分值" width="300" align="center" />
          <el-table-column label="操作" width="300" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
                <el-dropdown popper-class="dark-dropdown" @command="handleCommand($event, row)">
                  <el-icon class="more-icon"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, prev, pager, next, sizes"
          class="custom-pagination"
        />
      </div>
    </div>

    <!-- 积分规则表单弹框 -->
    <PointsFormDialog
      v-model="showFormDialog"
      :title="isEdit ? '编辑' : '新增'"
      :data="currentEditData"
      @confirm="handleFormConfirm"
    />

    <!-- 删除确认弹框 -->
    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      title="删除积分规则"
      message="确定删除该积分规则吗？"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import { getRewardRulesList, createRewardRule, updateRewardRule, deleteRewardRule } from '@/api/points'
import PointsFormDialog from '../components/PointsFormDialog.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import { ElMessage } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const pointsRulesList = ref([])
const loading = ref(false)

// 表单弹框相关
const showFormDialog = ref(false)
const isEdit = ref(false)
const currentEditData = ref({})

// 删除弹框相关
const showDeleteDialog = ref(false)
const currentDeleteRow = ref(null)

// 获取积分规则列表
const fetchPointsRulesList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    const res = await getRewardRulesList(params)
    
    if (res.data && res.data.items) {
      pointsRulesList.value = res.data.items.map((item, index) => ({
        id: item.rule_id,
        sequence: (currentPage.value - 1) * pageSize.value + index + 1,
        action: item.rule_name,
        points: item.points,
        ruleCode: item.rule_code,
        description: item.rule_description,
        originalData: item
      }))
      
      total.value = res.data.total || res.data.items.length
    }
  } catch (error) {
    console.error('获取积分规则列表失败:', error)
    ElMessage.error('获取积分规则列表失败')
  } finally {
    loading.value = false
  }
}

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchPointsRulesList()
})

// 新增
// const handleAdd = () => {
//   isEdit.value = false
//   currentEditData.value = {}
//   showFormDialog.value = true
// }

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  currentEditData.value = { 
    action: row.action,
    points: row.points,
    ruleId: row.id
  }
  showFormDialog.value = true
}

// 表单提交
const handleFormConfirm = async (data) => {
  try {
    if (isEdit.value) {
      // 编辑逻辑
      await updateRewardRule(currentEditData.value.ruleId, {
        points: data.points,
        rule_description: data.action
      })
      ElMessage.success('编辑成功')
    } else {
      // 新增逻辑
      await createRewardRule({
        rule_name: data.action,
        rule_code: data.action.toLowerCase().replace(/\s+/g, '_'),
        points: data.points,
        rule_description: data.action
      })
      ElMessage.success('新增成功')
    }
    showFormDialog.value = false
    fetchPointsRulesList()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 下拉菜单命令
const handleCommand = (command, row) => {
  if (command === 'delete') {
    currentDeleteRow.value = row
    showDeleteDialog.value = true
  }
}

// 删除确认
const handleDeleteConfirm = async () => {
  if (!currentDeleteRow.value) return
  
  try {
    await deleteRewardRule(currentDeleteRow.value.id)
    ElMessage.success('删除成功')
    showDeleteDialog.value = false
    currentDeleteRow.value = null
    fetchPointsRulesList()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPointsRulesList()
})
</script>

<style scoped>
.points-management {
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
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.create-points-btn {
  width: 120px;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(90deg, #FFBD39 0%, #FF7800 100%);
  border-radius: 4px;
  font-weight: 400;
  font-size: 14px;
  color: #FFFFFF;
  text-align: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.3s;
}

.create-points-btn:hover {
  opacity: 0.9;
}

.create-points-btn:active {
  opacity: 0.8;
}

.pagination {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>


