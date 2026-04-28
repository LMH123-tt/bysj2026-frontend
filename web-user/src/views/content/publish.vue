<template>
  <div class="mobile-container">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">发布内容</span>
      <el-button type="primary" size="small" @click="handleSubmit" :loading="submitting" style="position:absolute;right:16px;">发布</el-button>
    </div>

    <div class="publish-form">
      <el-form :model="form" label-position="top">
        <el-form-item label="内容类型" required>
          <el-radio-group v-model="form.contentType">
            <el-radio label="1">文章</el-radio>
            <el-radio label="2">视频</el-radio>
            <el-radio label="3">图片</el-radio>
            <el-radio label="4">音频</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width:100%;">
            <el-option v-for="cat in categories" :key="cat.categoryId" :label="cat.categoryName" :value="cat.categoryId" />
          </el-select>
        </el-form-item>

        <el-form-item label="封面图片">
          <div class="upload-area" @click="triggerCoverUpload">
            <img v-if="form.coverImage" :src="form.coverImage" class="cover-preview" />
            <div v-else class="upload-placeholder">
              <el-icon :size="32"><Plus /></el-icon>
              <span>上传封面</span>
            </div>
          </div>
          <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="handleCoverChange" />
        </el-form-item>

        <el-form-item v-if="form.contentType === '2'" label="视频文件">
          <div class="upload-area" @click="triggerMediaUpload" v-if="!form.sourceUrl && !uploading">
            <div class="upload-placeholder">
              <el-icon :size="32"><VideoCamera /></el-icon>
              <span>上传视频</span>
              <span class="upload-hint">支持大文件分片上传</span>
            </div>
          </div>
          <div v-if="uploading" class="upload-progress-area">
            <div class="progress-header">
              <el-icon class="is-loading" :size="16"><Loading /></el-icon>
              <span class="progress-filename">{{ uploadFileName }}</span>
            </div>
            <el-progress :percentage="uploadProgress" :stroke-width="8" :color="progressColor" />
            <div class="progress-info">
              <span>{{ formatSize(uploadedSize) }} / {{ formatSize(totalSize) }}</span>
              <span>{{ uploadSpeed }}</span>
            </div>
            <div class="progress-actions">
              <el-button size="small" @click="togglePause">{{ paused ? '继续' : '暂停' }}</el-button>
              <el-button size="small" type="danger" @click="cancelUpload">取消</el-button>
            </div>
          </div>
          <div v-if="form.sourceUrl" class="media-preview-wrapper">
            <video :src="form.sourceUrl" class="media-preview" controls />
            <el-button class="remove-media" size="small" type="danger" circle @click="removeMedia">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <input ref="mediaInput" type="file" accept="video/*" style="display:none" @change="handleMediaChange" />
        </el-form-item>

        <el-form-item v-if="form.contentType === '3'" label="图片文件">
          <div class="upload-area" @click="triggerMediaUpload" v-if="!form.sourceUrl">
            <div class="upload-placeholder">
              <el-icon :size="32"><Picture /></el-icon>
              <span>上传图片</span>
            </div>
          </div>
          <div v-if="form.sourceUrl" class="media-preview-wrapper">
            <img :src="form.sourceUrl" class="media-preview" />
            <el-button class="remove-media" size="small" type="danger" circle @click="removeMedia">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <input ref="mediaInput" type="file" accept="image/*" style="display:none" @change="handleMediaChange" />
        </el-form-item>

        <el-form-item v-if="form.contentType === '4'" label="音频文件">
          <div class="upload-area" @click="triggerMediaUpload" v-if="!form.sourceUrl && !uploading">
            <div class="upload-placeholder">
              <el-icon :size="32"><Headset /></el-icon>
              <span>上传音频</span>
              <span class="upload-hint">支持大文件分片上传</span>
            </div>
          </div>
          <div v-if="uploading" class="upload-progress-area">
            <div class="progress-header">
              <el-icon class="is-loading" :size="16"><Loading /></el-icon>
              <span class="progress-filename">{{ uploadFileName }}</span>
            </div>
            <el-progress :percentage="uploadProgress" :stroke-width="8" :color="progressColor" />
            <div class="progress-info">
              <span>{{ formatSize(uploadedSize) }} / {{ formatSize(totalSize) }}</span>
              <span>{{ uploadSpeed }}</span>
            </div>
            <div class="progress-actions">
              <el-button size="small" @click="togglePause">{{ paused ? '继续' : '暂停' }}</el-button>
              <el-button size="small" type="danger" @click="cancelUpload">取消</el-button>
            </div>
          </div>
          <div v-if="form.sourceUrl" class="media-preview-wrapper">
            <audio :src="form.sourceUrl" class="media-preview" controls />
            <el-button class="remove-media" size="small" type="danger" circle @click="removeMedia">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <input ref="mediaInput" type="file" accept="audio/*" style="display:none" @change="handleMediaChange" />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="请输入摘要" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item v-if="form.contentType === '1'" label="正文内容">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入文章内容" />
        </el-form-item>

        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔，如：科技,互联网" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, VideoCamera, Picture, Headset, Close, Loading } from '@element-plus/icons-vue'
