<template>
  <div class="mobile-container">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">我的收藏</span>
    </div>

    <!-- 收藏列表 -->
    <div class="list-container" v-if="favorites.length > 0">
      <div
        v-for="item in favorites"
        :key="item.id"
        class="list-item"
        @click="goToDetail(item.contentId)"
      >
        <img :src="item.cover || '/default-cover.jpg'" class="thumb" />
        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="meta">{{ item.categoryName }} · {{ formatDate(item.createTime) }}</div>
        </div>
        <el-icon class="remove-btn" @click.stop="removeFavorite(item.contentId)">
          <CircleClose />
        </el-icon>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-icon class="icon"><Star /></el-icon>
      <p>暂无收藏内容</p>
      <el-button type="primary" @click="$router.push('/')">去浏览</el-button>
    </div>

    <!-- 加载更多 -->
    <div class="loading-state" v-if="loading">加载中...</div>
    <div class="loading-state" v-else-if="noMore && favorites.length > 0">没有更多了</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, CircleClose } from '@element-plus/icons-vue'
import { listFavorites, cancelFavorite } from '@/api/content'
import { formatDate } from '@/utils'

const router = useRouter()

const favorites = ref([])
const loading = ref(false)
const noMore = ref(false)
const pageNum = ref(1)

// 获取收藏列表
const getFavorites = async (loadMore = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await listFavorites({ pageNum: pageNum.value, pageSize: 10 })
    if (loadMore) {
      favorites.value.push(...(res.rows || []))
    } else {
      favorites.value = res.rows || []
    }
    if (res.rows?.length < 10) {
      noMore.value = true
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消收藏
const removeFavorite = async (contentId) => {
  ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await cancelFavorite(contentId)
      ElMessage.success('已取消收藏')
      favorites.value = favorites.value.filter(item => item.contentId !== contentId)
    } catch (error) {
      console.error('取消收藏失败:', error)
    }
  }).catch(() => {})
}

// 跳转到详情
const goToDetail = (id) => {
  router.push(`/content/${id}`)
}

onMounted(() => {
  getFavorites()
})
</script>

<style scoped>
.remove-btn {
  font-size: 20px;
  color: #f56c6c;
  margin-left: 8px;
  cursor: pointer;
}

.empty-state .el-button {
  margin-top: 16px;
}
</style>
