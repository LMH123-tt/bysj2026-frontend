<template>
  <div class="mobile-container">
    <div class="page-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <span class="title">内容详情</span>
    </div>

    <div v-if="content.contentId" class="detail-page">
      <div class="detail-header">
        <h1>{{ content.title }}</h1>
        <div class="meta">
          <span class="author" @click="goToProfile(content.authorUserId)">{{ content.author }}</span>
          <span>{{ content.categoryName }}</span>
          <span>{{ content.viewCount || 0 }} 浏览</span>
          <span>{{ formatDate(content.publishTime || content.createTime) }}</span>
          <el-button v-if="content.createBy && isLoggedIn" size="small" type="primary" plain @click="handleAddFriend" style="margin-left:4px;">加好友</el-button>
        </div>
        <div class="tags" v-if="content.tags">
          <el-tag v-for="tag in content.tags.split(',')" :key="tag" size="small" type="info" effect="plain" class="tag clickable" @click="searchByTag(tag.trim())">{{ tag.trim() }}</el-tag>
        </div>
      </div>

      <div class="detail-body">
        <div class="content-type-article" v-if="content.contentType === '1'" v-html="content.content"></div>

        <div class="content-type-video" v-else-if="content.contentType === '2'">
          <div class="video-player-wrapper" v-if="content.sourceUrl">
            <video :src="content.sourceUrl" controls class="media-player video-player" controlslist="nodownload" :poster="content.coverImage" preload="metadata" playsinline></video>
            <div class="video-overlay" v-if="!isPlaying" @click="playVideo">
              <img :src="content.coverImage" class="video-poster" />
              <div class="play-btn"><el-icon :size="48"><VideoPlay /></el-icon></div>
            </div>
          </div>
          <div class="content-text" v-if="content.content" v-html="content.content"></div>
        </div>

        <div class="content-type-image" v-else-if="content.contentType === '3'">
          <div class="image-gallery" v-if="content.sourceUrl">
            <el-image :src="content.sourceUrl" fit="contain" class="gallery-img" :preview-src-list="[content.sourceUrl]" />
          </div>
          <div class="content-text" v-if="content.content" v-html="content.content"></div>
        </div>

        <div class="content-type-audio" v-else-if="content.contentType === '4'">
          <div class="audio-player" v-if="content.sourceUrl">
            <div class="audio-cover-wrapper">
              <img :src="content.coverImage || '/default-cover.jpg'" class="audio-cover" :class="{ spinning: isAudioPlaying }" />
              <div class="audio-vinyl"></div>
            </div>
            <div class="audio-info">
              <div class="audio-title">{{ content.title }}</div>
              <div class="audio-author">{{ content.author }}</div>
            </div>
            <audio :src="content.sourceUrl" controls class="media-player audio-controls" @play="isAudioPlaying = true" @pause="isAudioPlaying = false"></audio>
          </div>
          <div class="content-text" v-if="content.content" v-html="content.content"></div>
        </div>

        <div class="content-type-default" v-else v-html="content.content"></div>
      </div>

      <div class="comment-section">
        <div class="section-header">
          <span class="section-title">评论 ({{ commentTotal }})</span>
        </div>

        <div class="comment-input" v-if="isLoggedIn">
          <el-input v-model="commentText" type="textarea" :rows="2" placeholder="写下你的评论..." maxlength="500" show-word-limit resize="none" />
          <el-button type="primary" size="small" :loading="submitting" @click="submitComment" style="margin-top:8px;">发表评论</el-button>
        </div>
        <div class="comment-input-login" v-else>
          <el-button type="primary" size="small" @click="router.push({ path: '/login', query: { redirect: route.fullPath } })">登录后评论</el-button>
        </div>

        <div class="comment-list">
          <div v-for="comment in commentList" :key="comment.commentId" class="comment-item">
            <div class="comment-avatar" @click="goToProfile(comment.userId)">
              <el-avatar :size="32" :src="comment.avatar || undefined">{{ (comment.nickName || '用户')[0] }}</el-avatar>
            </div>
            <div class="comment-body">
              <div class="comment-meta">
                <span class="comment-author" @click="goToProfile(comment.userId)">{{ comment.nickName || '匿名用户' }}</span>
                <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions">
                <span class="action-btn" @click="handleReply(comment)">回复</span>
              </div>

              <div v-if="replyingTo === comment.commentId" class="reply-input">
                <el-input v-model="replyText" size="small" placeholder="回复 {{ comment.nickName }}..." maxlength="500" />
                <el-button type="primary" size="small" :loading="submitting" @click="submitReply(comment.commentId)" style="margin-left:8px;">发送</el-button>
                <el-button size="small" @click="replyingTo = null; replyText = ''">取消</el-button>
              </div>

              <div v-for="reply in getReplies(comment.commentId)" :key="reply.commentId" class="comment-item reply-item">
                <div class="comment-avatar" @click="goToProfile(reply.userId)">
                  <el-avatar :size="24" :src="reply.avatar || undefined">{{ (reply.nickName || '用户')[0] }}</el-avatar>
                </div>
                <div class="comment-body">
                  <div class="comment-meta">
                    <span class="comment-author" @click="goToProfile(reply.userId)">{{ reply.nickName || '匿名用户' }}</span>
                    <span class="comment-time">{{ formatDate(reply.createTime) }}</span>
                  </div>
                  <div class="comment-content">{{ reply.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="commentList.length === 0 && !commentLoading" class="no-comments">暂无评论，快来发表第一条评论吧</div>
          <div v-if="commentLoading" class="comment-loading">加载中...</div>
          <div v-if="commentList.length > 0 && commentList.length < commentTotal" class="load-more" @click="loadMoreComments">加载更多评论</div>
        </div>
      </div>

      <div class="related-section" v-if="relatedList.length > 0">
        <div class="section-header">
          <span class="section-title">相关推荐</span>
        </div>
        <div class="related-list">
          <div v-for="item in relatedList" :key="'r-' + item.contentId" class="related-item" @click="goToRelated(item.contentId)">
            <div class="related-cover">
              <img :src="item.coverImage || '/default-cover.jpg'" />
            </div>
            <div class="related-info">
              <div class="related-title">{{ item.title }}</div>
              <div class="related-meta">
                <span>{{ item.author }}</span>
                <span>{{ item.viewCount || 0 }} 浏览</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <div class="action-item" @click="handleLike">
          <el-icon :size="22" :color="liked ? '#f56c6c' : '#909399'">
            <StarFilled v-if="liked" />
            <Star v-else />
          </el-icon>
          <span :style="{ color: liked ? '#f56c6c' : '#606266' }">{{ content.likeCount || 0 }}</span>
        </div>
        <div class="action-item" @click="scrollToComment">
          <el-icon :size="22" color="#909399"><ChatDotRound /></el-icon>
          <span>{{ content.commentCount || 0 }}</span>
        </div>
        <div class="action-item" @click="toggleFavorite">
          <el-icon :size="22" :color="isFavorite ? '#e6a23c' : '#909399'">
            <StarFilled v-if="isFavorite" />
            <Star v-else />
          </el-icon>
          <span :style="{ color: isFavorite ? '#e6a23c' : '#606266' }">{{ isFavorite ? '已收藏' : '收藏' }}</span>
        </div>
        <div class="action-item" @click="shareContent">
          <el-icon :size="22" color="#909399"><Share /></el-icon>
          <span>分享</span>
        </div>
      </div>

      <el-dialog v-model="showShareDialog" title="分享内容" width="90%" style="max-width:400px;" :append-to-body="true">
        <div class="share-dialog-content">
          <div class="share-info">
            <img :src="content.coverImage || '/default-cover.jpg'" class="share-cover" v-if="content.coverImage" />
            <div class="share-text">
              <div class="share-title">{{ content.title }}</div>
              <div class="share-author">{{ content.author }}</div>
            </div>
          </div>
          <div class="share-link-box">
            <el-input :model-value="shareLink" readonly size="small">
              <template #append><el-button @click="copyShareLink">复制</el-button></template>
            </el-input>
          </div>
          <div class="share-actions">
            <div class="share-action-item" @click="copyShareLink">
              <el-icon :size="28" color="#667eea"><Link /></el-icon>
              <span>复制链接</span>
            </div>
            <div class="share-action-item" @click="nativeShare" v-if="navigator.share">
              <el-icon :size="28" color="#67c23a"><Share /></el-icon>
              <span>系统分享</span>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>

    <div v-else-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else class="error-state">
      <el-icon :size="48" color="#dcdfe6"><WarningFilled /></el-icon>
      <p>内容加载失败</p>
      <el-button type="primary" size="small" @click="getDetail">重新加载</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getContent, likeContent, checkLike, favoriteContent, cancelFavorite, checkFavorite, getCommentList, addComment, getRelatedContent, shareContent as shareContentApi, addFriend } from '@/api/content'
import { formatDate } from '@/utils'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const contentId = route.params.id

const content = ref({})
const isFavorite = ref(false)
const liked = ref(false)
const loading = ref(true)

const isLoggedIn = computed(() => !!getToken())

const allComments = ref([])
const commentList = ref([])
const commentTotal = ref(0)
const commentPage = ref(1)
const commentLoading = ref(false)
const commentText = ref('')
const replyText = ref('')
const replyingTo = ref(null)
const submitting = ref(false)
const relatedList = ref([])
const isPlaying = ref(false)
const isAudioPlaying = ref(false)
const showShareDialog = ref(false)
const shareLink = ref('')

const getDetail = async () => {
  loading.value = true
  try {
    const res = await getContent(contentId)
    content.value = res.data || {}
    checkFavoriteStatus()
    checkLikeStatus()
    loadRelated()
  } catch (error) {
    console.error('获取内容详情失败:', error)
    content.value = {}
  } finally {
    loading.value = false
  }
}

const loadComments = async (page = 1) => {
  commentLoading.value = true
  try {
    const res = await getCommentList({ contentId, pageNum: page, pageSize: 10, status: '0' })
    const rows = res.rows || []
    if (page === 1) {
      allComments.value = rows
    } else {
      allComments.value = [...allComments.value, ...rows]
    }
    commentList.value = allComments.value.filter(c => !c.parentId)
    commentTotal.value = res.total || 0
    commentPage.value = page
  } catch (e) {
    console.error('加载评论失败:', e)
  } finally {
    commentLoading.value = false
  }
}

const loadMoreComments = () => {
  loadComments(commentPage.value + 1)
}

const getReplies = (parentId) => {
  return allComments.value.filter(c => c.parentId === parentId) || []
}

const submitComment = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    await addComment({ contentId: Number(contentId), content: commentText.value.trim() })
    ElMessage.success('评论成功')
    commentText.value = ''
    content.value.commentCount = (content.value.commentCount || 0) + 1
    loadComments(1)
  } catch (e) {
    if (e.response && e.response.status === 401) {
      ElMessage.warning('请先登录')
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    } else {
      ElMessage.error('评论失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleReply = (comment) => {
  replyingTo.value = comment.commentId
  replyText.value = ''
}

const submitReply = async (parentId) => {
  if (!replyText.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  submitting.value = true
  try {
    await addComment({ contentId: Number(contentId), parentId, content: replyText.value.trim() })
    ElMessage.success('回复成功')
    replyText.value = ''
    replyingTo.value = null
    content.value.commentCount = (content.value.commentCount || 0) + 1
    loadComments(1)
  } catch (e) {
    if (e.response && e.response.status === 401) {
      ElMessage.warning('请先登录')
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    } else {
      ElMessage.error('回复失败')
    }
  } finally {
    submitting.value = false
  }
}

const scrollToComment = () => {
  const el = document.querySelector('.comment-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const checkFavoriteStatus = async () => {
  if (!isLoggedIn.value) {
    isFavorite.value = false
    return
  }
  try {
    const res = await checkFavorite(contentId)
    isFavorite.value = res.data || false
  } catch (e) {
    isFavorite.value = false
  }
}

const checkLikeStatus = async () => {
  if (!isLoggedIn.value) {
    liked.value = false
    return
  }
  try {
    const res = await checkLike(contentId)
    liked.value = res.data || false
  } catch (e) {
    liked.value = false
  }
}

const handleLike = async () => {
  try {
    const res = await likeContent(contentId)
    const isLiked = res.data
    liked.value = isLiked
    if (isLiked) {
      content.value.likeCount = (content.value.likeCount || 0) + 1
      ElMessage.success('点赞成功')
    } else {
      content.value.likeCount = Math.max((content.value.likeCount || 0) - 1, 0)
      ElMessage.success('已取消点赞')
    }
  } catch (e) {
    if (e.response && e.response.status === 401) {
      ElMessage.warning('请先登录')
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    } else {
      ElMessage.error('操作失败')
    }
  }
}

const toggleFavorite = async () => {
  try {
    if (isFavorite.value) {
      await cancelFavorite(contentId)
      isFavorite.value = false
      ElMessage.success('已取消收藏')
    } else {
      await favoriteContent(contentId)
      isFavorite.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      ElMessage.warning('请先登录')
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    } else {
      ElMessage.error('操作失败')
    }
  }
}

const shareContent = async () => {
  try {
    await shareContentApi(contentId)
    content.value.shareCount = (content.value.shareCount || 0) + 1
  } catch (e) { /* ignore */ }
  shareLink.value = window.location.href
  showShareDialog.value = true
}

const copyShareLink = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareLink.value)
    ElMessage.success('链接已复制到剪贴板')
  }
}

const nativeShare = () => {
  if (navigator.share) {
    navigator.share({ title: content.value.title, text: content.value.summary, url: shareLink.value })
  }
}

const playVideo = () => {
  isPlaying.value = true
  const video = document.querySelector('.video-player')
  if (video) video.play()
}

const searchByTag = (tag) => {
  router.push({ path: '/search', query: { keyword: tag } })
}

const goToProfile = (userId) => {
  if (userId) router.push(`/profile/${userId}`)
}

const loadRelated = async () => {
  try {
    const res = await getRelatedContent(contentId, 6)
    relatedList.value = res.data || []
  } catch (e) { console.error(e) }
}

const goToRelated = (id) => {
  router.push('/content/' + id)
  window.location.reload()
}

const handleAddFriend = async () => {
  if (!content.value.createBy) return
  try {
    await addFriend(content.value.createBy)
    ElMessage.success('好友请求已发送')
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '发送失败')
  }
}

