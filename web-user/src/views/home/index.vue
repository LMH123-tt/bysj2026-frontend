<template>
  <div class="mobile-container">
    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索感兴趣的内容" class="search-input" @keyup.enter="handleSearch">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <div class="category-tabs">
      <div v-for="cat in categories" :key="cat.categoryId" class="tab" :class="{ active: currentCategory === cat.categoryId }" @click="switchCategory(cat.categoryId)">
        {{ cat.categoryName }}
      </div>
    </div>

    <template v-if="currentCategory === null || currentCategory === undefined">
      <el-carousel height="180px" class="banner-carousel" v-if="topList.length > 0" indicator-position="outside" :interval="4000">
        <el-carousel-item v-for="(item, idx) in topList" :key="item.contentId">
          <div class="banner-item" @click="goToDetail(item.contentId)">
            <img :src="item.coverImage || '/default-cover.jpg'" class="banner-img" />
            <div class="banner-overlay">
              <div class="banner-title">{{ item.title }}</div>
              <div class="banner-meta">
                <span class="banner-type">{{ typeLabel(item.contentType) }}</span>
                <span>{{ item.author }}</span>
                <span>{{ item.viewCount || 0 }} 浏览</span>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <div class="section" v-if="recommendList.length > 0">
        <div class="section-header">
          <h3>热门推荐</h3>
        </div>
        <div class="grid-container">
          <div v-for="item in recommendList" :key="item.contentId" class="content-card" @click="goToDetail(item.contentId)">
            <div class="cover-wrapper">
              <img :src="item.coverImage || '/default-cover.jpg'" class="cover" />
              <span class="type-badge" v-if="item.contentType">{{ typeLabel(item.contentType) }}</span>
            </div>
            <div class="info">
              <div class="title">{{ item.title }}</div>
              <div class="meta">
                <span>{{ item.author }}</span>
                <span>{{ item.viewCount || 0 }} 浏览</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section" v-if="personalizedList.length > 0">
        <div class="section-header">
          <h3>猜你喜欢</h3>
        </div>
        <div class="list-container">
          <div v-for="item in personalizedList" :key="'p-' + item.contentId" class="list-item" @click="goToDetail(item.contentId)">
            <div class="thumb-wrapper">
              <img :src="item.coverImage || '/default-cover.jpg'" class="thumb" />
              <span class="type-badge small" v-if="item.contentType">{{ typeLabel(item.contentType) }}</span>
            </div>
            <div class="content">
              <div class="title">{{ item.title }}</div>
              <div class="summary" v-if="item.summary">{{ item.summary }}</div>
              <div class="meta">
                <span class="author">{{ item.author }}</span>
                <span>{{ item.categoryName }}</span>
                <span>{{ item.viewCount || 0 }} 浏览</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3>最新发布</h3>
        </div>
        <div class="list-container" v-if="latestList.length > 0">
          <div v-for="item in latestList" :key="item.contentId" class="list-item" @click="goToDetail(item.contentId)">
            <div class="thumb-wrapper">
              <img :src="item.coverImage || '/default-cover.jpg'" class="thumb" />
              <span class="type-badge small" v-if="item.contentType">{{ typeLabel(item.contentType) }}</span>
            </div>
            <div class="content">
              <div class="title">{{ item.title }}</div>
              <div class="summary" v-if="item.summary">{{ item.summary }}</div>
              <div class="meta">
                <span class="author">{{ item.author }}</span>
                <span>{{ item.categoryName }}</span>
                <span>{{ item.viewCount || 0 }} 浏览</span>
                <span>{{ formatDate(item.publishTime || item.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无内容" :image-size="80" />
      </div>
    </template>

    <template v-else>
      <div class="category-section-header">
        <h3>{{ currentCategoryName }}</h3>
        <span class="count">共 {{ totalCount }} 条</span>
      </div>
      <div class="grid-container" v-if="latestList.length > 0">
        <div v-for="item in latestList" :key="item.contentId" class="content-card" @click="goToDetail(item.contentId)">
          <div class="cover-wrapper">
            <img :src="item.coverImage || '/default-cover.jpg'" class="cover" />
            <span class="type-badge" v-if="item.contentType">{{ typeLabel(item.contentType) }}</span>
          </div>
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="meta">
              <span>{{ item.author }}</span>
              <span>{{ item.viewCount || 0 }} 浏览</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="该分类暂无内容" :image-size="80" />
    </template>

    <div class="loading-state" v-if="loading">加载中...</div>
    <div class="load-more" v-else-if="!noMore && latestList.length > 0 && (currentCategory !== null && currentCategory !== undefined)" @click="loadMore">加载更多</div>
    <div class="load-more" v-else-if="!noMore && latestList.length > 0" @click="loadMore">加载更多</div>
    <div class="loading-state" v-else-if="latestList.length > 0 && noMore">没有更多了</div>

    <div class="safe-area-bottom"></div>
    <BottomNav active="home" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { listContent, listCategory, listRecommend, getLatestContent, getPersonalizedContent } from '@/api/content'
import { formatDate } from '@/utils'

const router = useRouter()
const searchKeyword = ref('')
const currentCategory = ref(null)
const categories = ref([])
const topList = ref([])
const recommendList = ref([])
const personalizedList = ref([])
const latestList = ref([])
const loading = ref(false)
const noMore = ref(false)
const pageNum = ref(1)
const pageSize = 10
const totalCount = ref(0)

const typeLabel = (t) => ({ '1': '文章', '2': '视频', '3': '图片', '4': '音频' }[t] || '')

const currentCategoryName = computed(() => {
  const cat = categories.value.find(c => c.categoryId === currentCategory.value)
  return cat ? cat.categoryName : ''
})

const getCategories = async () => {
  try {
    const res = await listCategory()
    const cats = res.data || []
    categories.value = [{ categoryId: null, categoryName: '全部' }, ...cats]
  } catch (e) { console.error(e) }
}

const getRecommendList = async () => {
  try {
    const res = await listRecommend()
    const rows = res.data || []
    recommendList.value = rows.slice(0, 6)
    topList.value = rows.filter(r => r.isTop === '1').slice(0, 3)
    if (topList.value.length === 0 && rows.length > 0) {
      topList.value = rows.slice(0, 3)
    }
  } catch (e) { console.error(e) }
}

const getPersonalizedList = async () => {
  try {
    const res = await getPersonalizedContent(6)
    personalizedList.value = res.data || []
  } catch (e) { console.error(e) }
}

const getLatestList = async (reset = false) => {
  if (loading.value) return
  if (reset) {
    pageNum.value = 1
    noMore.value = false
  }
  if (noMore.value) return
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize,
      categoryId: currentCategory.value != null ? currentCategory.value : undefined
    }
    const res = await listContent(params)
    const rows = res.rows || []
    totalCount.value = res.total || 0
    if (reset) {
      latestList.value = rows
    } else {
      latestList.value = [...latestList.value, ...rows]
    }
    if (rows.length < pageSize) {
      noMore.value = true
    } else {
      pageNum.value++
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadMore = () => { getLatestList() }

const switchCategory = (id) => {
  if (currentCategory.value === id) return
  currentCategory.value = id
  getLatestList(true)
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value } })
  }
}

