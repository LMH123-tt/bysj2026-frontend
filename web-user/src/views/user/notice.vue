<template>
  <div class="mobile-container">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">系统公告</span>
    </div>

    <!-- 公告列表 -->
    <div class="notice-list" v-if="notices.length > 0">
      <div
        v-for="notice in notices"
        :key="notice.noticeId"
        class="notice-item"
        :class="{ unread: !notice.isRead }"
        @click="goToDetail(notice.noticeId)"
      >
        <div class="notice-title">
          <el-tag size="small" :type="notice.noticeType === '2' ? 'danger' : 'info'" class="type-tag">
            {{ notice.noticeType === '2' ? '重要' : '普通' }}
          </el-tag>
          <span class="title-text">{{ notice.noticeTitle }}</span>
          <el-badge v-if="!notice.isRead" is-dot class="unread-badge" />
        </div>
        <div class="notice-time">{{ formatDate(notice.createTime) }}</div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-icon class="icon"><Bell /></el-icon>
      <p>暂无公告</p>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-if="loading">加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listNotice } from '@/api/notice'
import { formatDate } from '@/utils'

const router = useRouter()

const notices = ref([])
const loading = ref(false)

// 获取公告列表
const getNotices = async () => {
  loading.value = true
  try {
    const res = await listNotice({ pageNum: 1, pageSize: 20, status: '0' })
    notices.value = res.rows || []
  } catch (error) {
    console.error('获取公告列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转到详情
const goToDetail = (id) => {
  router.push(`/notice/${id}`)
}

onMounted(() => {
  getNotices()
})
</script>

<style scoped>
.notice-list {
  background: #fff;
}

.notice-item {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.notice-item.unread {
  background: #f5f7fa;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.notice-title .title-text {
  flex: 1;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

.type-tag {
  flex-shrink: 0;
}

.unread-badge {
  flex-shrink: 0;
}
</style>
