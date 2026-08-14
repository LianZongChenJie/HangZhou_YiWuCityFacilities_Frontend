<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <div class="logo">
        <el-icon :size="20"><OfficeBuilding /></el-icon>
        <span>配套费征收审批</span>
      </div>
      <el-menu
        :default-active="active"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
        unique-opened
      >
        <el-menu-item v-if="show('workbench')" index="/workbench">
          <el-icon><HomeFilled /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-sub-menu v-if="showCaseMenu" index="case">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>办件管理</span>
          </template>
          <el-menu-item v-if="role === 'accept'" index="/case/create">新建办件</el-menu-item>
          <el-menu-item v-if="role !== 'admin'" index="/case/pending">待处理</el-menu-item>
          <el-menu-item index="/case/query">办件查询</el-menu-item>
        </el-sub-menu>
        <el-menu-item v-if="show('stats')" index="/stats">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计报表</span>
        </el-menu-item>
        <el-sub-menu v-if="role === 'admin'" index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>权限管理</span>
          </template>
          <el-menu-item index="/system/user">用户管理</el-menu-item>
          <el-menu-item index="/system/role">角色管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>
    <div class="main-wrap">
      <header class="navbar">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:14px;color:#606266;">义乌市建设局 · 城市基础设施配套费征收审批系统（原型）</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <el-badge :value="todo.total || undefined" :hidden="!todo.total" type="danger">
            <el-button text @click="$router.push('/workbench')">
              <el-icon><Bell /></el-icon>
              待办
            </el-button>
          </el-badge>
          <el-dropdown @command="onRole">
            <span style="cursor:pointer;font-size:13px;">
              {{ user.displayName }}（{{ roleLabel }}）
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="accept">切换：受理岗</el-dropdown-item>
                <el-dropdown-item command="review">切换：审核岗</el-dropdown-item>
                <el-dropdown-item command="issue">切换：签发岗</el-dropdown-item>
                <el-dropdown-item command="close">切换：办结岗</el-dropdown-item>
                <el-dropdown-item command="admin">切换：管理岗</el-dropdown-item>
                <el-dropdown-item divided command="reset">恢复演示数据</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <div class="tags-view">
        <span
          v-for="t in tags"
          :key="t.path"
          class="tag-item"
          :class="{ active: t.path === $route.path }"
          @click="$router.push(t.path)"
        >{{ t.title }}</span>
      </div>
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCaseStore } from '@/stores/cases'
import { HOME_PATH, ROLE_LABEL } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const cases = useCaseStore()

const role = computed(() => user.role)
const roleLabel = computed(() => ROLE_LABEL[role.value] || '')
const todo = computed(() => cases.todoCount(user.user))
const active = computed(() => route.path)

function show(key) {
  if (key === 'workbench') return true
  if (key === 'stats') return ['admin', 'review', 'issue'].includes(role.value)
  return true
}
const showCaseMenu = computed(() => true)

const tags = computed(() => {
  const list = [{ path: '/workbench', title: '工作台' }]
  if (role.value === 'accept') list.push({ path: '/case/create', title: '新建办件' })
  if (role.value !== 'admin') list.push({ path: '/case/pending', title: '待处理' })
  list.push({ path: '/case/query', title: '办件查询' })
  if (['admin', 'review', 'issue'].includes(role.value)) list.push({ path: '/stats', title: '统计报表' })
  if (route.name === 'CaseDetail') list.push({ path: route.fullPath, title: '办件详情' })
  return list
})

function onRole(cmd) {
  if (cmd === 'logout') {
    user.logout()
    router.push('/login')
    return
  }
  if (cmd === 'reset') {
    cases.resetDemo()
    ElMessage.success('已恢复演示数据')
    return
  }
  const res = user.switchRole(cmd)
  if (res.ok) {
    ElMessage.success(`已切换为${ROLE_LABEL[cmd]}`)
    router.push(HOME_PATH[cmd])
  }
}
</script>
