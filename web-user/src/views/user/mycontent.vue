<template>
  <div class="mobile-container">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">我的发布</span>
    </div>

    <div class="content-list" v-loading="loading">
      <div v-if="list.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无发布内容">
          <el-button type="primary" @click="$router.push('/publish')">去发布</el-button>
        </el-empty>
      </div>
      <div v-for="item in list" :key="item.contentId" class="content-card" @click="$router.push('/content/' + item.contentId)">
        <div class="card-body">
          <div class="card-info">
            <div class="card-title">{{ item.title }}</div>
            <div class="card-meta">
              <el-tag size="small" :type="getTypeTag(item.contentType)">{{ getTypeName(item.contentType) }}</el-tag>
              <el-tag size="small" :type="item.status === '0' ? 'success' : 'warning'">{{ item.status === '0' ? '已发布' : '待审核' }}</el-tag>
              <span class="views">{{ item.viewCount || 0 }} 次浏览</span>
            </div>
            <div class="card-time">{{ formatDate(item.createTime) }}</div>
          </div>
          <el-image v-if="item.coverImage" :src="item.coverImage" class="card-cover" fit="cover" />
        </div>
        <div class="card-actions">
          <el-button size="small" @click.stop="handleEdit(item)">编辑</el-button>
          <el-button size="small" type="danger" plain @click.stop="handleDelete(item)">删除</el-button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="total > pageSize">
      <el-pagination v-model:current-page="pageNum" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="getList" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { myContentList, userDeleteContent } from '@/api/content'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10

const getTypeName = (type) => { return { '1': '文章', '2': '视频', '3': '图片', '4': '音频' }[type] || '其他' }
const getTypeTag = (type) => { return { '1': '', '2': 'success', '3': 'warning', '4': 'danger' }[type] || 'info' }

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const getList = async () => {
  loading.value = true
  try {
    const res = await myContentList({ pageNum: pageNum.value, pageSize })
    list.value = res.rows || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (item) => {
  router.push({ path: '/publish', query: { id: item.contentId } })
}

const handleDelete = (item) => {
  ElMessageBox.confirm('确定要删除"' + item.title + '"吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      await userDeleteContent(item.contentId)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => { getList() })
</script>

<style scoped>
.content-list { padding: 12px; }
.content-card { background: #fff; border-radius: 10px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.card-body { display: flex; padding: 12px; }
.card-info { flex: 1; }
.card-title { font-size: 15px; font-weight: 500; color: #303133; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.card-meta .views { font-size: 12px; color: #909399; }
.card-time { font-size: 12px; color: #c0c4cc; }
.card-cover { width: 100px; height: 70px; border-radius: 6px; margin-left: 10px; flex-shrink: 0; }
.card-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 12px; border-top: 1px solid #f0f0f0; }
.empty-state { padding: 60px 0; }
.pagination { padding: 12px; text-align: center; }
</style>
