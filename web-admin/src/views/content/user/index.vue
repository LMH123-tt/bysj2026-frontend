<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 200px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['content:user:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['content:user:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="用户ID" align="center" prop="userId" width="80" />
      <el-table-column label="用户名称" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" align="center" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="手机号码" align="center" prop="phonenumber" width="120" />
      <el-table-column label="性别" align="center" prop="sex" width="70">
        <template #default="scope">
          <span>{{ sexLabel(scope.row.sex) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="最后登录IP" align="center" prop="loginIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="最后登录时间" align="center" prop="loginDate" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:user:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:user:remove']"></el-button>
          </el-tooltip>
          <el-tooltip content="重置密码" placement="top">
            <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['content:user:edit']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="dialogTitle" v-model="dialogOpen" width="500px" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" :disabled="form.userId != undefined" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.sex" placeholder="请选择">
            <el-option label="男" value="0" />
            <el-option label="女" value="1" />
            <el-option label="未知" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="dialogOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listContentUser, getContentUser, updateContentUser, delContentUser, resetContentUserPwd } from '@/api/content/content'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const dialogOpen = ref(false)
const dialogTitle = ref('')

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  phonenumber: undefined,
  status: undefined
})

const form = ref({})
const rules = ref({
  nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  phonenumber: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
})

const sexLabel = (sex) => ({ '0': '男', '1': '女', '2': '未知' }[sex] || '未知')

const getList = () => {
  loading.value = true
  listContentUser(queryParams.value).then(res => {
    userList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.value = { pageNum: 1, pageSize: 10, userName: undefined, phonenumber: undefined, status: undefined }
  getList()
}

const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.userId)
  multiple.value = !selection.length
}

const handleStatusChange = (row) => {
  const text = row.status === '0' ? '启用' : '停用'
  ElMessageBox.confirm(`确认要${text}用户"${row.userName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return updateContentUser({ userId: row.userId, status: row.status })
  }).then(() => {
    ElMessage.success(text + '成功')
  }).catch(() => {
    row.status = row.status === '0' ? '1' : '0'
  })
}

const handleUpdate = (row) => {
  getContentUser(row.userId).then(res => {
    form.value = res.data
    dialogTitle.value = '修改用户'
    dialogOpen.value = true
  })
}

const submitForm = () => {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      updateContentUser(form.value).then(() => {
        ElMessage.success('修改成功')
        dialogOpen.value = false
        getList()
      })
    }
  })
}

const handleDelete = (row) => {
  const userIds = row.userId || ids.value
  ElMessageBox.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delContentUser(userIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleResetPwd = (row) => {
  proxy.$prompt(`请输入"${row.userName}"的新密码`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: '用户密码长度必须介于 5 和 20 之间'
  }).then(({ value }) => {
    resetContentUserPwd(row.userId, value).then(() => {
      ElMessage.success('修改成功，新密码是：' + value)
    })
  }).catch(() => {})
}

const handleExport = () => {
  proxy.download('content/user/export', { ...queryParams.value }, `content_user_${new Date().getTime()}.xlsx`)
}

onMounted(() => { getList() })
</script>
