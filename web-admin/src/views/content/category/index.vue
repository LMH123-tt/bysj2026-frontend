<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['content:category:add']">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="categoryList">
      <el-table-column label="ID" align="center" prop="categoryId" width="60" />
      <el-table-column label="分类名称" align="center" prop="categoryName" />
      <el-table-column label="排序" align="center" prop="orderNum" width="80" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">{{ scope.row.status === '0' ? '正常' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:category:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:category:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogOpen" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.orderNum" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listCategory, getCategory, addCategory, updateCategory, delCategory } from '@/api/content/content'

const loading = ref(false)
const categoryList = ref([])
const dialogOpen = ref(false)
const dialogTitle = ref('')
const showSearch = ref(true)
const form = ref({})
const queryParams = ref({ categoryName: undefined })

const getList = () => {
  loading.value = true
  listCategory(queryParams.value).then(res => {
    categoryList.value = res.rows || res.data || []
    loading.value = false
  })
}

const handleQuery = () => { getList() }
const resetQuery = () => { queryParams.value = { categoryName: undefined }; getList() }

const resetForm = () => {
  form.value = { categoryId: undefined, categoryName: '', orderNum: 0, status: '0' }
}

const handleAdd = () => { resetForm(); dialogTitle.value = '新增分类'; dialogOpen.value = true }
const handleUpdate = (row) => {
  getCategory(row.categoryId).then(res => {
    form.value = res.data
    dialogTitle.value = '修改分类'
    dialogOpen.value = true
  })
}

const submitForm = () => {
  if (!form.value.categoryName) { ElMessage.warning('请输入分类名称'); return }
  const req = form.value.categoryId ? updateCategory : addCategory
  req(form.value).then(() => {
    ElMessage.success('操作成功')
    dialogOpen.value = false
    getList()
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('是否确认删除分类"' + row.categoryName + '"？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delCategory(row.categoryId)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

onMounted(() => { getList() })
</script>
