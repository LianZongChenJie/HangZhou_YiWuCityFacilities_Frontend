<template>
  <div class="app-container">
    <h3 class="page-title">办件查询</h3>
    <el-form :inline="true" :model="q" class="query-form">
      <el-form-item label="工规证号">
        <el-input v-model="q.permitNo" placeholder="精确唯一查询" clearable style="width:200px;" />
      </el-form-item>
      <el-form-item label="建设单位">
        <el-input v-model="q.builderName" placeholder="模糊" clearable style="width:160px;" />
      </el-form-item>
      <el-form-item label="项目名称">
        <el-input v-model="q.projectName" placeholder="模糊" clearable style="width:160px;" />
      </el-form-item>
      <el-form-item label="办件日期">
        <el-date-picker v-model="q.dates" type="daterange" value-format="YYYY-MM-DD" start-placeholder="起" end-placeholder="止" />
      </el-form-item>
      <el-form-item label="业务类型">
        <el-select v-model="q.bizType" clearable style="width:120px;">
          <el-option v-for="i in BIZ_TYPES" :key="i" :label="i" :value="i" />
        </el-select>
      </el-form-item>
      <el-form-item label="办件状态">
        <el-select v-model="q.status" clearable style="width:120px;">
          <el-option v-for="(lab, k) in STATUS_LABEL" :key="k" :label="lab" :value="k" />
        </el-select>
      </el-form-item>
      <el-form-item label="金额区间">
        <el-input v-model="q.minAmt" placeholder="最小" style="width:100px;" />
        <span style="margin:0 6px;">-</span>
        <el-input v-model="q.maxAmt" placeholder="最大" style="width:100px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="noop">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button v-if="user.role === 'accept'" type="success" @click="$router.push('/case/create')">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="rows" border stripe @row-dblclick="(r) => open(r)">
      <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="builderName" label="建设单位" min-width="150" show-overflow-tooltip />
      <el-table-column prop="permitNo" label="工规证号" min-width="160">
        <template #default="{ row }">{{ row.permitNo || '—' }}</template>
      </el-table-column>
      <el-table-column label="应缴金额" width="120" align="right">
        <template #default="{ row }">{{ formatMoney(row.receivable) }}</template>
      </el-table-column>
      <el-table-column prop="fundSource" label="企业性质" width="90" />
      <el-table-column label="土地用途" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ landUseText(row) }}</template>
      </el-table-column>
      <el-table-column label="当前状态" width="110">
        <template #default="{ row }">
          <el-tag :type="STATUS_TAG[row.status]" size="small">{{ STATUS_LABEL[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开票时间" width="110">
        <template #default="{ row }">{{ formatDate(row.issueDate) }}</template>
      </el-table-column>
      <el-table-column label="到账时间" width="110">
        <template #default="{ row }">{{ formatDate(row.payDate) }}</template>
      </el-table-column>
      <el-table-column label="办结时间" width="110">
        <template #default="{ row }">{{ formatDate(row.closeDate) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)">详情</el-button>
          <el-button v-if="canHandle(row)" link type="success" @click="open(row, 'handle')">办理</el-button>
          <el-button v-if="row.status === 'archived'" link @click="print(row)">打印</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCaseStore } from '@/stores/cases'
import { BIZ_TYPES, STATUS_LABEL, STATUS_TAG } from '@/utils/constants'
import { formatDate, formatMoney, landUseText } from '@/utils/calc'

const router = useRouter()
const user = useUserStore()
const cases = useCaseStore()
const q = reactive({
  permitNo: '',
  builderName: '',
  projectName: '',
  dates: [],
  bizType: '',
  status: '',
  minAmt: '',
  maxAmt: ''
})

const rows = computed(() => {
  return cases.visibleList(user.user).filter((r) => {
    if (q.permitNo && r.permitNo !== q.permitNo.trim()) return false
    if (q.builderName && !(r.builderName || '').includes(q.builderName)) return false
    if (q.projectName && !(r.projectName || '').includes(q.projectName)) return false
    if (q.bizType && r.bizType !== q.bizType) return false
    if (q.status && r.status !== q.status) return false
    if (q.dates?.length === 2) {
      const d = (r.createdAt || '').slice(0, 10)
      if (d < q.dates[0] || d > q.dates[1]) return false
    }
    if (q.minAmt !== '' && Number(r.receivable) < Number(q.minAmt)) return false
    if (q.maxAmt !== '' && Number(r.receivable) > Number(q.maxAmt)) return false
    return true
  })
})

function reset() {
  Object.assign(q, {
    permitNo: '',
    builderName: '',
    projectName: '',
    dates: [],
    bizType: '',
    status: '',
    minAmt: '',
    maxAmt: ''
  })
}
function noop() {}
function open(row, mode) {
  router.push({ path: `/case/detail/${row.id}`, query: { mode: mode || 'view' } })
}
function print(row) {
  window.open(`${location.origin}${location.pathname}#/print/${row.id}`, '_blank')
}
function canHandle(row) {
  const role = user.role
  if (role === 'accept') {
    return (row.status === 'draft' && row.createdBy === user.username) || (row.isFourCerts && !row.permitNo)
  }
  if (role === 'review') return row.status === 'review'
  if (role === 'issue') return row.status === 'issue' || row.status === 'pay'
  if (role === 'close') return row.status === 'close'
  return false
}
</script>
