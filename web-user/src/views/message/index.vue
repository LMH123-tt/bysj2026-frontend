<template>
  <div class="message-page">
    <div class="page-header">
      <h2>私信</h2>
      <el-badge :value="unreadTotal" :hidden="!unreadTotal" :max="99">
        <el-icon :size="22" @click="showRequests = true" style="cursor:pointer"><Bell /></el-icon>
      </el-badge>
    </div>

    <div class="tab-bar">
      <span :class="['tab', activeTab === 'chats' ? 'active' : '']" @click="activeTab = 'chats'">最近聊天</span>
      <span :class="['tab', activeTab === 'friends' ? 'active' : '']" @click="activeTab = 'friends'">好友</span>
      <span :class="['tab', activeTab === 'requests' ? 'active' : '']" @click="activeTab = 'requests'">
        好友请求
        <el-badge v-if="requestCount > 0" :value="requestCount" :max="9" class="tab-badge" />
      </span>
    </div>

    <div v-if="activeTab === 'chats'" class="chat-list">
      <div v-for="chat in recentChats" :key="chat.friendId" class="chat-item" @click="openChat(chat)">
        <el-avatar :size="46" :src="chat.friendAvatar">{{ (chat.friendName || '?')[0] }}</el-avatar>
        <div class="chat-info">
          <div class="chat-top">
            <span class="chat-name">{{ chat.friendName || '用户' }}</span>
            <span class="chat-time">{{ formatTime(chat.lastTime) }}</span>
          </div>
          <div class="chat-preview">{{ chat.lastContent || '暂无消息' }}</div>
        </div>
        <el-badge v-if="chat.unread > 0" :value="chat.unread" :max="99" />
      </div>
      <div v-if="recentChats.length === 0" class="empty">
        <el-icon :size="48" color="#dcdfe6"><ChatDotRound /></el-icon>
        <p>暂无聊天记录</p>
        <p class="tip">去好友列表发起聊天吧</p>
      </div>
    </div>

    <div v-if="activeTab === 'friends'" class="friend-list">
      <div v-for="f in friendList" :key="f.id" class="friend-item" @click="openChat(f)">
        <el-avatar :size="42" :src="f.friendAvatar">{{ (f.friendName || '?')[0] }}</el-avatar>
        <div class="friend-info">
          <div class="friend-name">{{ f.friendName || '用户' }}</div>
        </div>
        <el-icon :size="18" color="#c0c4cc"><ChatDotRound /></el-icon>
      </div>
      <div v-if="friendList.length === 0" class="empty">
        <el-icon :size="48" color="#dcdfe6"><User /></el-icon>
        <p>暂无好友</p>
      </div>
    </div>

    <div v-if="activeTab === 'requests'" class="friend-list">
      <div v-for="f in requestList" :key="f.id" class="friend-item">
        <el-avatar :size="42" :src="f.friendAvatar">{{ (f.friendName || '?')[0] }}</el-avatar>
        <div class="friend-info">
          <div class="friend-name">{{ f.friendName || '用户' }}</div>
          <div class="friend-status">请求添加好友</div>
        </div>
        <el-button size="small" type="primary" @click="handleAccept(f.friendId)">接受</el-button>
      </div>
      <div v-if="requestList.length === 0" class="empty">
        <el-icon :size="48" color="#dcdfe6"><Bell /></el-icon>
        <p>暂无好友请求</p>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
    <BottomNav active="message" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { getFriendList, getFriendRequests, acceptFriend, getUnreadFriendCount, getUnreadMessageCount, getRecentChats } from '@/api/content'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('chats')
const recentChats = ref([])
const friendList = ref([])
const requestList = ref([])
const unreadTotal = ref(0)
const requestCount = ref(0)

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 172800000) return '昨天'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const loadRecentChats = async () => {
  try {
    const res = await getRecentChats()
    recentChats.value = res.data || []
  } catch (e) { console.error(e) }
}

const loadFriends = async () => {
  try {
    const res = await getFriendList('1')
    friendList.value = res.data || []
  } catch (e) { console.error(e) }
}

const loadRequests = async () => {
  try {
    const res = await getFriendRequests()
    requestList.value = res.data || []
    requestCount.value = requestList.value.length
  } catch (e) { console.error(e) }
}

const loadUnread = async () => {
  try {
    const [friendRes, msgRes] = await Promise.all([getUnreadFriendCount(), getUnreadMessageCount()])
    const friendUnread = friendRes.data || 0
    const msgUnread = msgRes.data || 0
    unreadTotal.value = friendUnread + msgUnread
  } catch (e) {}
}

const handleAccept = async (friendId) => {
  try {
    await acceptFriend(friendId)
    ElMessage.success('已接受好友请求')
    loadRequests()
    loadFriends()
    loadUnread()
  } catch (e) { ElMessage.error('操作失败') }
}

const openChat = (item) => {
  router.push('/chat/' + (item.friendId || item.id) + '?name=' + encodeURIComponent(item.friendName || '用户'))
}

onMounted(() => {
  loadRecentChats()
  loadFriends()
  loadRequests()
  loadUnread()
})
</script>

<style scoped>
.message-page {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f9ff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.tab-bar {
  display: flex;
  gap: 0;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
}

.tab {
  padding: 12px 20px;
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  position: relative;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.tab-badge {
  position: absolute;
  top: 6px;
  right: 4px;
}

.chat-list {
  padding: 8px 16px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}

.chat-item:active {
  background: #f5f7fa;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 11px;
  color: #c0c4cc;
  flex-shrink: 0;
}

.chat-preview {
  font-size: 13px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-list {
  padding: 8px 16px;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}

.friend-item:active {
  background: #f5f7fa;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.friend-status {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #b0b0b0;
}

.empty p {
  margin: 8px 0;
  font-size: 15px;
}

.empty .tip {
  font-size: 13px;
  color: #c0c4cc;
}

.safe-area-bottom {
  height: 60px;
}

@media (min-width: 768px) {
  .chat-list, .friend-list { padding: 12px 24px; }
  .page-header { padding: 16px 24px; }
}
</style>
