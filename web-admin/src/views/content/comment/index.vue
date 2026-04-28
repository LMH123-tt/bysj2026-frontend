<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="内容标题" prop="contentTitle">
        <el-input v-model="queryParams.contentTitle" placeholder="请输入" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['content:comment:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="commentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="commentId" width="60" />
      <el-table-column label="内容" align="center" prop="contentTitle" :show-overflow-tooltip="true" />
      <el-table-column label="评论内容" align="center" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="评论人" align="center" prop="nickName" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">{{ scope.row.status === '0' ? '正常' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="100">
        <template #default="scope">
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:comment:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listComment, delComment } from '@/api/content/content'

const loading = ref(false)
const commentList = ref([])
const total = ref(0)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const queryParams = ref({ pageNum: 1, pageSize: 10, contentTitle: undefined })

const getList = () => {
  loading.value = true
  listComment(queryParams.value).then(res => {
    commentList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { queryParams.value = { pageNum: 1, pageSize: 10, contentTitle: undefined }; getList() }

const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.commentId)
  multiple.value = !selection.length
}

const handleDelete = (row) => {
  const commentIds = row.commentId || ids.value
  ElMessageBox.confirm('是否确认删除？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delComment(commentIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

onMounted(() => { getList() })
</script>
