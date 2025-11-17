<template>
  <div class="users-management">
    <!-- 页面标题 -->
    <h2 class="page-title">用户管理</h2>

    <!-- 白色背景区块 -->
    <div class="content-wrapper">
      <!-- 筛选区 -->
      <div class="filter-section">
        <el-select v-model="selectedDepartment" placeholder="请选择部门" style="width: 200px; height: 44px" class="custom-select">
          <el-option label="请选择部门" value="" />
          <el-option 
            v-for="dept in departments" 
            :key="dept.dept_id" 
            :label="dept.dept_name" 
            :value="dept.dept_id" 
          />
        </el-select>
        
        <el-select v-model="selectedRole" placeholder="选择标签" style="width: 200px; margin-left: 16px; height: 44px" class="custom-select">
          <el-option label="选择标签" value="" />
          <el-option 
            v-for="tag in userTags" 
            :key="tag.tag_id" 
            :label="tag.tag_name" 
            :value="tag.tag_id" 
          />
        </el-select>
        
        <el-button class="add-tag-btn" @click="openTagsDialog">
          <el-icon><Plus /></el-icon>
          添加标签
        </el-button>

        <el-input
          v-model="searchKeyword"
          placeholder="搜索关键词"
          style="width: 200px; margin-left: 16px; height: 44px"
          class="custom-input"
          clearable
        >
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 表格 -->
      <div class="table-section">
        <el-table :data="usersList" style="width: 100%" class="content-table">
          <el-table-column prop="sequence" label="序号" width="80" align="center" />
          <el-table-column prop="name" label="姓名" width="150" />
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="points" label="积分" width="120" align="center" />
          <el-table-column label="标签" width="200">
            <template #default="{ row }">
              <el-select v-model="row.roleId" size="small" @change="handleRoleChange(row)">
                <el-option 
                  v-for="tag in userTags" 
                  :key="tag.tag_id" 
                  :label="tag.tag_name" 
                  :value="tag.tag_id" 
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="150" align="center">
            <template #default="{ row }">
              <el-tooltip
                :content="row.status === 'active' ? '禁用' : '启用'"
                placement="top"
                effect="dark"
                popper-class="switch-tooltip"
              >
                <el-switch
                  v-model="row.status"
                  active-value="active"
                  inactive-value="inactive"
                  style="--el-switch-on-color: #fa8c16"
                  @change="handleStatusChange(row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="管理员" width="150" align="center">
            <template #default="{ row }">
              <el-tooltip
                :content="row.isAdmin ? '解除管理员' : '设为管理员'"
                placement="top"
                effect="dark"
                popper-class="switch-tooltip"
              >
                <el-switch
                  v-model="row.isAdmin"
                  style="--el-switch-on-color: #fa8c16"
                  @change="handleAdminChange(row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="小助手" width="150" align="center">
            <template #default="{ row }">
              <el-tooltip
                :content="row.isVirtualRole ? '取消小助手' : '设为小助手'"
                placement="top"
                effect="dark"
                popper-class="switch-tooltip"
              >
                <el-switch
                  v-model="row.isVirtualRole"
                  style="--el-switch-on-color: #fa8c16"
                  @change="handleVirtualRoleChange(row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="超级管理员" width="150" align="center">
            <template #default="{ row }">
              <el-tooltip
                :content="row.isSelf ? '不能操作自己' : (row.isSuperAdmin ? '取消超级管理员' : '设为超级管理员')"
                placement="top"
                effect="dark"
                popper-class="switch-tooltip"
              >
                <el-switch
                  v-model="row.isSuperAdmin"
                  :disabled="row.isSelf"
                  style="--el-switch-on-color: #fa8c16"
                  @change="handleSuperAdminChange(row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="warning" link @click="handleAdjustPoints(row)">调整积分</el-button>
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

    <!-- 标签管理弹框 -->
    <UserTagsDialog
      v-model="showTagsDialog"
      @refresh="handleTagsRefresh"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { getUsersList, updateForbiddenStatus, updateDeptAdminStatus, adjustStaffPoints, updateForumTag, updateVirtualRole, getUserTagsList, updateSuperAdminStatus, getCurrentUserProfile } from '@/api/users'
import { getDepartmentTree } from '@/api/department'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserTagsDialog from '../components/UserTagsDialog.vue'

