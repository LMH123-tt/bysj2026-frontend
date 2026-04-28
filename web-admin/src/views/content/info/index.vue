<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option label="已发布" value="0" />
          <el-option label="待审核" value="1" />
          <el-option label="已驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="contentType">
        <el-select v-model="queryParams.contentType" placeholder="请选择" clearable>
          <el-option label="文章" value="1" />
          <el-option label="视频" value="2" />
          <el-option label="图片" value="3" />
          <el-option label="音频" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['content:info:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['content:info:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="contentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="contentId" width="60" />
      <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="类型" align="center" prop="contentType" width="80">
        <template #default="scope">
          <el-tag :type="contentTypeTag(scope.row.contentType)">{{ contentTypeLabel(scope.row.contentType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="作者" align="center" prop="author" width="100" />
      <el-table-column label="分类" align="center" prop="categoryName" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <dict-tag :options="content_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="浏览" align="center" prop="viewCount" width="70" />
      <el-table-column label="点赞" align="center" prop="likeCount" width="70" />
      <el-table-column label="推荐" align="center" prop="isRecommended" width="70">
        <template #default="scope">
          <el-switch v-model="scope.row.isRecommended" active-value="1" inactive-value="0" @change="handleRecommend(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="置顶" align="center" prop="isTop" width="70">
        <template #default="scope">
          <el-switch v-model="scope.row.isTop" active-value="1" inactive-value="0" @change="handleTop(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:info:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:info:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listContent, delContent, updateContent } from '@/api/content/content'

const { proxy } = getCurrentInstance()
const { content_status } = proxy.useDict('content_status')

const loading = ref(false)
const contentList = ref([])
const total = ref(0)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)

const queryParams = ref({ pageNum: 1, pageSize: 10, title: undefined, status: undefined, contentType: undefined })

const contentTypeLabel = (t) => ({ '1': '文章', '2': '视频', '3': '图片', '4': '音频' }[t] || '其他')
const contentTypeTag = (t) => ({ '1': '', '2': 'success', '3': 'warning', '4': 'danger' }[t] || 'info')

const getList = () => {
  loading.value = true
  listContent(queryParams.value).then(res => {
    contentList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { queryParams.value = { pageNum: 1, pageSize: 10, title: undefined, status: undefined, contentType: undefined }; getList() }

const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.contentId)
  multiple.value = !selection.length
}

const handleRecommend = (row) => {
  updateContent({ contentId: row.contentId, isRecommended: row.isRecommended }).then(() => {
    ElMessage.success('修改成功')
  })
}

const handleTop = (row) => {
  updateContent({ contentId: row.contentId, isTop: row.isTop }).then(() => {
    ElMessage.success('修改成功')
  })
}

const handleAdd = () => { proxy.$router.push('/content/info-edit') }
const handleUpdate = (row) => { proxy.$router.push('/content/info-edit?id=' + row.contentId) }

const handleDelete = (row) => {
  const contentIds = row.contentId || ids.value
  ElMessageBox.confirm('是否确认删除？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delContent(contentIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

onMounted(() => { getList() })
</script>
