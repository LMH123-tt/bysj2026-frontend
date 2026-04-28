﻿﻿﻿<template>
  <div class="profile-page">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">{{ isSelf ? '我的主页' : '用户主页' }}</span>
    </div>

    <div v-if="loading" style="padding:40px"><el-skeleton :rows="6" animated /></div>

    <template v-else-if="user">
      <div class="profile-header">
        <el-avatar :size="72" :src="user.avatar || undefined">{{ (user.nickName || user.userName || '?')[0] }}</el-avatar>
        <div class="profile-info">
          <h2>{{ user.nickName || user.userName }}</h2>
          <p class="profile-desc">{{ user.remark || '这个人很懒，什么都没写~' }}</p>
        </div>
        <el-button v-if="isSelf" size="small" @click="goToEdit" plain style="color:#fff;border-color:rgba(255,255,255,0.5);">编辑资料</el-button>
        <el-button v-else-if="isLoggedIn" type="primary" size="small" @click="handleAddFriend">
          {{ isFriend ? '已好友' : '加好友' }}
        </el-button>
      </div>

      <div class="profile-stats">
        <div class="stat-item">
          <div class="stat-number">{{ contentCount }}</div>
          <div class="stat-label">发布</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ user.viewCount || 0 }}</div>
          <div class="stat-label">获浏览</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ user.likeCount || 0 }}</div>
          <div class="stat-label">获点赞</div>
        </div>
      </div>

      <div class="profile-tabs">
        <span :class="['tab', { active: activeTab === 'content' }]" @click="switchTab('content')">{{ isSelf ? '我的内容' : 'TA的内容' }}</span>
        <span v-if="isSelf" :class="['tab', { active: activeTab === 'favorite' }]" @click="switchTab('favorite')">我的收藏</span>
      </div>

      <div class="content-list" v-if="activeTab === 'content'">
        <template v-if="contentList.length > 0">
          <div v-for="item in contentList" :key="item.contentId" class="content-card" @click="$router.push('/content/' + item.contentId)">
            <img :src="item.coverImage || '/default-cover.jpg'" class="card-cover" v-if="item.coverImage" />
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-meta">
                <span>{{ typeLabel(item.contentType) }}</span>
                <span>{{ item.viewCount || 0 }} 浏览</span>
                <span>{{ item.likeCount || 0 }} 点赞</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="!contentLoading" class="empty-state">
          <el-empty description="暂无发布内容" :image-size="60" />
        </div>
        <div class="load-more" v-if="contentList.length > 0 && contentList.length < contentTotal" @click="loadMoreContent">加载更多</div>
      </div>

      <div class="content-list" v-if="activeTab === 'favorite'">
        <template v-if="favoriteList.length > 0">
          <div v-for="item in favoriteList" :key="'f-' + item.contentId" class="content-card" @click="$router.push('/content/' + item.contentId)">
            <img :src="item.coverImage || '/default-cover.jpg'" class="card-cover" v-if="item.coverImage" />
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-meta">
                <span>{{ typeLabel(item.contentType) }}</span>
                <span>{{ item.viewCount || 0 }} 浏览</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="!favoriteLoading" class="empty-state">
          <el-empty description="暂无收藏内容" :image-size="60" />
        </div>
        <div class="load-more" v-if="favoriteList.length > 0 && favoriteList.length < favoriteTotal" @click="loadMoreFavorite">加载更多</div>
      </div>
    </template>

    <div v-else class="empty-state">
      <el-empty description="用户不存在" :image-size="80" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfile, getUserContent, addFriend, listFavorites } from '@/api/content'
import { getUserInfo } from '@/api/user'
import { getToken } from '@/utils/auth'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const loading = ref(true)
const contentList = ref([])
const contentTotal = ref(0)
const contentLoading = ref(false)
const contentPage = ref(1)
const favoriteList = ref([])
const favoriteTotal = ref(0)
const favoriteLoading = ref(false)
const favoritePage = ref(1)
const activeTab = ref('content')
const isFriend = ref(false)
const isLoggedIn = !!getToken()
const isSelf = ref(false)

const userId = computed(() => route.params.userId)

const typeLabel = (type) => ({ '1': '文章', '2': '视频', '3': '图片', '4': '音频' }[type] || '内容')

const contentCount = computed(() => user.value?._contentCount || 0)

