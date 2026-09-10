<template>
  <div class="app-container">
    <h3 class="page-title">工作台 / 我的待办</h3>
    <el-row :gutter="16">
      <el-col v-if="role === 'accept'" :span="8">
        <el-card
          class="todo-card wb-create"
          shadow="hover"
          @click="$router.push('/project-application-create')"
        >
          <el-icon :size="28" color="#409EFF"><Plus /></el-icon>
          <span style="margin-left: 10px">新建办件</span>
        </el-card>
      </el-col>
      <el-col v-for="c in cards" :key="c.tab" :span="8">
        <el-card class="todo-card" shadow="hover" @click="go(c.tab)">
          <div style="color: #909399; font-size: 13px">{{ c.label }}</div>
          <div class="count" :style="{ color: c.color }">{{ c.count }}</div>
          <div style="color: #c0c4cc; font-size: 12px; margin-top: 6px">点击进入待处理</div>
        </el-card>
      </el-col>
      <el-col v-if="role === 'admin'" :span="8">
        <el-card class="todo-card" shadow="hover" @click="$router.push('/case/query')">
          <div style="color: #909399; font-size: 13px">办件查询</div>
          <div class="count">{{ total }}</div>
          <div style="color: #c0c4cc; font-size: 12px; margin-top: 6px">全部办件</div>
        </el-card>
      </el-col>
      <el-col v-if="role === 'admin'" :span="8">
        <el-card class="todo-card" shadow="hover" @click="$router.push('/stats')">
          <div style="color: #909399; font-size: 13px">统计报表</div>
          <div class="count" style="font-size: 20px; padding-top: 8px">导出 / 汇总</div>
        </el-card>
      </el-col>
    </el-row>
    <el-alert
      style="margin-top: 20px"
      type="info"
      :closable="false"
      title="本页只显示当前岗位当天要做的事。右上角可切换岗位体验完整流程。"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCaseStore } from '@/stores/cases'

const router = useRouter()
const user = useUserStore()
const cases = useCaseStore()
const role = computed(() => user.role)
const todo = computed(() => cases.todoCount(user.user))
const total = computed(() => cases.visibleList(user.user).length)

const cards = computed(() => {
  const t = todo.value
  if (role.value === 'accept') {
    return [
      { tab: 'returned', label: '退回待修改', count: t.returned || 0, color: '#e6a23c' },
      { tab: 'fillPermit', label: '待证号补录', count: t.fillPermit || 0, color: '#f56c6c' }
    ]
  }
  if (role.value === 'review') {
    return [{ tab: 'review', label: '待审核', count: t.review || 0, color: '#e6a23c' }]
  }
  if (role.value === 'issue') {
    return [
      { tab: 'pay', label: '待缴款（核对到账）', count: t.pay || 0, color: '#f56c6c' },
      { tab: 'issue', label: '待签发（开票）', count: t.issue || 0, color: '#409eff' }
    ]
  }
  if (role.value === 'close') {
    return [{ tab: 'close', label: '待办结', count: t.close || 0, color: '#67c23a' }]
  }
  return []
})

function go(tab) {
  router.push({ path: '/case/pending', query: { tab } })
}
</script>