import { publishContent, listCategory } from '@/api/content'
import { getToken } from '@/utils/auth'
import axios from 'axios'

const router = useRouter()
const coverInput = ref(null)
const mediaInput = ref(null)
const submitting = ref(false)
const categories = ref([])

const CHUNK_SIZE = 5 * 1024 * 1024
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024

const uploading = ref(false)
const uploadProgress = ref(0)
const uploadFileName = ref('')
const uploadedSize = ref(0)
const totalSize = ref(0)
const uploadSpeed = ref('')
const paused = ref(false)
const cancelled = ref(false)
const progressColor = ref('#667eea')

let pauseResolve = null
let speedTimer = null
let lastUploadedSize = 0

const form = ref({
  title: '',
  summary: '',
  content: '',
  categoryId: null,
  contentType: '1',
  coverImage: '',
  sourceUrl: '',
  tags: '',
  status: '1'
})

const getCategories = async () => {
  try {
    const res = await listCategory()
    categories.value = res.data || []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const triggerCoverUpload = () => {
  coverInput.value.click()
}

const triggerMediaUpload = () => {
  mediaInput.value.click()
}

const getBaseURL = () => import.meta.env.VITE_APP_BASE_API
const getAuthHeaders = () => {
  const token = getToken()
  return { 'Authorization': token ? 'Bearer ' + token : '' }
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

const calculateFileMd5 = (file) => {
  return new Promise((resolve) => {
    const fileName = file.name
    const fileSize = file.size
    const lastModified = file.lastModified
    let hash = 0
    const str = fileName + '_' + fileSize + '_' + lastModified
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    const md5 = Math.abs(hash).toString(16).padStart(8, '0') + fileSize.toString(16).padStart(8, '0')
    resolve(md5)
  })
}

const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(getBaseURL() + '/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeaders()
    }
  })
  if (response.data.code === 200) {
    return response.data.data.url
  }
  throw new Error(response.data.msg || '上传失败')
}

const startSpeedMonitor = () => {
  lastUploadedSize = uploadedSize.value
  speedTimer = setInterval(() => {
    const diff = uploadedSize.value - lastUploadedSize
    uploadSpeed.value = diff > 0 ? formatSize(diff) + '/s' : ''
    lastUploadedSize = uploadedSize.value
  }, 1000)
}

const stopSpeedMonitor = () => {
  if (speedTimer) {
    clearInterval(speedTimer)
    speedTimer = null
  }
  uploadSpeed.value = ''
}

