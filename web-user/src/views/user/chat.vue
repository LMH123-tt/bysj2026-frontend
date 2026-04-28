<template>
  <div class="chat-page">
    <div class="chat-header">
      <el-icon :size="20" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">{{ friendName }}</span>
    </div>

    <div class="chat-messages" ref="messagesRef">
      <div v-for="msg in messageList" :key="msg.id"
           :class="['msg-row', msg.senderId === myId ? 'mine' : 'theirs']">
        <el-avatar v-if="msg.senderId !== myId" :size="28" :src="msg.senderAvatar">{{ (msg.senderName || '?')[0] }}</el-avatar>
        <div class="msg-bubble">
          <div class="msg-content">{{ msg.content }}</div>
          <div class="msg-time">{{ formatTime(msg.createTime) }}</div>
        </div>
      </div>
      <div v-if="messageList.length === 0" class="empty">暂无消息，发送第一条私信吧</div>
    </div>

    <div class="chat-input">
      <el-input v-model="inputText" placeholder="输入消息..." @keyup.enter="handleSend" maxlength="500" />
      <el-button type="primary" @click="handleSend" :loading="sending">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getMessageList, sendMessage } from '@/api/content'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const friendId = Number(route.params.friendId)
const friendName = decodeURIComponent(route.query.name || '用户')
const myId = ref(0)
const messageList = ref([])
const inputText = ref('')
const sending = ref(false)
const messagesRef = ref(null)

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

const loadMessages = async () => {
  try {
    const res = await getMessageList(friendId)
    messageList.value = res.data || []
    await nextTick()
    scrollToBottom()
  } catch (e) { console.error(e) }
}

const handleSend = async () => {
  if (!inputText.value.trim()) return
  sending.value = true
  try {
    await sendMessage(friendId, inputText.value.trim())
    inputText.value = ''
    loadMessages()
  } catch (e) {
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

onMounted(() => {
  try {
    const token = getToken()
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      myId.value = payload.user_id || 0
    }
  } catch (e) {}
  loadMessages()
})
</script>

<style scoped>
.chat-page { display: flex; flex-direction: column; height: 100vh; max-width: 800px; margin: 0 auto; background: #f5f5f5; }
.chat-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #eee; }
.title { font-size: 16px; font-weight: 600; }
.chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.msg-row { display: flex; gap: 8px; align-items: flex-start; }
.msg-row.mine { flex-direction: row-reverse; }
.msg-bubble { max-width: 70%; padding: 10px 14px; border-radius: 12px; word-break: break-word; }
.theirs .msg-bubble { background: #fff; border-top-left-radius: 4px; }
.mine .msg-bubble { background: #667eea; color: #fff; border-top-right-radius: 4px; }
.msg-content { font-size: 14px; line-height: 1.5; }
.msg-time { font-size: 10px; margin-top: 4px; opacity: 0.7; }
.mine .msg-time { text-align: right; }
.chat-input { display: flex; gap: 8px; padding: 12px 16px; background: #fff; border-top: 1px solid #eee; }
.chat-input .el-input { flex: 1; }
.empty { text-align: center; padding: 40px 0; color: #b0b0b0; }
</style>