const selectedDepartment = ref('')
const selectedRole = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const usersList = ref([])
const loading = ref(false)
const departments = ref([])
const userTags = ref([])
const showTagsDialog = ref(false)
const currentUserStaffCode = ref('') // 当前登录用户的工号

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'k'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return String(num)
}

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const res = await getDepartmentTree({})
    if (res.data && res.data.departments) {
      departments.value = res.data.departments
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 获取当前用户信息
const fetchCurrentUser = async () => {
  try {
    const res = await getCurrentUserProfile()
    if (res.data && res.data.staff_code) {
      currentUserStaffCode.value = res.data.staff_code
    }
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
  }
}

// 获取用户标签列表
const fetchUserTags = async () => {
  try {
    const res = await getUserTagsList({})
    if (res.data && res.data.items) {
      userTags.value = res.data.items
    }
  } catch (error) {
    console.error('获取用户标签列表失败:', error)
  }
}

// 打开标签管理弹框
const openTagsDialog = () => {
  showTagsDialog.value = true
}

// 标签更新后刷新
const handleTagsRefresh = () => {
  fetchUserTags()
}

// 获取用户列表
const fetchUsersList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    if (selectedDepartment.value) {
      params.dept_id = selectedDepartment.value
    }
    
    if (selectedRole.value) {
      params.tag_id = selectedRole.value
    }
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    
    const res = await getUsersList(params)
    
    if (res.data && res.data.items) {
      usersList.value = res.data.items.map((item, index) => ({
        id: item.staff_id,
        sequence: (currentPage.value - 1) * pageSize.value + index + 1,
        staffCode: item.staff_code,
        name: item.name,
        department: item.departments && item.departments.length > 0 
          ? item.departments[0].dept_name 
          : '-',
        points: formatNumber(item.total_points || 0),
        roleId: item.tag_id || null, // 使用 tag_id 作为角色标识
        roleName: item.forum_tag || '普通用户', // 保留名称用于显示
        isAdmin: item.role === 1 || item.role === 2, // 1=部门管理员, 2=超级管理员
        isVirtualRole: item.is_virtual, // 是否为小助手
        isSuperAdmin: item.role === 2, // 2=超级管理员
        isSelf: item.staff_code === currentUserStaffCode.value, // 是否是当前登录用户
        status: item.is_forbidden === 0 ? 'active' : 'inactive',
        originalData: item
      }))
      
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch([selectedDepartment, selectedRole, searchKeyword], () => {
  currentPage.value = 1
  fetchUsersList()
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchUsersList()
})

// 处理状态切换(禁用/启用)
const handleStatusChange = async (row) => {
  try {
    const isForbidden = row.status === 'inactive' ? 1 : 0
    await updateForbiddenStatus(row.staffCode, isForbidden)
    ElMessage.success(isForbidden === 1 ? '已禁用' : '已启用')
    fetchUsersList()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
    // 恢复原状态
    row.status = row.status === 'inactive' ? 'active' : 'inactive'
  }
}

// 处理管理员权限切换
const handleAdminChange = async (row) => {
  try {
    // 这里简化处理,实际需要知道用户所属部门
    if (row.originalData.departments && row.originalData.departments.length > 0) {
      const deptId = row.originalData.departments[0].dept_id
      const status = row.isAdmin ? 1 : 0
      await updateDeptAdminStatus(row.staffCode, deptId, status)
      ElMessage.success(row.isAdmin ? '已设为管理员' : '已取消管理员权限')
      fetchUsersList()
    } else {
      ElMessage.error('用户没有所属部门')
      row.isAdmin = !row.isAdmin
    }
  } catch (error) {
    console.error('更新管理员权限失败:', error)
    ElMessage.error('更新管理员权限失败')
    // 恢复原状态
    row.isAdmin = !row.isAdmin
  }
}

// 处理小助手权限切换
const handleVirtualRoleChange = async (row) => {
  try {
    const status = row.isVirtualRole ? 1 : 0
    let deptId = null
    
    // 如果用户有部门信息，使用第一个部门
    if (row.originalData.departments && row.originalData.departments.length > 0) {
      deptId = row.originalData.departments[0].dept_id
    }
    
    await updateVirtualRole(row.staffCode, status, deptId)
    ElMessage.success(row.isVirtualRole ? '已设为小助手' : '已取消小助手权限')
    fetchUsersList()
  } catch (error) {
    console.error('更新小助手权限失败:', error)
    ElMessage.error('更新小助手权限失败')
    // 恢复原状态
    row.isVirtualRole = !row.isVirtualRole
  }
}

// 处理超级管理员权限切换
const handleSuperAdminChange = async (row) => {
  // 不能操作自己
  if (row.isSelf) {
    ElMessage.warning('不能操作自己')
    row.isSuperAdmin = !row.isSuperAdmin
    return
  }
  
  try {
    const status = row.isSuperAdmin ? 1 : 0
    await updateSuperAdminStatus(row.staffCode, status)
    ElMessage.success(row.isSuperAdmin ? '已设为超级管理员' : '已取消超级管理员权限')
    fetchUsersList()
  } catch (error) {
    console.error('更新超级管理员权限失败:', error)
    ElMessage.error('更新超级管理员权限失败')
    // 恢复原状态
    row.isSuperAdmin = !row.isSuperAdmin
  }
}

// 处理角色变更
const handleRoleChange = async (row) => {
  const oldRoleId = row.originalData.tag_id
  const newRoleId = row.roleId
  
  if (oldRoleId === newRoleId) {
    return
  }
  
  // 查找新角色的名称用于显示
  const selectedTag = userTags.value.find(tag => tag.tag_id === newRoleId)
  if (!selectedTag) {
    ElMessage.error('未找到对应的标签')
    row.roleId = oldRoleId
    return
  }
  
  try {
    console.log('修改用户角色：', {
      staffCode: row.staffCode,
      oldRoleId,
      newRoleId,
      newRoleName: selectedTag.tag_name
    })
    
    await updateForumTag(row.staffCode, newRoleId)
    ElMessage.success(`角色已修改为：${selectedTag.tag_name}`)
    
    // 更新原始数据
    row.originalData.tag_id = newRoleId
    row.originalData.forum_tag = selectedTag.tag_name
    row.roleName = selectedTag.tag_name
  } catch (error) {
    console.error('修改角色失败:', error)
    ElMessage.error('修改角色失败')
    
    // 恢复原角色
    row.roleId = oldRoleId
  }
}

// 处理积分调整
const handleAdjustPoints = async (row) => {
  try {
    const currentPoints = row.originalData.total_points || 0
    const { value: newPoints } = await ElMessageBox.prompt(
      `当前积分：${currentPoints}，请输入新的积分值`, 
      '调整积分', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '请输入有效的积分值',
        inputValue: String(currentPoints)
      }
    )
    
    if (newPoints && newPoints !== String(currentPoints)) {
      try {
        console.log('调用积分调整接口：', {
          staffCode: row.staffCode,
          currentPoints,
          newPoints: parseInt(newPoints)
        })
        
        await adjustStaffPoints(row.staffCode, currentPoints, parseInt(newPoints))
        ElMessage.success('积分调整成功')
        await fetchUsersList()
      } catch (apiError) {
        console.error('积分调整接口调用失败:', apiError)
        ElMessage.error('积分调整失败')
      }
    } else if (newPoints === String(currentPoints)) {
      ElMessage.info('积分未变化')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('积分调整操作失败:', error)
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCurrentUser()
  fetchDepartments()
  fetchUserTags()
  fetchUsersList()
})
</script>

<style scoped>
.users-management {
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

.filter-section {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 自定义选择框样式 */
.custom-select :deep(.el-select__wrapper) {
  height: 44px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  padding-left: 11px !important;
}

.custom-select :deep(.el-input__wrapper) {
  height: 44px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  padding-left: 11px !important;
}

.custom-select :deep(.el-input__inner) {
  height: 42px !important;
  line-height: 42px !important;
}

.custom-select :deep(.el-input__prefix) {
  display: none !important;
}

.custom-select :deep(.el-input__suffix) {
  display: flex !important;
  align-items: center;
}

.custom-select :deep(.el-icon) {
  font-size: 14px !important;
  color: #999 !important;
}

/* 自定义输入框样式 */
.custom-input :deep(.el-input__wrapper) {
  height: 44px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

.custom-input :deep(.el-input__inner) {
  height: 42px !important;
  line-height: 42px !important;
}

/* 添加角色按钮样式 */
.add-tag-btn {
  height: 44px;
  margin-left: 8px;
  padding: 0 16px;
  background: linear-gradient(90deg, #FFBD39 0%, #FF7800 100%);
  border: none;
  border-radius: 4px;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;
}

.add-tag-btn:hover {
  opacity: 0.9;
}

.add-tag-btn :deep(.el-icon) {
  margin-right: 4px;
}
</style>


