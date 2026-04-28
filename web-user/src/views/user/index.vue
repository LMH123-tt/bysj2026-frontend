<template>
  <div class="mobile-container">
    <div class="user-header">
      <el-avatar :size="80" :src="userInfo.avatar || defaultAvatar" class="avatar" />
      <div class="name">{{ userInfo.nickName || userInfo.userName || '用户' }}</div>
      <div class="id" v-if="userInfo.userName">@{{ userInfo.userName }}</div>
    </div>

    <div class="user-stats">
      <div class="stat-item" @click="$router.push('/my-content')">
        <div class="num">{{ stats.contentCount || 0 }}</div>
        <div class="label">发布</div>
      </div>
      <div class="stat-item" @click="$router.push('/favorites')">
        <div class="num">{{ stats.favoriteCount || 0 }}</div>
        <div class="label">收藏</div>
      </div>
      <div class="stat-item" @click="$router.push('/history')">
        <div class="num">{{ stats.historyCount || 0 }}</div>
        <div class="label">历史</div>
      </div>
    </div>

    <div class="publish-entry">
      <el-button type="primary" @click="$router.push('/publish')" style="width:100%;height:44px;border-radius:22px;font-size:16px;">
        <el-icon style="margin-right:6px;"><EditPen /></el-icon> 发布内容
      </el-button>
    </div>

    <div class="user-menu">
      <div class="menu-item" @click="$router.push('/my-content')">
        <el-icon class="icon"><Document /></el-icon>
        <span class="text">我的发布</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goToProfile">
        <el-icon class="icon"><User /></el-icon>
        <span class="text">个人资料</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="$router.push('/favorites')">
        <el-icon class="icon"><Star /></el-icon>
        <span class="text">我的收藏</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="$router.push('/history')">
        <el-icon class="icon"><Clock /></el-icon>
        <span class="text">浏览历史</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="$router.push('/ranking')">
        <el-icon class="icon"><TrendCharts /></el-icon>
        <span class="text">排行榜</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="$router.push('/friends')">
        <el-icon class="icon"><UserFilled /></el-icon>
        <span class="text">好友</span>
        <el-badge :value="unreadSocial" :hidden="!unreadSocial" :max="99" style="margin-left:auto;margin-right:8px;" />
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="$router.push('/notification')">
        <el-icon class="icon"><ChatDotRound /></el-icon>
        <span class="text">消息通知</span>
        <el-badge :value="unreadNotify" :hidden="!unreadNotify" :max="99" style="margin-left:auto;margin-right:8px;" />
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="$router.push('/notice')">
        <el-icon class="icon"><Bell /></el-icon>
        <span class="text">系统公告</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <div class="logout-section">
      <el-button type="danger" plain @click="handleLogout" class="logout-btn">退出登录</el-button>
    </div>

    <div class="safe-area-bottom"></div>
    <BottomNav active="user" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Star, Bell, ArrowRight, EditPen, Document, Clock, TrendCharts, UserFilled, ChatDotRound } from '@element-plus/icons-vue'
import BottomNav from '@/components/BottomNav.vue'
import useUserStore from '@/store/modules/user'
import { getUserInfo } from '@/api/user'
import { listFavorites, myContentList, getViewHistory, getUnreadMessageCount, getUnreadFriendCount, getUnreadNotificationCount } from '@/api/content'

const router = useRouter()
const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6be4d6f5f8f1c6b6e2c9c2f7d9a3a.png'

const userInfo = ref({})
const stats = ref({ contentCount: 0, favoriteCount: 0, historyCount: 0 })
const unreadSocial = ref(0)
const unreadNotify = ref(0)

const getUserInfoData = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res.data || {}
  } catch (error) {
    userInfo.value = { nickName: userStore.nickName, userName: userStore.name, avatar: userStore.avatar }
  }
}

const getStats = async () => {
  try {
    const res = await listFavorites({ pageSize: 1 })
    stats.value.favoriteCount = res.total || 0
  } catch (error) {}
  try {
    const res = await myContentList({ pageSize: 1 })
    stats.value.contentCount = res.total || 0
  } catch (error) {}
  try {
    const res = await getViewHistory()
    stats.value.historyCount = (res.data || []).length
  } catch (error) {}
  try {
    const [msgRes, friendRes] = await Promise.all([getUnreadMessageCount(), getUnreadFriendCount()])
    unreadSocial.value = (msgRes.data || 0) + (friendRes.data || 0)
  } catch (error) {}
  try {
    const notifyRes = await getUnreadNotificationCount()
    unreadNotify.value = notifyRes.data || 0
  } catch (error) {}
}

const goToProfile = () => {
  if (userInfo.value.userId) {
    router.push(`/profile/${userInfo.value.userId}`)
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      ElMessage.success('已退出登录')
      router.push('/login')
    })
  }).catch(() => {})
}

onMounted(() => { getUserInfoData(); getStats() })
</script>

<style scoped>
.mobile-container { max-width: 1400px; margin: 0 auto; min-height: 100vh; }
.user-header { padding: 32px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-align: center; }
.user-header .avatar { border: 3px solid rgba(255,255,255,0.3); margin-bottom: 12px; }
.user-header .name { font-size: 18px; font-weight: 500; margin-bottom: 4px; }
.user-header .id { font-size: 13px; color: rgba(255,255,255,0.8); }
.user-stats { display: flex; justify-content: space-around; padding: 16px; background: #fff; margin-bottom: 12px; }
.stat-item { text-align: center; cursor: pointer; }
.stat-item .num { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.stat-item .label { font-size: 13px; color: #909399; }
.publish-entry { padding: 0 16px 12px; }
.user-menu { background: #fff; }
.user-menu .menu-item { display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #ebeef5; cursor: pointer; }
.user-menu .menu-item:last-child { border-bottom: none; }
.user-menu .menu-item .icon { font-size: 20px; color: #409eff; margin-right: 12px; }
.user-menu .menu-item .text { flex: 1; font-size: 14px; color: #303133; }
.user-menu .menu-item .arrow { color: #c0c4cc; font-size: 14px; }
.logout-section { padding: 24px; }
.logout-btn { width: 100%; height: 44px; border-radius: 22px; }

@media (min-width: 768px) {
  .user-header { padding: 40px 32px; }
  .user-stats { padding: 20px 32px; }
  .publish-entry { padding: 0 32px 16px; }
  .user-menu .menu-item { padding: 16px 32px; }
  .logout-section { padding: 24px 32px; }
}
</style>
