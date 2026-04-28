<template>
  <div class="mobile-container">
    <div class="page-header">
      <span class="title">分类浏览</span>
    </div>

    <div class="category-tabs sticky">
      <div
        v-for="cat in categories"
        :key="cat.categoryId"
        class="tab"
        :class="{ active: currentCategory === cat.categoryId }"
        @click="switchCategory(cat.categoryId)"
      >
        {{ cat.categoryName }}
      </div>
    </div>

    <div class="list-container">
      <div
        v-for="item in contentList"
        :key="item.contentId"
        class="list-item"
        @click="goToDetail(item.contentId)"
      >
        <img :src="item.coverImage || '/default-cover.jpg'" class="thumb" />
        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="meta">
            <span v-if="item.author">{{ item.author }}</span>
            <span>{{ item.viewCount || 0 }} 浏览</span>
            <span>{{ item.categoryName }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" v-if="loading">加载中...</div>
    <div class="empty-state" v-else-if="contentList.length === 0">
      <el-icon class="icon"><Document /></el-icon>
      <p>暂无内容</p>
    </div>
    <div class="loading-state" v-else-if="noMore">没有更多了</div>
    <div class="load-more-btn" v-else-if="contentList.length > 0" @click="loadMore">加载更多</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listContent, listCategory } from '@/api/content'
import { formatDate } from '@/utils'

const router = useRouter()
const categories = ref([{ categoryId: null, categoryName: '全部' }])
const currentCategory = ref(null)
const contentList = ref([])
const loading = ref(false)
const noMore = ref(false)
const pageNum = ref(1)

const getCategories = async () => {
  try {
    const res = await listCategory()
    const list = res.data || []
    categories.value = [{ categoryId: null, categoryName: '全部' }, ...list.filter(c => c.status === '0')]
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const getContentList = async (loadMore = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: 10,
      status: '0'
    }
    if (currentCategory.value != null) {
      params.categoryId = currentCategory.value
    }
    const res = await listContent(params)
    const rows = res.rows || []
    if (loadMore) {
      contentList.value = [...contentList.value, ...rows]
    } else {
      contentList.value = rows
    }
    if (rows.length < 10) {
      noMore.value = true
    }
  } catch (error) {
    console.error('获取内容失败:', error)
  } finally {
    loading.value = false
  }
}

const switchCategory = (id) => {
  currentCategory.value = id
  pageNum.value = 1
  noMore.value = false
  contentList.value = []
  getContentList()
}

const loadMore = () => {
  if (!loading.value && !noMore.value) {
    pageNum.value++
    getContentList(true)
  }
}

const goToDetail = (id) => {
  router.push('/content/' + id)
}

onMounted(() => {
  getCategories()
  getContentList()
})
</script>

<style scoped>
.mobile-container { max-width: 1400px; margin: 0 auto; min-height: 100vh; }
.sticky {
  position: sticky;
  top: 44px;
  z-index: 10;
  background: #fff;
}
.list-container { padding: 0 16px; }
.list-item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.list-item:active { background: #fafafa; }
.thumb { width: 140px; height: 90px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: #f0f0f0; }
.content { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.title { font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.meta { font-size: 11px; color: #b0b0b0; margin-top: 6px; display: flex; gap: 8px; }
.loading-state, .empty-state { text-align: center; padding: 40px 0; color: #b0b0b0; font-size: 14px; }
.load-more-btn { text-align: center; padding: 16px 0; color: #667eea; font-size: 13px; cursor: pointer; }

@media (min-width: 768px) {
  .list-container { padding: 0 24px; }
  .thumb { width: 180px; height: 110px; }
}

@media (min-width: 1200px) {
  .list-container { padding: 0 32px; }
}
</style>
