<template>
  <div class="history-page">
    <div class="history-header">
      <h2>浏览历史</h2>
      <span class="count">共 {{ historyList.length }} 条</span>
    </div>

    <div class="history-list" v-loading="loading">
      <div v-for="item in historyList" :key="item.contentId || item.historyId" class="history-item" @click="goToDetail(item.contentId)">
        <div class="item-cover">
          <img :src="item.coverImage || '/default-cover.jpg'" />
        </div>
        <div class="item-info">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">
            <span class="author">{{ item.author }}</span>
            <span class="time">{{ item.viewTime || item.createTime }}</span>
          </div>
        </div>
        <el-icon :size="16" color="#c0c4cc"><ArrowRight /></el-icon>
      </div>

      <div v-if="!loading && historyList.length === 0" class="empty">暂无浏览记录</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getViewHistory } from '@/api/content'

const router = useRouter()
const historyList = ref([])
const loading = ref(false)

const loadHistory = async () => {
  loading.value = true
  try {
    const res = await getViewHistory()
    historyList.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  if (id) router.push('/content/' + id)
}

onMounted(() => { loadHistory() })
</script>

<style scoped>
.history-page { padding: 16px; max-width: 1400px; margin: 0 auto; }
.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.history-header h2 { margin: 0; font-size: 20px; color: #333; }
.count { font-size: 13px; color: #999; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; }
.item-cover { width: 80px; height: 50px; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
.item-cover img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; min-width: 0; }
.item-title { font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: 11px; color: #999; margin-top: 4px; display: flex; gap: 8px; }
.empty { text-align: center; padding: 40px 0; color: #b0b0b0; }

@media (min-width: 768px) {
  .history-page { padding: 24px; }
  .history-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
}

@media (min-width: 1200px) {
  .history-list { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}
</style>
