<template>
  <div class="notification-page">
    <div class="page-header">
      <h3>消息通知</h3>
      <el-button size="small" text type="primary" @click="markAllRead" v-if="notifications.length > 0">全部已读</el-button>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="notifications.length === 0" class="empty-wrapper">
      <el-empty description="暂无通知" :image-size="80" />
    </div>

    <div v-else class="notification-list">
      <div v-for="item in notifications" :key="item.id" :class="['notification-item', { unread: item.isRead === '0' }]" @click="handleClick(item)">
        <div class="notification-icon">
          <el-icon :size="20" :color="iconColor(item.type)">
            <UserFilled v-if="item.type === 'friend_request'" />
            <Check v-else-if="item.type === 'friend_accept'" />
            <ChatDotRound v-else-if="item.type === 'comment'" />
            <Star v-else-if="item.type === 'like'" />
            <Bell v-else />
          </el-icon>
        </div>
        <div class="notification-content">
          <div class="notification-title">
            <span class="title-text">{{ item.title }}</span>
            <span v-if="item.isRead === '0'" class="unread-dot"></span>
          </div>
          <div class="notification-desc">{{ item.fromUserName }} {{ item.content }}</div>
          <div class="notification-time">{{ formatTime(item.createTime) }}</div>
        </div>
        <div class="notification-action" @click.stop="deleteItem(item.id)">
          <el-icon :size="14" color="#c0c4cc"><Delete /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Check, ChatDotRound, Star, Bell, Delete } from '@element-plus/icons-vue'
import { getNotificationList, markNotificationRead, markAllNotificationRead, deleteNotification } from '@/api/content'

const router = useRouter()
const notifications = ref([])
const loading = ref(true)

const loadNotifications = async () => {
  loading.value = true
  try {
    const res = await getNotificationList()
    notifications.value = res.data || []
  } catch (e) { /* ignore */ }
  finally { loading.value = false }
}

const handleClick = async (item) => {
  if (item.isRead === '0') {
    try { await markNotificationRead(item.id) } catch (e) { /* ignore */ }
    item.isRead = '1'
  }
  if (item.type === 'friend_request' || item.type === 'friend_accept') {
    router.push('/user/friends')
  } else if (item.type === 'comment' || item.type === 'like') {
    if (item.relatedId) router.push('/content/' + item.relatedId)
  }
}

const markAllRead = async () => {
  try {
    await markAllNotificationRead()
    notifications.value.forEach(n => n.isRead = '1')
    ElMessage.success('已全部标记为已读')
  } catch (e) { /* ignore */ }
}

const deleteItem = async (id) => {
  try {
    await deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (e) { /* ignore */ }
}

const iconColor = (type) => {
  const map = { friend_request: '#409eff', friend_accept: '#67c23a', comment: '#e6a23c', like: '#f56c6c', system: '#909399' }
  return map[type] || '#909399'
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  return d.getMonth() + 1 + '月' + d.getDate() + '日'
}

onMounted(() => { loadNotifications() })
</script>

<style scoped>
.notification-page { min-height: 100vh; background: #f5f7fa; }
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-bottom: 1px solid #eee; }
.page-header h3 { margin: 0; font-size: 18px; }
.loading-wrapper, .empty-wrapper { padding: 40px 16px; }
.notification-list { padding: 8px 0; }
.notification-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.2s; }
.notification-item:active { background: #f5f7fa; }
.notification-item.unread { background: #f0f5ff; }
.notification-icon { width: 40px; height: 40px; border-radius: 50%; background: #f5f7fa; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notification-content { flex: 1; min-width: 0; }
.notification-title { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.title-text { font-size: 15px; font-weight: 500; color: #333; }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #f56c6c; }
.notification-desc { font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notification-time { font-size: 12px; color: #999; margin-top: 2px; }
.notification-action { padding: 4px; }
</style>
