<template>
  <div class="friends-page">
    <div class="page-header">
      <el-icon :size="20" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">好友列表</span>
      <el-badge :value="unreadCount" :hidden="!unreadCount" :max="99">
        <el-icon :size="20" @click="showRequests = true"><Bell /></el-icon>
      </el-badge>
    </div>

    <div class="tab-bar">
      <span :class="['tab', activeTab === 'friends' ? 'active' : '']" @click="activeTab = 'friends'">好友</span>
      <span :class="['tab', activeTab === 'requests' ? 'active' : '']" @click="activeTab = 'requests'">请求</span>
    </div>

    <div v-if="activeTab === 'friends'" class="friend-list">
      <div v-for="f in friendList" :key="f.id" class="friend-item" @click="openChat(f)">
        <el-avatar :size="40" :src="f.friendAvatar">{{ (f.friendName || '?')[0] }}</el-avatar>
        <div class="info">
          <div class="name">{{ f.friendName || '用户' }}</div>
        </div>
        <el-icon :size="16" color="#c0c4cc"><ChatDotRound /></el-icon>
      </div>
      <div v-if="friendList.length === 0" class="empty">暂无好友</div>
    </div>

    <div v-if="activeTab === 'requests'" class="friend-list">
      <div v-for="f in requestList" :key="f.id" class="friend-item">
        <el-avatar :size="40" :src="f.friendAvatar">{{ (f.friendName || '?')[0] }}</el-avatar>
        <div class="info">
          <div class="name">{{ f.friendName || '用户' }}</div>
          <div class="status">请求添加好友</div>
        </div>
        <el-button size="small" type="primary" @click="handleAccept(f.friendId)">接受</el-button>
      </div>
      <div v-if="requestList.length === 0" class="empty">暂无好友请求</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFriendList, getFriendRequests, acceptFriend, getUnreadFriendCount } from '@/api/content'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('friends')
const friendList = ref([])
const requestList = ref([])
const unreadCount = ref(0)

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
  } catch (e) { console.error(e) }
}

const loadUnread = async () => {
  try {
    const res = await getUnreadFriendCount()
    unreadCount.value = res.data || 0
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

const openChat = (f) => {
  router.push('/chat/' + f.friendId + '?name=' + encodeURIComponent(f.friendName))
}

onMounted(() => { loadFriends(); loadRequests(); loadUnread() })
</script>

<style scoped>
.friends-page { padding: 16px; max-width: 800px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.title { font-size: 18px; font-weight: 600; }
.tab-bar { display: flex; gap: 16px; margin-bottom: 16px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
.tab { padding: 4px 12px; font-size: 14px; color: #666; cursor: pointer; border-radius: 16px; }
.tab.active { color: #667eea; font-weight: 600; background: #f0f2ff; }
.friend-list { display: flex; flex-direction: column; gap: 8px; }
.friend-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; }
.info { flex: 1; min-width: 0; }
.name { font-size: 14px; font-weight: 500; color: #333; }
.status { font-size: 12px; color: #999; margin-top: 2px; }
.empty { text-align: center; padding: 40px 0; color: #b0b0b0; }
</style>
