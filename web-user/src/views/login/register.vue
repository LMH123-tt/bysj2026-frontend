<template>
  <div class="login-container">
    <div class="logo">
      <h1>注册账号</h1>
      <p>加入内容分发平台，开启精彩之旅</p>
    </div>

    <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form">
      <el-form-item class="input-item" prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="请输入用户名"
          :prefix-icon="User"
          size="large"
        />
      </el-form-item>

      <el-form-item class="input-item" prop="nickname">
        <el-input
          v-model="registerForm.nickname"
          placeholder="请输入昵称"
          :prefix-icon="Avatar"
          size="large"
        />
      </el-form-item>

      <el-form-item class="input-item" prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          size="large"
        />
      </el-form-item>

      <el-form-item class="input-item" prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请确认密码"
          :prefix-icon="Lock"
          size="large"
          @keyup.enter="handleRegister"
        />
      </el-form-item>

      <el-button
        type="primary"
        class="submit-btn"
        :loading="loading"
        @click="handleRegister"
      >
        注 册
      </el-button>

      <div class="extra-links">
        <router-link to="/login">已有账号？去登录</router-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Avatar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { register } from '@/api/login'

const router = useRouter()

const registerForm = ref({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

// 确认密码验证
const validateConfirmPwd = (rule, value, callback) => {
  if (value !== registerForm.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '昵称不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' }
  ]
}

// 注册
const handleRegister = async () => {
  if (!registerForm.value.username || !registerForm.value.password || !registerForm.value.nickname) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    await register({
      userName: registerForm.value.username,
      nickName: registerForm.value.nickname,
      password: registerForm.value.password
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container .logo {
  text-align: center;
  margin-bottom: 48px;
}

.login-container .logo h1 {
  font-size: 28px;
  color: #fff;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.login-container .logo p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.login-form {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  padding: 32px 24px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.input-item {
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  margin-top: 8px;
}

.extra-links {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
}

.extra-links a {
  color: #409eff;
}
</style>
