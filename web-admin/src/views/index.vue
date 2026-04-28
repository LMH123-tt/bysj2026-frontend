<template>
  <div class="app-container home">
    <div class="platform-header">
      <h1 class="platform-title">内容分发平台</h1>
      <p class="platform-subtitle">Content Distribution Platform</p>
      <div class="platform-stats">
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalContent }}</div>
          <div class="stat-label">内容总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">用户总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.pendingAudit }}</div>
          <div class="stat-label">待审核</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.todayContent }}</div>
          <div class="stat-label">今日新增</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ formatNumber(stats.totalViews) }}</div>
          <div class="stat-label">总浏览量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ formatNumber(stats.totalLikes) }}</div>
          <div class="stat-label">总点赞数</div>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="dashboard-content">
      <el-col :sm="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>近7日内容发布趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :sm="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>内容类型分布</span>
            </div>
          </template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :sm="24" :lg="12">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>内容状态统计</span>
            </div>
          </template>
          <div class="stat-grid">
            <div class="stat-row">
              <span class="stat-name">已发布</span>
              <el-progress :percentage="getPercentage(stats.approved, stats.totalContent)" :stroke-width="12" status="success" />
              <span class="stat-val">{{ stats.approved || 0 }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">待审核</span>
              <el-progress :percentage="getPercentage(stats.pendingAudit, stats.totalContent)" :stroke-width="12" status="warning" />
              <span class="stat-val">{{ stats.pendingAudit || 0 }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-name">已驳回</span>
              <el-progress :percentage="getPercentage(stats.rejected, stats.totalContent)" :stroke-width="12" status="exception" />
              <span class="stat-val">{{ stats.rejected || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :sm="24" :lg="12">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>互动数据</span>
            </div>
          </template>
          <div class="interaction-grid">
            <div class="interaction-item">
              <el-icon :size="28" color="#667eea"><View /></el-icon>
              <div class="interaction-info">
                <div class="interaction-number">{{ formatNumber(stats.totalViews) }}</div>
                <div class="interaction-label">总浏览量</div>
              </div>
            </div>
            <div class="interaction-item">
              <el-icon :size="28" color="#f56c6c"><Star /></el-icon>
              <div class="interaction-info">
                <div class="interaction-number">{{ formatNumber(stats.totalLikes) }}</div>
                <div class="interaction-label">总点赞数</div>
              </div>
            </div>
            <div class="interaction-item">
              <el-icon :size="28" color="#e6a23c"><ChatDotRound /></el-icon>
              <div class="interaction-info">
                <div class="interaction-number">{{ formatNumber(stats.totalComments) }}</div>
                <div class="interaction-label">总评论数</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :sm="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>热门内容TOP10</span>
            </div>
          </template>
          <div ref="topChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :sm="24" :lg="12">
        <el-card class="feature-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>技术架构</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="12">
              <h4>后端技术</h4>
              <ul class="tech-list">
                <li>Spring Cloud Alibaba</li>
                <li>Nacos 注册配置中心</li>
                <li>Sentinel 流量防护</li>
                <li>Caffeine + Redis 多级缓存</li>
                <li>OpenFeign 声明式调用</li>
              </ul>
            </el-col>
            <el-col :span="12">
              <h4>前端技术</h4>
              <ul class="tech-list">
                <li>Vue 3 + Composition API</li>
                <li>Element Plus 组件库</li>
                <li>Vite 构建工具</li>
                <li>ECharts 数据可视化</li>
                <li>Pinia 状态管理</li>
              </ul>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { contentStats } from '@/api/content/content'
import { listContentUser, listContent } from '@/api/content/content'
import * as echarts from 'echarts'

const trendChartRef = ref(null)
const typeChartRef = ref(null)
const topChartRef = ref(null)
let trendChart = null
let typeChart = null
let topChart = null

const stats = ref({
  totalContent: 0,
  totalUsers: 0,
  pendingAudit: 0,
  todayContent: 0,
  approved: 0,
  rejected: 0,
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  typeStats: [],
  recentStats: []
})

const formatNumber = (num) => {
  if (!num) return '0'
  const n = Number(num)
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

const getPercentage = (val, total) => {
  if (!total) return 0
  return Math.round((val / total) * 100)
}

const initTrendChart = (data) => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  const dates = (data || []).map(d => d.date)
  const counts = (data || []).map(d => d.count)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      name: '发布数量',
      type: 'line',
      data: counts,
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.4)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
        ])
      },
      lineStyle: { color: '#667eea', width: 2 },
      itemStyle: { color: '#667eea' }
    }]
  })
}

