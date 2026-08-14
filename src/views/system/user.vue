<template>
  <div class="app-container">
    <h3 class="page-title">用户管理</h3>
    <el-table :data="users" border>
      <el-table-column prop="username" label="账号" width="140" />
      <el-table-column prop="name" label="姓名" width="140">
        <template #default="{ row }">
          <el-input v-if="row._edit" v-model="row.name" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="岗位" width="120">
        <template #default="{ row }">{{ ROLE_LABEL[row.role] }}</template>
      </el-table-column>
      <el-table-column label="启用" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" />
        </template>
      </el-table-column>
      <el-table-column label="初始密码" width="120">123456</el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button v-if="!row._edit" link type="primary" @click="row._edit = true">改姓名</el-button>
          <el-button v-else link type="success" @click="row._edit = false">保存</el-button>
        </template>
      </el-table-column>
    </el-table>
    <p style="color:#909399;font-size:12px;margin-top:12px;">原型仅做展示：启用/停用、改姓名即时生效，刷新后恢复预置账号。</p>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { mockUsers } from '@/mock/users'
import { ROLE_LABEL } from '@/utils/constants'

const users = reactive(mockUsers.map((u) => ({ ...u, _edit: false })))
</script>