onMounted(() => { getDetail(); loadComments(1) })
</script>

<style scoped>
.detail-page { background: #fff; min-height: calc(100vh - 44px); padding-bottom: 70px; }

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  h1 { font-size: 20px; font-weight: 700; color: #333; margin: 0 0 10px 0; line-height: 1.4; }
  .meta { font-size: 12px; color: #909399; display: flex; gap: 12px; flex-wrap: wrap; .author { color: #667eea; font-weight: 500; cursor: pointer; &:active { opacity: 0.7; } } }
  .tags { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; .tag { border-radius: 12px; } .tag.clickable { cursor: pointer; transition: all 0.2s; &:active { transform: scale(0.95); } } }
}

.detail-body { padding: 16px; font-size: 15px; line-height: 1.8; color: #333; word-break: break-word; }

.media-player { width: 100%; border-radius: 8px; background: #000; }

.video-player-wrapper { position: relative; border-radius: 12px; overflow: hidden; background: #000; }
.video-player { width: 100%; border-radius: 12px; }
.video-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1; }
.video-poster { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }
.play-btn { width: 64px; height: 64px; border-radius: 50%; background: rgba(102, 126, 234, 0.85); display: flex; align-items: center; justify-content: center; z-index: 2; transition: transform 0.3s; color: white; }
.play-btn:hover { transform: scale(1.1); }

.audio-player {
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #eef0ff 100%);
  border-radius: 12px;
  .audio-cover-wrapper { position: relative; display: inline-block; margin-bottom: 16px; }
  .audio-cover { width: 180px; height: 180px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2); transition: transform 0.3s; }
  .audio-cover.spinning { animation: spin 8s linear infinite; }
  .audio-vinyl { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border-radius: 50%; background: #333; border: 3px solid #555; }
  .audio-info { margin-bottom: 12px; }
  .audio-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px; }
  .audio-author { font-size: 13px; color: #909399; }
  .audio-controls { width: 100%; margin-top: 8px; border-radius: 20px; }
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.share-dialog-content {
  .share-info { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
  .share-cover { width: 60px; height: 40px; border-radius: 6px; object-fit: cover; }
  .share-title { font-size: 14px; font-weight: 600; color: #333; }
  .share-author { font-size: 12px; color: #909399; margin-top: 2px; }
  .share-link-box { margin-bottom: 16px; }
  .share-actions { display: flex; justify-content: center; gap: 40px; }
  .share-action-item { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; span { font-size: 12px; color: #606266; } &:active { opacity: 0.7; } }
}

.image-gallery { margin-bottom: 12px; .gallery-img { width: 100%; max-height: 400px; border-radius: 8px; } }

.content-text { margin-top: 16px; }

.action-bar {
  position: fixed; bottom: 0; left: 0; right: 0; height: 56px;
  background: #fff; border-top: 1px solid #eee;
  display: flex; justify-content: space-around; align-items: center;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.action-item {
  display: flex; flex-direction: column; align-items: center; cursor: pointer; gap: 2px;
  span { font-size: 11px; color: #606266; }
  &:active { opacity: 0.7; }
}

.comment-section {
  padding: 16px; border-top: 8px solid #f5f5f5;
  .section-header { margin-bottom: 16px; .section-title { font-size: 16px; font-weight: 600; color: #333; } }
  .comment-input { margin-bottom: 16px; }
  .comment-input-login { margin-bottom: 16px; text-align: center; padding: 16px 0; color: #909399; }
  .comment-list { }
  .comment-item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f5f5f5;
    &.reply-item { padding: 8px 0; border-bottom: none; margin-top: 4px; }
  }
  .comment-avatar { flex-shrink: 0; cursor: pointer; }
  .comment-body { flex: 1; min-width: 0; }
  .comment-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
    .comment-author { font-size: 13px; font-weight: 500; color: #333; cursor: pointer; &:active { opacity: 0.7; } }
    .comment-time { font-size: 11px; color: #b0b0b0; }
  }
  .comment-content { font-size: 14px; color: #333; line-height: 1.6; word-break: break-word; }
  .comment-actions { margin-top: 4px; .action-btn { font-size: 12px; color: #909399; cursor: pointer; &:hover { color: #667eea; } } }
  .reply-input { display: flex; align-items: center; margin-top: 8px; gap: 4px; }
  .no-comments { text-align: center; padding: 32px 0; color: #b0b0b0; font-size: 14px; }
  .comment-loading { text-align: center; padding: 16px 0; color: #909399; font-size: 13px; }
  .load-more { text-align: center; padding: 12px 0; color: #667eea; font-size: 13px; cursor: pointer; &:active { opacity: 0.7; } }
}

.related-section {
  padding: 16px; border-top: 8px solid #f5f5f5;
  .section-header { margin-bottom: 12px; .section-title { font-size: 16px; font-weight: 600; color: #333; } }
  .related-list { display: flex; flex-direction: column; gap: 10px; }
  .related-item { display: flex; gap: 10px; padding: 8px; border-radius: 8px; cursor: pointer; &:active { background: #f5f5f5; } }
  .related-cover { width: 80px; height: 50px; border-radius: 6px; overflow: hidden; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }
  .related-info { flex: 1; min-width: 0; }
  .related-title { font-size: 13px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .related-meta { font-size: 11px; color: #b0b0b0; margin-top: 4px; display: flex; gap: 8px; }
}

.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 60vh; gap: 12px; color: #909399; font-size: 14px;
}

.error-state { p { margin: 0; font-size: 15px; color: #606266; } }
</style>