const initTypeChart = (data) => {
  if (!typeChartRef.value) return
  typeChart = echarts.init(typeChartRef.value)
  const typeMap = { '1': '文章', '2': '视频', '3': '图片', '4': '音频' }
  const pieData = (data || []).map(d => ({
    name: typeMap[d.contentType] || '其他',
    value: d.count
  }))
  typeChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'horizontal', bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: pieData.length > 0 ? pieData : [{ name: '暂无数据', value: 0 }],
      color: ['#667eea', '#f56c6c', '#e6a23c', '#67c23a']
    }]
  })
}

  const initTopChart = async () => {
    await nextTick()
    if (!topChartRef.value) return
    try {
      const res = await listContent({ pageNum: 1, pageSize: 10, status: '0' })
      const rows = res.rows || []
      const titles = rows.map(r => (r.title || '').substring(0, 12) + (r.title && r.title.length > 12 ? '...' : ''))
      const viewCounts = rows.map(r => r.viewCount || 0)
      const likeCounts = rows.map(r => r.likeCount || 0)

      topChart = echarts.init(topChartRef.value)
      topChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['浏览量', '点赞数'], top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: titles.reverse(), axisLabel: { fontSize: 11 } },
        series: [
          { name: '浏览量', type: 'bar', data: viewCounts.reverse(), itemStyle: { color: '#667eea' }, barWidth: 12 },
          { name: '点赞数', type: 'bar', data: likeCounts.reverse(), itemStyle: { color: '#f56c6c' }, barWidth: 12 }
        ]
      })
    } catch (e) { /* ignore */ }
  }

const loadStats = async () => {
  try {
    const res = await contentStats()
    const data = res.data || {}
    stats.value.totalContent = data.total || 0
    stats.value.pendingAudit = data.pending || 0
    stats.value.approved = data.approved || 0
    stats.value.rejected = data.rejected || 0
    stats.value.todayContent = data.todayNew || 0
    stats.value.totalViews = data.totalViews || 0
    stats.value.totalLikes = data.totalLikes || 0
    stats.value.totalComments = data.totalComments || 0
    stats.value.typeStats = data.typeStats || []
    stats.value.recentStats = data.recentStats || []

    await nextTick()
    initTrendChart(data.recentStats)
    initTypeChart(data.typeStats)
    initTopChart()
  } catch (e) {
    console.error('加载统计数据失败:', e)
  }

  listContentUser({ pageNum: 1, pageSize: 1 }).then(res => {
    stats.value.totalUsers = res.total || 0
  }).catch(() => {})
}

const handleResize = () => {
  trendChart && trendChart.resize()
  typeChart && typeChart.resize()
}

onMounted(() => {
  loadStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart && trendChart.dispose()
  typeChart && typeChart.dispose()
  if (topChart)
    topChart.dispose()
})
</script>

<style scoped lang="scss">
.home {
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  .platform-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    border-radius: 12px;
    margin-bottom: 24px;
    text-align: center;

    .platform-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .platform-subtitle {
      font-size: 16px;
      margin: 0 0 24px 0;
      opacity: 0.9;
    }

    .platform-stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;

      .stat-item {
        text-align: center;
        min-width: 80px;

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          opacity: 0.9;
        }
      }
    }
  }

  .dashboard-content {
    margin-top: 0;
  }

  .chart-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .chart-container {
      height: 300px;
      width: 100%;
    }
    .chart-card { margin-bottom: 20px; }
  }

  .stat-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .stat-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      .stat-row {
        display: flex;
        align-items: center;
        gap: 12px;
        .stat-name {
          width: 60px;
          font-size: 14px;
          color: #606266;
        }
        .el-progress {
          flex: 1;
        }
        .stat-val {
          width: 40px;
          text-align: right;
          font-weight: 600;
          color: #333;
        }
      }
    }
  }

  .interaction-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    .interaction-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: #f8f9ff;
      border-radius: 10px;
      .interaction-info {
        .interaction-number {
          font-size: 20px;
          font-weight: 700;
          color: #333;
        }
        .interaction-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .feature-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #333;
    }

    .tech-list {
      padding: 0;
      margin: 0;
      list-style-type: none;

      li {
        padding: 6px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        &:last-child { border-bottom: none; }
      }
    }
  }
}
</style>