const chunkUpload = async (file) => {
  const fileMd5 = await calculateFileMd5(file)
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  uploading.value = true
  uploadProgress.value = 0
  uploadFileName.value = file.name
  totalSize.value = file.size
  uploadedSize.value = 0
  paused.value = false
  cancelled.value = false
  progressColor.value = '#667eea'

  startSpeedMonitor()

  try {
    const checkRes = await axios.get(getBaseURL() + '/file/chunk/check', {
      params: { fileMd5, totalChunks },
      headers: getAuthHeaders()
    })

    const uploadedChunks = new Set(checkRes.data?.data?.uploadedChunks || [])

    for (let i = 0; i < totalChunks; i++) {
      if (cancelled.value) {
        throw new Error('上传已取消')
      }

      if (paused.value) {
        await new Promise((resolve) => { pauseResolve = resolve })
        if (cancelled.value) {
          throw new Error('上传已取消')
        }
      }

      if (uploadedChunks.has(i)) {
        uploadedSize.value = Math.min((i + 1) * CHUNK_SIZE, file.size)
        uploadProgress.value = Math.round(((i + 1) / totalChunks) * 100)
        continue
      }

      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('file', chunk)
      formData.append('fileMd5', fileMd5)
      formData.append('chunkIndex', i)
      formData.append('totalChunks', totalChunks)
      formData.append('fileName', file.name)

      await axios.post(getBaseURL() + '/file/chunk/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        }
      })

      uploadedSize.value = end
      uploadProgress.value = Math.round(((i + 1) / totalChunks) * 100)
    }

    uploadProgress.value = 99
    progressColor.value = '#e6a23c'

    const mergeRes = await axios.post(getBaseURL() + '/file/chunk/merge', null, {
      params: { fileMd5, fileName: file.name, totalChunks },
      headers: getAuthHeaders()
    })

    if (mergeRes.data.code === 200) {
      uploadProgress.value = 100
      progressColor.value = '#67c23a'
      return mergeRes.data.data.url
    }
    throw new Error(mergeRes.data.msg || '合并文件失败')
  } finally {
    stopSpeedMonitor()
    setTimeout(() => {
      uploading.value = false
    }, 800)
  }
}

const togglePause = () => {
  paused.value = !paused.value
  if (!paused.value && pauseResolve) {
    pauseResolve()
    pauseResolve = null
    startSpeedMonitor()
  } else {
    stopSpeedMonitor()
  }
}

const cancelUpload = () => {
  cancelled.value = true
  paused.value = false
  if (pauseResolve) {
    pauseResolve()
    pauseResolve = null
  }
  uploading.value = false
  uploadProgress.value = 0
  ElMessage.warning('上传已取消')
}

const handleCoverChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    ElMessage.info('正在上传封面...')
    const url = await uploadFile(file)
    form.value.coverImage = url
    ElMessage.success('封面上传成功')
  } catch (error) {
    ElMessage.error('封面上传失败: ' + error.message)
  }
  e.target.value = ''
}

const handleMediaChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  e.target.value = ''

  try {
    let url
    if (file.size > LARGE_FILE_THRESHOLD) {
      url = await chunkUpload(file)
      ElMessage.success('文件上传成功')
    } else {
      ElMessage.info('正在上传文件，请耐心等待...')
      url = await uploadFile(file)
      ElMessage.success('文件上传成功')
    }
    form.value.sourceUrl = url
  } catch (error) {
    if (error.message !== '上传已取消') {
      ElMessage.error('文件上传失败: ' + error.message)
    }
  }
}

const removeMedia = () => {
  form.value.sourceUrl = ''
}

const handleSubmit = async () => {
  if (!form.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!form.value.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (form.value.contentType !== '1' && !form.value.sourceUrl) {
    ElMessage.warning('请上传媒体文件')
    return
  }
  if (uploading.value) {
    ElMessage.warning('文件正在上传中，请等待完成')
    return
  }
  submitting.value = true
  try {
    await publishContent(form.value)
    ElMessage.success('发布成功')
    router.push('/user')
  } catch (error) {
    ElMessage.error('发布失败: ' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  getCategories()
})

onUnmounted(() => {
  stopSpeedMonitor()
  cancelled.value = true
  if (pauseResolve) {
    pauseResolve()
    pauseResolve = null
  }
})
</script>

<style scoped>
.publish-form { padding: 16px; background: #fff; }
.upload-area { width: 100%; min-height: 120px; border: 2px dashed #dcdfe6; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: border-color 0.3s; }
.upload-area:hover { border-color: #409eff; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; color: #909399; gap: 8px; }
.upload-hint { font-size: 12px; color: #c0c4cc; }
.cover-preview { width: 100%; max-height: 200px; object-fit: cover; border-radius: 6px; }
.media-preview { width: 100%; max-height: 240px; border-radius: 6px; }

.media-preview-wrapper { position: relative; }
.remove-media { position: absolute; top: 8px; right: 8px; }

.upload-progress-area {
  padding: 16px;
  background: #f8f9ff;
  border-radius: 10px;
  border: 1px solid #e8ecff;
}
.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.progress-filename {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
.progress-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