const goToDetail = (id) => { router.push(`/content/${id}`) }

onMounted(() => {
  getCategories()
  getRecommendList()
  getPersonalizedList()
  getLatestList(true)
})
</script>

<style scoped>
.mobile-container {
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-input { flex: 1; border-radius: 20px; }

.category-tabs {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  overflow-x: auto;
  background: white;
  margin-bottom: 8px;
  &::-webkit-scrollbar { display: none; }
}

.tab {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
  background: #f5f7fa;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.banner-carousel {
  margin: 12px 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  :deep(.el-carousel__indicators--outside) { margin-top: -8px; }
  :deep(.el-carousel__indicator .el-carousel__button) { width: 8px; height: 8px; border-radius: 50%; background: rgba(102, 126, 234, 0.3); }
  :deep(.el-carousel__indicator.is-active .el-carousel__button) { background: #667eea; width: 20px; border-radius: 4px; }
}

.banner-item { position: relative; width: 100%; height: 100%; cursor: pointer; }
.banner-img { width: 100%; height: 100%; object-fit: cover; }
.banner-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 40px 16px 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}
.banner-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
.banner-meta { font-size: 12px; display: flex; gap: 10px; opacity: 0.9; }
.banner-type { background: rgba(102, 126, 234, 0.85); padding: 1px 8px; border-radius: 8px; font-size: 11px; }

.section { margin-top: 16px; padding: 0 16px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.category-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 12px;
  padding: 0 16px;
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
  .count { font-size: 13px; color: #909399; }
}

.grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }

.content-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2); }
  .cover-wrapper { position: relative; }
  .cover { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
  .info { padding: 10px; }
  .title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    font-size: 12px;
    color: #909399;
    display: flex;
    justify-content: space-between;
  }
}

.type-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(102, 126, 234, 0.85);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  &.small { font-size: 10px; padding: 1px 6px; }
}

.list-container { display: flex; flex-direction: column; gap: 12px; }

.list-item {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15); }
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

.loading-state { text-align: center; padding: 20px; color: #909399; font-size: 14px; }

.load-more {
  text-align: center;
  padding: 12px;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  &:hover { color: #764ba2; }
}

.safe-area-bottom { height: 60px; }

@media (min-width: 768px) {
  .grid-container { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .content-card .cover { aspect-ratio: 16/9; }
  .list-item .thumb { width: 180px; height: 110px; }
  .banner-carousel { height: 240px !important; }
}

@media (min-width: 1200px) {
  .grid-container { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
  .section { padding: 0 24px; }
  .search-bar { padding: 12px 24px; }
  .category-tabs { padding: 10px 24px; }
  .banner-carousel { margin: 16px 24px; height: 300px !important; }
}
</style>
