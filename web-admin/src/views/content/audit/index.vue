<template>
  <div class="app-container">
    <el-row :gutter="16" class="audit-stats">
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card pending">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="32"><Clock /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card approved">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="32"><CircleCheck /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.approved }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card rejected">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="32"><CircleClose /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.rejected }}</div>
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card total">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="32"><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">内容总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" style="margin-top: 16px;">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="内容类型" prop="contentType">
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
        <el-button type="success" plain icon="Check" @click="handleBatchAudit('0')" :disabled="multiple">批量通过</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Close" @click="handleBatchAudit('2')" :disabled="multiple">批量驳回</el-button>
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
          <el-tag type="warning">待审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="success" icon="Check" @click="openAuditDialog(scope.row.contentId, '0')">通过</el-button>
          <el-button link type="danger" icon="Close" @click="openAuditDialog(scope.row.contentId, '2')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="viewTitle" v-model="viewOpen" width="700px" append-to-body>
      <div v-if="viewContent">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题">{{ viewContent.title }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ contentTypeLabel(viewContent.contentType) }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ viewContent.author }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ viewContent.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="标签">{{ viewContent.tags || '-' }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ viewContent.createTime }}</el-descriptions-item>
          <el-descriptions-item label="摘要" :span="2">{{ viewContent.summary || '-' }}</el-descriptions-item>
          <el-descriptions-item label="封面" :span="2" v-if="viewContent.coverImage">
            <el-image :src="viewContent.coverImage" style="max-width:300px;max-height:200px;" fit="contain" />
          </el-descriptions-item>
          <el-descriptions-item label="正文" :span="2" v-if="viewContent.contentType === '1'">
            <div style="max-height:300px;overflow-y:auto;white-space:pre-wrap;">{{ viewContent.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="媒体" :span="2" v-if="viewContent.sourceUrl && viewContent.contentType !== '1'">
            <video v-if="viewContent.contentType === '2'" :src="viewContent.sourceUrl" controls style="max-width:400px;" />
            <el-image v-else-if="viewContent.contentType === '3'" :src="viewContent.sourceUrl" style="max-width:400px;" fit="contain" />
            <audio v-else-if="viewContent.contentType === '4'" :src="viewContent.sourceUrl" controls />
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="viewOpen = false">取消</el-button>
        <el-button type="danger" @click="openAuditDialog(viewContent.contentId, '2'); viewOpen = false">驳回</el-button>
        <el-button type="success" @click="openAuditDialog(viewContent.contentId, '0'); viewOpen = false">通过</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="auditDialogTitle" v-model="auditDialogOpen" width="500px" append-to-body>
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-tag :type="auditForm.status === '0' ? 'success' : 'danger'" size="large">
            {{ auditForm.status === '0' ? '通过' : '驳回' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="auditForm.auditRemark" type="textarea" :rows="4" placeholder="请输入审核备注（驳回时建议填写原因）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogOpen = false">取 消</el-button>
        <el-button :type="auditForm.status === '0' ? 'success' : 'danger'" @click="confirmAudit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingList, getContent, auditContent, contentStats } from '@/api/content/content'

const loading = ref(false)
const contentList = ref([])
const total = ref(0)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const viewOpen = ref(false)
const viewTitle = ref('')
const viewContent = ref(null)
const auditDialogOpen = ref(false)
const auditDialogTitle = ref('')

const stats = ref({ pending: 0, approved: 0, rejected: 0, total: 0 })

const queryParams = ref({ pageNum: 1, pageSize: 10, title: undefined, contentType: undefined })

const auditForm = ref({ contentId: null, status: '0', auditRemark: '' })

const contentTypeLabel = (t) => ({ '1': '文章', '2': '视频', '3': '图片', '4': '音频' }[t] || '其他')
const contentTypeTag = (t) => ({ '1': '', '2': 'success', '3': 'warning', '4': 'danger' }[t] || 'info')

const getStats = () => {
  contentStats().then(res => {
    stats.value = res.data || { pending: 0, approved: 0, rejected: 0, total: 0 }
  }).catch(() => {})
}

const getList = () => {
  loading.value = true
  getPendingList(queryParams.value).then(res => {
    contentList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

const handleQuery = () => { queryParams.value.pageNum = 1; getList() }
const resetQuery = () => { queryParams.value = { pageNum: 1, pageSize: 10, title: undefined, contentType: undefined }; getList() }

const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.contentId)
  multiple.value = !selection.length
}

const handleView = (row) => {
  getContent(row.contentId).then(res => {
    viewContent.value = res.data
    viewTitle.value = '内容审核 - ' + row.title
    viewOpen.value = true
  })
}

const openAuditDialog = (contentId, status) => {
  auditForm.value = { contentId, status, auditRemark: '' }
  auditDialogTitle.value = status === '0' ? '审核通过' : '审核驳回'
  auditDialogOpen.value = true
}

const confirmAudit = () => {
  auditContent(auditForm.value.contentId, auditForm.value.status, auditForm.value.auditRemark).then(() => {
    ElMessage.success(auditForm.value.status === '0' ? '审核通过' : '已驳回')
    auditDialogOpen.value = false
    getList()
    getStats()
  })
}

const handleBatchAudit = (status) => {
  const msg = status === '0' ? `确认批量通过${ids.value.length}条内容？` : `确认批量驳回${ids.value.length}条内容？`
  ElMessageBox.confirm(msg, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    const promises = ids.value.map(id => auditContent(id, status, status === '0' ? '批量审核通过' : '批量审核驳回'))
    Promise.all(promises).then(() => {
      ElMessage.success('操作成功')
      getList()
      getStats()
    })
  }).catch(() => {})
}

onMounted(() => { getList(); getStats() })
</script>

<style scoped lang="scss">
.audit-stats {
  .stat-card {
    border-radius: 8px;
    overflow: hidden;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .stat-info {
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 13px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }

    &.pending .stat-icon { background: linear-gradient(135deg, #e6a23c, #f5c861); }
    &.pending .stat-number { color: #e6a23c; }
    &.approved .stat-icon { background: linear-gradient(135deg, #67c23a, #95d475); }
    &.approved .stat-number { color: #67c23a; }
    &.rejected .stat-icon { background: linear-gradient(135deg, #f56c6c, #fab6b6); }
    &.rejected .stat-number { color: #f56c6c; }
    &.total .stat-icon { background: linear-gradient(135deg, #409eff, #79bbff); }
    &.total .stat-number { color: #409eff; }
  }
}
</style>
