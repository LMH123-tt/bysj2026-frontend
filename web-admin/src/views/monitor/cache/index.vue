<template>
  <div class="app-container">
    <el-row :gutter="16" class="stats-row">
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card l1">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="28"><Cpu /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.l1HitRate || '0.00%' }}</div>
              <div class="stat-label">L1缓存命中率</div>
            </div>
          </div>
          <div class="stat-detail">命中 {{ stats.l1HitCount || 0 }} / 未命中 {{ stats.l1MissCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card l1-size">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="28"><Coin /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.l1Size || 0 }}</div>
              <div class="stat-label">L1缓存条数</div>
            </div>
          </div>
          <div class="stat-detail">淘汰 {{ stats.l1EvictionCount || 0 }} 条</div>
        </el-card>
      </el-col>
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card l2">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="28"><Cloudy /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.l2KeyCount || 0 }}</div>
              <div class="stat-label">L2缓存键数(Redis)</div>
            </div>
          </div>
          <div class="stat-detail">详情 {{ stats.l2DetailCount || 0 }} / 列表 {{ stats.l2ListCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card arch">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="28"><Connection /></el-icon></div>
            <div class="stat-info">
              <div class="stat-number">3级</div>
              <div class="stat-label">缓存架构</div>
            </div>
          </div>
          <div class="stat-detail">Caffeine → Redis → MySQL</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card>
          <template #header><span>缓存架构说明</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="L1 本地缓存">Caffeine，30秒过期，最大500条</el-descriptions-item>
            <el-descriptions-item label="L2 分布式缓存">Redis，5-30分钟过期+随机抖动</el-descriptions-item>
            <el-descriptions-item label="L3 持久层">MySQL数据库</el-descriptions-item>
            <el-descriptions-item label="穿透防护">空值缓存（60秒TTL）</el-descriptions-item>
            <el-descriptions-item label="击穿防护">互斥锁（ReentrantLock）</el-descriptions-item>
            <el-descriptions-item label="雪崩防护">随机TTL抖动（0-60秒）</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>L2缓存分布</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="内容详情缓存">
              <el-tag type="primary">{{ stats.l2DetailCount || 0 }} 条</el-tag>
              <span style="margin-left:8px;color:#909399;">TTL: 10分钟</span>
            </el-descriptions-item>
            <el-descriptions-item label="列表缓存(热门/推荐/置顶/最新)">
              <el-tag type="success">{{ stats.l2ListCount || 0 }} 条</el-tag>
              <span style="margin-left:8px;color:#909399;">TTL: 5分钟</span>
            </el-descriptions-item>
            <el-descriptions-item label="搜索结果缓存">
              <el-tag type="warning">{{ stats.l2SearchCount || 0 }} 条</el-tag>
              <span style="margin-left:8px;color:#909399;">TTL: 2分钟</span>
            </el-descriptions-item>
            <el-descriptions-item label="分类列表缓存">
              <el-tag type="info">{{ stats.l2CategoryCount || 0 }} 条</el-tag>
              <span style="margin-left:8px;color:#909399;">TTL: 30分钟</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px;">
      <template #header><span>缓存操作</span></template>
      <el-row :gutter="16">
        <el-col :span="4">
          <el-popconfirm title="确认清理全部缓存？" @confirm="clearCache('all')">
            <el-button type="danger" plain>清理全部缓存</el-button>
          </el-popconfirm>
        </el-col>
        <el-col :span="4">
          <el-popconfirm title="确认清理内容详情缓存？" @confirm="clearCache('detail')">
            <el-button type="warning" plain>清理详情缓存</el-button>
          </el-popconfirm>
        </el-col>
        <el-col :span="4">
          <el-popconfirm title="确认清理列表缓存？" @confirm="clearCache('list')">
            <el-button type="warning" plain>清理列表缓存</el-button>
          </el-popconfirm>
        </el-col>
        <el-col :span="4">
          <el-popconfirm title="确认清理搜索缓存？" @confirm="clearCache('search')">
            <el-button type="warning" plain>清理搜索缓存</el-button>
          </el-popconfirm>
        </el-col>
        <el-col :span="4">
          <el-popconfirm title="确认清理分类缓存？" @confirm="clearCache('category')">
            <el-button type="warning" plain>清理分类缓存</el-button>
          </el-popconfirm>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" plain @click="loadStats">刷新统计</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const stats = ref({})

const loadStats = () => {
  request({ url: '/content/cache/stats', method: 'get' }).then(res => {
    stats.value = res.data || {}
  }).catch(() => {})
}

const clearCache = (type) => {
  const urlMap = {
    all: '/content/cache/clear',
    detail: '/content/cache/clear/detail',
    list: '/content/cache/clear/list',
    search: '/content/cache/clear/search',
    category: '/content/cache/clear/category'
  }
  request({ url: urlMap[type], method: 'delete' }).then(() => {
    ElMessage.success('缓存清理成功')
    loadStats()
  }).catch(() => { ElMessage.error('操作失败') })
}

onMounted(() => { loadStats() })
</script>

<style scoped lang="scss">
.stats-row {
  .stat-card {
    border-radius: 8px;
    :deep(.el-card__body) { padding: 16px 20px; }
    .stat-content {
      display: flex; align-items: center; gap: 14px;
      .stat-icon {
        width: 50px; height: 50px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center; color: white;
      }
      .stat-info {
        .stat-number { font-size: 22px; font-weight: 700; line-height: 1.2; }
        .stat-label { font-size: 13px; color: #909399; margin-top: 2px; }
      }
    }
    .stat-detail { font-size: 12px; color: #c0c4cc; margin-top: 8px; }
    &.l1 .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
    &.l1 .stat-number { color: #667eea; }
    &.l1-size .stat-icon { background: linear-gradient(135deg, #e6a23c, #f5c861); }
    &.l1-size .stat-number { color: #e6a23c; }
    &.l2 .stat-icon { background: linear-gradient(135deg, #67c23a, #95d475); }
    &.l2 .stat-number { color: #67c23a; }
    &.arch .stat-icon { background: linear-gradient(135deg, #409eff, #79bbff); }
    &.arch .stat-number { color: #409eff; }
  }
}
</style>
