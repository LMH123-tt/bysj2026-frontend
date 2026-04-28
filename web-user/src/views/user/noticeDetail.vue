<template>
  <div class="mobile-container">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">公告详情</span>
    </div>

    <div class="notice-detail" v-if="notice.noticeId">
      <div class="detail-header">
        <h1>{{ notice.noticeTitle }}</h1>
        <div class="meta">
          <el-tag :type="notice.noticeType === '2' ? 'danger' : 'info'">
            {{ notice.noticeType === '2' ? '重要公告' : '普通公告' }}
          </el-tag>
          <span>{{ formatDate(notice.createTime) }}</span>
        </div>
      </div>

      <div class="detail-body" v-html="notice.noticeContent"></div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getNotice, markNoticeRead } from '@/api/notice'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()
const noticeId = route.params.id

const notice = ref({})

// 获取公告详情
const getDetail = async () => {
  try {
    const res = await getNotice(noticeId)
    notice.value = res.data || {}
    // 标记已读
    if (!res.data?.isRead) {
      await markNoticeRead(noticeId)
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败')
  }
}

onMounted(() => {
  getDetail()
})
</script>

<style scoped>
.notice-detail {
  background: #fff;
  min-height: calc(100vh - 44px);
}

.detail-header {
  padding: 20px 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-header h1 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 12px;
}

.detail-header .meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.detail-body {
  padding: 16px;
  line-height: 1.8;
  font-size: 15px;
}

.detail-body img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
