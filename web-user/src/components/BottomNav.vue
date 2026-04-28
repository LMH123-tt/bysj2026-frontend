<template>
  <div class="bottom-nav">
    <div
      v-for="item in navItems"
      :key="item.name"
      class="nav-item"
      :class="{ active: active === item.name }"
      @click="handleNav(item)"
    >
      <el-icon class="icon">
        <component :is="active === item.name ? item.activeIcon : item.icon" />
      </el-icon>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeFilled, House, ChatDotRound, ChatLineSquare, User, UserFilled, TrendCharts, Histogram } from '@element-plus/icons-vue'

const props = defineProps({
  active: {
    type: String,
    default: 'home'
  }
})

const router = useRouter()

const navItems = [
  { name: 'home', label: '首页', path: '/', icon: 'House', activeIcon: 'HomeFilled' },
  { name: 'message', label: '私信', path: '/message', icon: 'ChatDotRound', activeIcon: 'ChatLineSquare' },
  { name: 'ranking', label: '排行', path: '/ranking', icon: 'Histogram', activeIcon: 'TrendCharts' },
  { name: 'user', label: '我的', path: '/user', icon: 'User', activeIcon: 'UserFilled' }
]

const handleNav = (item) => {
  if (props.active !== item.name) {
    router.push(item.path)
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.3s;
  padding: 4px 16px;
}

.nav-item .icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.nav-item.active {
  color: #409eff;
}
</style>
