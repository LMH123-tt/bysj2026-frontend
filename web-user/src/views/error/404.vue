<template>
  <div class="error-page">
    <div class="error-content">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { WarningFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.error-content {
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 80px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.error-content h1 {
  font-size: 72px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
}

.error-content p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
}
</style>