const checkIsSelf = async () => {
  if (!isLoggedIn) { isSelf.value = false; return }
  try {
    const res = await getUserInfo()
    const currentUserId = res.data?.userId
    isSelf.value = String(currentUserId) === String(userId.value)
  } catch (e) {
    isSelf.value = false
  }
}

const loadProfile = async () => {
  loading.value = true
  try {
    const res = await getUserProfile(userId.value)
    user.value = res.data?.user || null
    if (user.value) {
      user.value._contentCount = res.data?.contentCount || 0
    }
  } catch (e) { /* ignore */ }
  finally { loading.value = false }
}

const loadContent = async (reset = false) => {
  if (reset) { contentPage.value = 1; contentList.value = [] }
  contentLoading.value = true
  try {
    const res = await getUserContent(userId.value, { pageNum: contentPage.value, pageSize: 10 })
    const rows = res.rows || []
    contentTotal.value = res.total || 0
    contentList.value = reset ? rows : [...contentList.value, ...rows]
  } catch (e) { /* ignore */ }
  finally { contentLoading.value = false }
}

const loadFavorite = async (reset = false) => {
  if (reset) { favoritePage.value = 1; favoriteList.value = [] }
  favoriteLoading.value = true
  try {
    const res = await listFavorites({ pageNum: favoritePage.value, pageSize: 10 })
    const rows = res.rows || []
    favoriteTotal.value = res.total || 0
    favoriteList.value = reset ? rows : [...favoriteList.value, ...rows]
  } catch (e) { /* ignore */ }
  finally { favoriteLoading.value = false }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'content' && contentList.value.length === 0) loadContent()
  if (tab === 'favorite' && favoriteList.value.length === 0) loadFavorite()
}

const loadMoreContent = () => {
  contentPage.value++
  loadContent()
}

const loadMoreFavorite = () => {
  favoritePage.value++
  loadFavorite()
}

const goToEdit = () => {
  router.push('/profile-edit')
}

const handleAddFriend = async () => {
  if (isFriend.value) return
  try {
    await addFriend(Number(userId.value))
    isFriend.value = true
    ElMessage.success('好友请求已发送')
  } catch (e) { /* ignore */ }
}

watch(userId, () => {
  if (userId.value) {
    loadProfile()
    checkIsSelf()
    loadContent(true)
    if (activeTab.value === 'favorite') loadFavorite(true)
  }
})

onMounted(async () => {
  await loadProfile()
  await checkIsSelf()
  loadContent()
})
</script>

<style scoped>
.profile-page { min-height: 100vh; background: #f5f7fa; }
.page-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-bottom: 1px solid #eee; }
.back-btn { font-size: 20px; cursor: pointer; color: #333; }
.title { font-size: 17px; font-weight: 600; }

.profile-header { display: flex; align-items: center; gap: 16px; padding: 24px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.profile-info { flex: 1; min-width: 0; h2 { margin: 0 0 4px; font-size: 20px; } }
.profile-desc { font-size: 13px; opacity: 0.85; margin: 0; }

.profile-stats { display: flex; justify-content: space-around; padding: 16px; background: white; margin-bottom: 8px; }
.stat-item { text-align: center; }
.stat-number { font-size: 20px; font-weight: 700; color: #333; }
.stat-label { font-size: 12px; color: #909399; margin-top: 2px; }

.profile-tabs { display: flex; background: white; border-bottom: 2px solid #f0f0f0; }
.tab { flex: 1; text-align: center; padding: 12px 0; font-size: 15px; color: #666; cursor: pointer; position: relative; }
.tab.active { color: #667eea; font-weight: 600; }
.tab.active::after { content: ''; position: absolute; bottom: -2px; left: 30%; right: 30%; height: 2px; background: #667eea; border-radius: 1px; }

.content-list { padding: 8px 16px; }
.content-card { display: flex; gap: 12px; padding: 12px; background: white; border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: background 0.2s; &:active { background: #f5f7fa; } }
.card-cover { width: 100px; height: 68px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.card-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.card-title { font-size: 15px; font-weight: 500; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { font-size: 12px; color: #909399; margin-top: 6px; display: flex; gap: 10px; }

.empty-state { padding: 40px; }
.load-more { text-align: center; padding: 16px; color: #667eea; font-size: 14px; cursor: pointer; }
</style>
