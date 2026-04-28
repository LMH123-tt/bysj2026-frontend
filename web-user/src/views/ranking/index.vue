<template>
  <div class="ranking-page">
    <div class="ranking-header">
      <h2>内容排行榜</h2>
      <div class="period-tabs">
        <span :class="['tab', period === 'all' ? 'active' : '']" @click="period = 'all'; loadRanking()">全部</span>
        <span :class="['tab', period === 'week' ? 'active' : '']" @click="period = 'week'; loadRanking()">周榜</span>
        <span :class="['tab', period === 'month' ? 'active' : '']" @click="period = 'month'; loadRanking()">月榜</span>
      </div>
    </div>

    <div class="category-tabs">
      <span :class="['cat-tab', !selectedCategory ? 'active' : '']" @click="selectedCategory = null; loadRanking()">全站</span>
      <span v-for="cat in categories" :key="cat.categoryId"
            :class="['cat-tab', selectedCategory === cat.categoryId ? 'active' : '']"
            @click="selectedCategory = cat.categoryId; loadRanking()">
        {{ cat.categoryName }}
      </span>
    </div>

    <div class="ranking-list" v-loading="loading">
      <div v-for="(item, index) in rankingList" :key="item.contentId" class="ranking-item" @click="goToDetail(item.contentId)">
        <div :class="['rank-badge', index < 3 ? 'top-' + (index + 1) : '']">
          <span>{{ index + 1 }}</span>
        </div>
        <div class="item-cover">
          <img :src="item.coverImage || '/default-cover.jpg'" />
        </div>
        <div class="item-info">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">
            <span class="author">{{ item.author }}</span>
            <span class="category">{{ item.categoryName }}</span>
          </div>
          <div class="item-stats">
            <span><el-icon :size="12"><View /></el-icon> {{ item.viewCount || 0 }}</span>
            <span><el-icon :size="12"><Star /></el-icon> {{ item.likeCount || 0 }}</span>
            <span><el-icon :size="12"><ChatDotRound /></el-icon> {{ item.commentCount || 0 }}</span>
          </div>
        </div>
        <div class="heat-score">
          {{ calcHeat(item) }}
        </div>
      </div>

      <div v-if="!loading && rankingList.length === 0" class="empty">暂无排行数据</div>
    </div>

    <div class="safe-area-bottom"></div>
    <BottomNav active="ranking" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { getRanking, listCategory } from '@/api/content'

const router = useRouter()
const rankingList = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const period = ref('all')
const loading = ref(false)

const loadCategories = async () => {
  try {
    const res = await listCategory()
    categories.value = (res.data || []).filter(c => c.status === '0')
  } catch (e) { console.error(e) }
}

const loadRanking = async () => {
  loading.value = true
  try {
    const res = await getRanking(selectedCategory.value, period.value, 30)
    rankingList.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const calcHeat = (item) => {
  const score = (item.viewCount || 0) * 1 + (item.likeCount || 0) * 5 + (item.commentCount || 0) * 8 + (item.shareCount || 0) * 10
  if (score >= 10000) return (score / 10000).toFixed(1) + '万'
  return score
}

const goToDetail = (id) => {
  router.push('/content/' + id)
}

onMounted(() => { loadCategories(); loadRanking() })
</script>

<style scoped>
.ranking-page { padding: 16px; max-width: 1400px; margin: 0 auto; min-height: 100vh; }
.ranking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.ranking-header h2 { margin: 0; font-size: 20px; color: #333; }
.period-tabs { display: flex; gap: 12px; }
.tab { padding: 4px 12px; border-radius: 16px; font-size: 13px; cursor: pointer; color: #666; background: #f5f5f5; }
.tab.active { background: #667eea; color: #fff; }
.category-tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; padding-bottom: 4px; }
.cat-tab { padding: 4px 10px; border-radius: 12px; font-size: 12px; cursor: pointer; color: #666; white-space: nowrap; background: #f5f5f5; }
.cat-tab.active { background: #667eea; color: #fff; }
.ranking-list { display: flex; flex-direction: column; gap: 8px; }
.ranking-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.15s; }
.ranking-item:active { transform: scale(0.98); }
.rank-badge { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #999; background: #f0f0f0; flex-shrink: 0; }
.rank-badge.top-1 { background: #ff6b6b; color: #fff; }
.rank-badge.top-2 { background: #ffa94d; color: #fff; }
.rank-badge.top-3 { background: #ffd43b; color: #333; }
.item-cover { width: 80px; height: 55px; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
.item-cover img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; min-width: 0; }
.item-title { font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: 11px; color: #999; margin-top: 2px; display: flex; gap: 8px; }
.item-stats { font-size: 11px; color: #b0b0b0; margin-top: 4px; display: flex; gap: 10px; align-items: center; }
.heat-score { font-size: 14px; font-weight: 700; color: #667eea; flex-shrink: 0; }
.empty { text-align: center; padding: 40px 0; color: #b0b0b0; }
.safe-area-bottom { height: 60px; }

@media (min-width: 768px) {
  .ranking-page { padding: 24px; }
  .ranking-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .item-cover { width: 100px; height: 65px; }
  .ranking-header h2 { font-size: 24px; }
}

@media (min-width: 1200px) {
  .ranking-list { grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .ranking-page { padding: 24px 32px; }
}
</style>
