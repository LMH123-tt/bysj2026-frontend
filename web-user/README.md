# 内容分发系统 - 用户端 (web-user)

基于 Vue 3 + Element Plus 构建的内容分发平台 C 端用户端。

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Pinia (状态管理)
- Element Plus (UI组件库)
- Axios (HTTP请求)
- Vite (构建工具)

## 项目结构

```
web-user/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口定义
│   │   ├── content.js     # 内容相关接口
│   │   ├── login.js       # 登录认证接口
│   │   ├── notice.js      # 公告接口
│   │   └── user.js        # 用户接口
│   ├── assets/           # 资源文件
│   │   └── styles/        # 样式文件
│   ├── components/        # 公共组件
│   │   └── BottomNav.vue  # 底部导航组件
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── store/            # 状态管理
│   │   ├── index.js
│   │   └── modules/
│   │       └── user.js    # 用户状态
│   ├── utils/            # 工具函数
│   │   ├── auth.js       # Token处理
│   │   ├── index.js      # 通用工具
│   │   └── request.js    # Axios封装
│   ├── views/            # 页面视图
│   │   ├── content/      # 内容相关
│   │   │   ├── category.vue    # 分类浏览
│   │   │   ├── detail.vue      # 内容详情
│   │   │   └── search.vue      # 搜索
│   │   ├── error/        # 错误页面
│   │   │   └── 404.vue
│   │   ├── home/         # 首页
│   │   │   └── index.vue
│   │   ├── login/        # 登录注册
│   │   │   ├── index.vue
│   │   │   └── register.vue
│   │   └── user/         # 用户中心
│   │       ├── favorites.vue   # 收藏
│   │       ├── index.vue      # 用户主页
│   │       ├── notice.vue     # 公告列表
│   │       ├── noticeDetail.vue # 公告详情
│   │       └── profile.vue    # 个人资料
│   ├── App.vue
│   └── main.js
├── .env.development      # 开发环境配置
├── .env.production       # 生产环境配置
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## 功能模块

### 1. 用户认证
- 用户登录
- 用户注册
- 验证码登录

### 2. 首页
- 搜索栏
- 分类标签切换
- 轮播图（热门内容）
- 热门推荐内容
- 最新发布内容

### 3. 分类浏览
- 分类筛选
- 列表展示
- 无限滚动加载

### 4. 内容详情
- 内容展示
- 收藏/取消收藏
- 分享功能

### 5. 搜索
- 关键词搜索
- 搜索结果展示
- 高亮关键词

### 6. 用户中心
- 用户信息展示
- 浏览/收藏统计
- 个人资料管理
- 修改密码
- 头像上传

### 7. 收藏管理
- 收藏列表
- 取消收藏

### 8. 公告系统
- 公告列表
- 公告详情
- 已读/未读状态

## 后端接口约定

项目基于admin项目已有后端接口进行开发，主要使用以下接口：

### 认证接口
- `POST /auth/login` - 登录
- `POST /auth/register` - 注册
- `DELETE /auth/logout` - 退出
- `GET /code` - 获取验证码

### 用户接口
- `GET /system/user/getInfo` - 获取用户信息
- `GET /system/user/profile` - 获取个人资料
- `PUT /system/user/profile` - 修改个人资料
- `PUT /system/user/profile/updatePwd` - 修改密码
- `POST /system/user/profile/avatar` - 上传头像

### 公告接口
- `GET /system/notice/list` - 公告列表
- `GET /system/notice/:id` - 公告详情
- `GET /system/notice/listTop` - 置顶公告
- `POST /system/notice/markRead` - 标记已读

### 内容接口（需后端实现）
- `GET /content/list` - 内容列表
- `GET /content/recommend` - 推荐内容
- `GET /content/:id` - 内容详情
- `GET /content/category/list` - 分类列表
- `GET /content/search` - 搜索内容
- `POST /content/favorite/:id` - 收藏内容
- `DELETE /content/favorite/:id` - 取消收藏
- `GET /content/favorites` - 收藏列表

## 安装运行

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产环境构建
npm run build

# 预览生产构建
npm run preview
```

## 开发配置

- 开发服务器端口: 5174
- 后端API代理: `http://localhost:8088`
- API前缀: `/dev-api`

## 注意事项

1. 确保后端服务在端口8088运行
2. 首次运行需要安装依赖 `npm install`
3. 移动端适配：项目采用移动端优先设计，建议使用手机浏览器或开发者工具的移动端模式查看
