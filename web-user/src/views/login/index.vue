<template>
  <div class="login-container">
    <div class="logo">
      <h1>内容分发平台</h1>
      <p>发现精彩内容，分享无限可能</p>
    </div>

    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
      <el-form-item class="input-item" prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
          :prefix-icon="User"
          size="large"
        />
      </el-form-item>

      <el-form-item class="input-item" prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          size="large"
          @keyup.enter="handleLogin"
        />
      </el-form-item>

      <el-form-item class="input-item" prop="code" v-if="captchaEnabled">
        <div style="display: flex; gap: 12px;">
          <el-input
            v-model="loginForm.code"
            placeholder="验证码"
            :prefix-icon="CircleCheck"
            size="large"
            style="flex: 1;"
            @keyup.enter="handleLogin"
          />
          <div class="captcha-img" @click="getCaptcha">
            <img :src="captchaUrl" alt="验证码" />
          </div>
        </div>
      </el-form-item>

      <el-button
        type="primary"
        class="submit-btn"
        :loading="loading"
        @click="handleLogin"
      >
        登 录
      </el-button>

      <div class="extra-links">
        <router-link to="/register">注册账号</router-link>
        <a href="javascript:;" @click="handleForgetPwd">忘记密码?</a>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { getCodeImg } from '@/api/login'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginForm = ref({
  username: '212121',
  password: '212121',
  code: '',
  uuid: ''
})

const loading = ref(false)
const captchaEnabled = ref(false)
const captchaUrl = ref('')

const loginRules = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  code: [{ required: captchaEnabled.value, message: '验证码不能为空', trigger: 'blur' }]
}

// 获取验证码
const getCaptcha = async () => {
  try {
    const res = await getCodeImg()
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      captchaUrl.value = 'data:image/gif;base64,' + res.img
      loginForm.value.uuid = res.uuid
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 登录
const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (captchaEnabled.value && !loginForm.value.code) {
    ElMessage.warning('请输入验证码')
    return
  }
  loading.value = true
  try {
    await userStore.login(loginForm.value)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    console.error('登录失败:', error)
    if (captchaEnabled.value) {
      getCaptcha()
    }
  } finally {
    loading.value = false
  }
}

// 忘记密码
const handleForgetPwd = () => {
  ElMessage.info('请联系管理员重置密码')
}

onMounted(() => {
  getCaptcha()
})
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

.captcha-img {
  width: 100px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  margin-top: 8px;
}

.extra-links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 13px;
}

.extra-links a {
  color: #606266;
}
</style>
