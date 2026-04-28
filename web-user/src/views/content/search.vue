<template>
  <div class="mobile-container">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <div class="search-box">
        <el-input v-model="keyword" placeholder="请输入搜索关键词" clearable @keyup.enter="doSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <span class="search-btn" @click="doSearch">搜索</span>
    </div>

    <div class="main-tabs" v-if="hasSearched">
      <span :class="['main-tab', { active: activeTab === 'content' }]" @click="switchTab('content')">内容</span>
      <span :class="['main-tab', { active: activeTab === 'user' }]" @click="switchTab('user')">用户</span>
    </div>

    <template v-if="activeTab === 'content'">
      <div class="filter-bar" v-if="hasSearched">
        <div class="filter-tabs">
          <span :class="['filter-tab', { active: currentType === '' }]" @click="filterByType('')">全部</span>
          <span :class="['filter-tab', { active: currentType === '1' }]" @click="filterByType('1')">文章</span>
          <span :class="['filter-tab', { active: currentType === '2' }]" @click="filterByType('2')">视频</span>
          <span :class="['filter-tab', { active: currentType === '3' }]" @click="filterByType('3')">图片</span>
          <span :class="['filter-tab', { active: currentType === '4' }]" @click="filterByType('4')">音频</span>
        </div>
        <div class="filter-row">
          <el-select v-model="currentCategory" placeholder="选择分类" clearable size="small" @change="doSearch" style="width: 110px">
            <el-option v-for="cat in categories" :key="cat.categoryId" :label="cat.categoryName" :value="cat.categoryId" />
          </el-select>
          <el-select v-model="sortBy" placeholder="排序方式" size="small" @change="doSearch" style="width: 110px">
            <el-option label="综合排序" value="" />
            <el-option label="最新发布" value="latest" />
            <el-option label="最多浏览" value="views" />
            <el-option label="最多点赞" value="likes" />
          </el-select>
        </div>
      </div>

      <div class="result-info" v-if="hasSearched && !loading">
        <span>找到 <b>{{ total }}</b> 条相关内容</span>
      </div>

      <div class="list-container" v-if="searchResults.length > 0">
        <div v-for="item in searchResults" :key="item.contentId" class="list-item" @click="goToDetail(item.contentId)">
          <div class="thumb-wrapper">
            <img :src="item.coverImage || '/default-cover.jpg'" class="thumb" />
            <span class="type-badge" v-if="item.contentType">{{ typeLabel(item.contentType) }}</span>
          </div>
          <div class="content">
            <div class="title" v-html="highlightKeyword(item.title)"></div>
            <div class="summary" v-if="item.summary" v-html="highlightKeyword(item.summary)"></div>
            <div class="meta">
              <span class="author">{{ item.author }}</span>
              <span>{{ item.categoryName }}</span>
              <span>{{ item.viewCount || 0 }} 浏览</span>
              <span>{{ formatDate(item.publishTime || item.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else-if="!loading && hasSearched">
        <el-icon class="icon" :size="48"><Search /></el-icon>
        <p>未找到"{{ keyword }}"相关内容</p>
        <p class="tip">试试其他关键词或减少筛选条件</p>
      </div>
    </template>

    <template v-if="activeTab === 'user'">
      <div class="user-results" v-if="userResults.length > 0">
        <div v-for="user in userResults" :key="user.userId" class="user-item" @click="goToUserProfile(user.userId)">
          <el-avatar :size="48" :src="user.avatar || undefined">{{ (user.nickName || user.userName || '用户')[0] }}</el-avatar>
          <div class="user-info">
            <div class="username">{{ user.nickName || user.userName }}</div>
            <div class="user-desc">{{ user.remark || '暂无简介' }}</div>
          </div>
          <el-button v-if="isLoggedIn" size="small" type="primary" plain @click.stop="handleAddFriend(user.userId)">关注</el-button>
        </div>
      </div>
      <div class="empty-state" v-else-if="!userLoading && hasSearched">
        <el-icon class="icon" :size="48"><User /></el-icon>
        <p>未找到"{{ keyword }}"相关用户</p>
      </div>
    </template>

    <div class="hot-search" v-if="!hasSearched">
      <h3>热门搜索</h3>
      <div class="hot-tags">
        <el-tag v-for="tag in hotTags" :key="tag" class="hot-tag" effect="plain" @click="quickSearch(tag)">{{ tag }}</el-tag>
      </div>
      <h3 style="margin-top:20px">热门标签</h3>
      <div class="tag-cloud">
        <span v-for="t in tagCloud" :key="t.tag" class="cloud-tag" :style="{ fontSize: t.size + 'px', color: t.color }" @click="quickSearch(t.tag)">{{ t.tag }}</span>
      </div>
    </div>

    <div class="loading-state" v-if="loading || userLoading">搜索中...</div>
    <div class="load-more" v-else-if="hasSearched && activeTab === 'content' && searchResults.length > 0 && searchResults.length < total" @click="loadMore">加载更多</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchContent, listCategory, searchUsers, addFriend, getHotTags } from '@/api/content'
import { formatDate } from '@/utils'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const currentType = ref('')
const currentCategory = ref(null)
const sortBy = ref('')
const categories = ref([])
const tagCloud = ref([])

const tagColors = ['#667eea', '#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399', '#ff6b6b', '#48dbfb']

const loadTagCloud = async () => {
  try {
    const res = await getHotTags()
    const tags = res.data || []
    const maxCount = Math.max(...tags.map(t => t.count || 1), 1)
    tagCloud.value = tags.map(t => ({
      tag: t.tag,
      count: t.count,
      size: Math.max(12, Math.min(28, 12 + (t.count / maxCount) * 16)),
      color: tagColors[Math.floor(Math.random() * tagColors.length)]
    }))
  } catch (e) { /* ignore */ }
}
const searchResults = ref([])
const total = ref(0)
const loading = ref(false)
const hasSearched = ref(false)
const pageNum = ref(1)
const pageSize = 20

const activeTab = ref('content')
const userResults = ref([])
const userLoading = ref(false)

const isLoggedIn = computed(() => !!getToken())

const hotTags = ref(['视频', '教程', '音乐', '摄影', '技术', '生活', '美食', '旅行'])

const typeLabel = (t) => ({ '1': '文章', '2': '视频', '3': '图片', '4': '音频' }[t] || '')

const getCategories = async () => {
  try {
    const res = await listCategory()
    categories.value = res.data || []
  } catch (e) { console.error(e) }
}

const doSearch = async (reset = true) => {
  if (!keyword.value.trim()) return
  hasSearched.value = true
  if (activeTab.value === 'content') {
    await searchContentList(reset)
  } else {
    await searchUserList()
  }
}

const searchContentList = async (reset = true) => {
  loading.value = true
  if (reset) {
    pageNum.value = 1
    searchResults.value = []
  }
  try {
    const params = {
      keyword: keyword.value,
      pageNum: pageNum.value,
      pageSize
    }
    if (currentType.value) params.contentType = currentType.value
    if (currentCategory.value) params.categoryId = currentCategory.value
    if (sortBy.value) params.sortBy = sortBy.value
    const res = await searchContent(keyword.value, params)
    const rows = res.rows || []
    total.value = res.total || 0
    if (reset) {
      searchResults.value = rows
    } else {
      searchResults.value = [...searchResults.value, ...rows]
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const searchUserList = async () => {
  userLoading.value = true
  try {
    const res = await searchUsers(keyword.value)
    userResults.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    userLoading.value = false
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'user' && userResults.value.length === 0 && keyword.value.trim()) {
    searchUserList()
  } else if (tab === 'content' && searchResults.value.length === 0 && keyword.value.trim()) {
    searchContentList(true)
  }
}

const loadMore = () => {
  pageNum.value++
  searchContentList(false)
}

const filterByType = (type) => {
  currentType.value = type
  doSearch()
}

const quickSearch = (tag) => {
  keyword.value = tag
  doSearch()
}

const highlightKeyword = (text) => {
  if (!keyword.value || !text) return text
  try {
    const reg = new RegExp(`(${keyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(reg, '<span style="color: #667eea; font-weight: bold;">$1</span>')
  } catch { return text }
}

const goToDetail = (id) => { router.push(`/content/${id}`) }

const goToUserProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

const handleAddFriend = async (userId) => {
  try {
    await addFriend(userId)
    ElMessage.success('好友请求已发送')
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '发送失败')
  }
}

onMounted(() => {
  getCategories()
  loadTagCloud()
  const queryKeyword = route.query.keyword
  if (queryKeyword) {
    keyword.value = queryKeyword
    doSearch()
  }
})
</script>

<style scoped>
.mobile-container {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn { font-size: 20px; cursor: pointer; color: #333; }

.search-box { flex: 1; margin: 0 12px; }

.search-btn { color: #667eea; font-size: 14px; cursor: pointer; font-weight: 500; }

.main-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
}

.main-tab {
  padding: 12px 20px;
  font-size: 15px;
  color: #909399;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  font-weight: 500;
}

.main-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.filter-bar {
  background: white;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.filter-row {
  display: flex;
  gap: 8px;
}

.filter-tab {
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  &.active {
    color: #667eea;
    border-bottom-color: #667eea;
    font-weight: 600;
  }
}

.result-info {
  padding: 8px 16px;
  font-size: 13px;
  color: #909399;
  b { color: #667eea; }
}

.list-container { padding: 0 16px; }

.list-item {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 12px;
  gap: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;
  &:hover { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15); }
  .thumb-wrapper { position: relative; flex-shrink: 0; }
  .thumb { width: 140px; height: 90px; border-radius: 8px; object-fit: cover; }
  .content { flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .summary {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    font-size: 11px;
    color: #c0c4cc;
    display: flex;
    gap: 8px;
    .author { color: #667eea; }
  }
}

.type-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(102, 126, 234, 0.85);
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
}

.user-results { padding: 12px 16px; }

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;
  &:hover { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12); }
}

.user-info { flex: 1; min-width: 0; }

.username {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
  .icon { color: #dcdfe6; margin-bottom: 12px; }
  p { margin: 8px 0; font-size: 15px; }
  .tip { font-size: 13px; color: #c0c4cc; }
}

.hot-search {
  padding: 20px 16px;
  h3 { font-size: 16px; color: #333; margin: 0 0 12px 0; }
  .hot-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .hot-tag { cursor: pointer; border-radius: 14px; transition: all 0.3s; &:hover { color: #667eea; border-color: #667eea; } }
  .tag-cloud { display: flex; flex-wrap: wrap; gap: 10px; padding: 8px 0; }
  .cloud-tag { cursor: pointer; padding: 4px 8px; transition: all 0.2s; font-weight: 500; &:active { opacity: 0.6; } }
}

.loading-state { text-align: center; padding: 20px; color: #909399; font-size: 14px; }

.load-more {
  text-align: center;
  padding: 12px;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  &:hover { color: #764ba2; }
}

@media (min-width: 768px) {
  .list-item .thumb { width: 180px; height: 110px; }
  .user-results { padding: 16px 24px; }
  .list-container { padding: 0 24px; }
}

@media (min-width: 1200px) {
  .page-header { padding: 12px 24px; }
  .filter-bar { padding: 8px 24px; }
  .list-container { padding: 0 24px; }
  .user-results { padding: 16px 24px; }
}
</style>
