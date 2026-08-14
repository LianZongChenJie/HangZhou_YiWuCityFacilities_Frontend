<template>
  <div class="app-container">
    <h3 class="page-title">角色管理</h3>
    <el-table :data="mockRoles" border>
      <el-table-column prop="name" label="角色" width="140" />
      <el-table-column label="菜单权限">
        <template #default="{ row }">
          <el-tag v-for="m in row.menus" :key="m" size="small" style="margin:2px;">{{ m }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <p style="color:#909399;font-size:12px;margin-top:12px;">原型只展示权限勾选结果，不做菜单配置引擎。</p>
  </div>
</template>

<script setup>
import { mockRoles } from '@/mock/users'
</script>
