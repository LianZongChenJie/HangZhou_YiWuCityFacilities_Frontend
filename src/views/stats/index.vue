<template>
  <div class="app-container">
    <h3 class="page-title">统计报表</h3>
    <el-form :inline="true" :model="q">
      <el-form-item label="受理时间">
        <el-date-picker v-model="q.acceptDates" type="daterange" value-format="YYYY-MM-DD" start-placeholder="起" end-placeholder="止" />
      </el-form-item>
      <el-form-item label="办结/开票/到账">
        <el-select v-model="q.timeKind" style="width:110px;margin-right:8px;">
          <el-option label="办结时间" value="closeDate" />
          <el-option label="开票时间" value="issueDate" />
          <el-option label="到账时间" value="payDate" />
        </el-select>
        <el-date-picker v-model="q.otherDates" type="daterange" value-format="YYYY-MM-DD" start-placeholder="起" end-placeholder="止" />
      </el-form-item>
      <el-form-item label="金额区间">
        <el-input v-model="q.minAmt" style="width:100px;" />
        <span style="margin:0 6px;">-</span>
        <el-input v-model="q.maxAmt" style="width:100px;" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="q.status" clearable style="width:120px;">
          <el-option v-for="(lab, k) in STATUS_LABEL" :key="k" :label="lab" :value="k" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否减免">
        <el-select v-model="q.reduction" clearable style="width:100px;">
          <el-option label="有减免" :value="1" />
          <el-option label="无减免" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="noop">筛选</el-button>
        <el-button type="success" @click="exportXls">导出 Excel</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="12" style="margin-bottom:16px;">
      <el-col :span="4" v-for="s in summary" :key="s.label">
        <el-card shadow="never">
          <div style="color:#909399;font-size:12px;">{{ s.label }}</div>
          <div style="font-size:20px;font-weight:700;margin-top:6px;">{{ s.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-table :data="rows" border stripe>
      <el-table-column prop="permitNo" label="工程规划许可证号" min-width="160" />
      <el-table-column prop="builderName" label="建设单位" min-width="150" />
      <el-table-column prop="fundSource" label="资金来源" width="90" />
      <el-table-column prop="projectName" label="建设项目名称" min-width="180" show-overflow-tooltip />
      <el-table-column label="土地用途" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ landUseText(row) }}</template>
      </el-table-column>
      <el-table-column prop="residentialArea" label="住宅面积" width="100" />
      <el-table-column prop="nonResidentialArea" label="非住宅面积" width="110" />
      <el-table-column prop="civilAirArea" label="人防面积" width="90" />
      <el-table-column label="应缴配套费" width="120" align="right">
        <template #default="{ row }">{{ formatMoney(row.receivable) }}</template>
      </el-table-column>
      <el-table-column prop="issueDate" label="签发日期" width="110" />
      <el-table-column prop="payDate" label="缴费到账日期" width="120" />
      <el-table-column prop="contact" label="联系人" width="90" />
      <el-table-column prop="phone" label="联系电话" width="120" />
    </el-table>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCaseStore } from '@/stores/cases'
import { STATUS_LABEL } from '@/utils/constants'
import { exportCsv, formatMoney, landUseText } from '@/utils/calc'

const user = useUserStore()
const cases = useCaseStore()
const q = reactive({
  acceptDates: [],
  timeKind: 'closeDate',
  otherDates: [],
  minAmt: '',
  maxAmt: '',
  status: '',
  reduction: ''
})

const rows = computed(() => {
  return cases.visibleList(user.user).filter((r) => {
    if (q.status && r.status !== q.status) return false
    if (q.reduction === 1 && !r.hasReduction) return false
    if (q.reduction === 0 && r.hasReduction) return false
    if (q.minAmt !== '' && Number(r.receivable) < Number(q.minAmt)) return false
    if (q.maxAmt !== '' && Number(r.receivable) > Number(q.maxAmt)) return false
    if (q.acceptDates?.length === 2) {
      const d = (r.createdAt || '').slice(0, 10)
      if (d < q.acceptDates[0] || d > q.acceptDates[1]) return false
    }
    if (q.otherDates?.length === 2) {
      const d = (r[q.timeKind] || '').slice(0, 10)
      if (!d || d < q.otherDates[0] || d > q.otherDates[1]) return false
    }
    return true
  })
})

const summary = computed(() => {
  const list = rows.value
  const recv = list.reduce((s, x) => s + (Number(x.receivable) || 0), 0)
  const paid = list.filter((x) => x.payDate).reduce((s, x) => s + (Number(x.receivable) || 0), 0)
  const red = list.filter((x) => x.hasReduction)
  const redAmt = red.reduce((s, x) => s + (Number(x.reductionAmount) || 0), 0)
  return [
    { label: '办件数量', value: list.length },
    { label: '应收合计（元）', value: formatMoney(recv) },
    { label: '已到账合计（元）', value: formatMoney(paid) },
    { label: '待缴款数量', value: list.filter((x) => x.status === 'pay').length },
    { label: '减免办件数量', value: red.length },
    { label: '减免金额合计（元）', value: formatMoney(redAmt) }
  ]
})

function noop() {}
function exportXls() {
  exportCsv('配套费办件清单.csv', [
    { label: '工程规划许可证号', key: 'permitNo' },
    { label: '建设单位', key: 'builderName' },
    { label: '资金来源', key: 'fundSource' },
    { label: '建设项目名称', key: 'projectName' },
    { label: '土地用途', value: (r) => landUseText(r) },
    { label: '住宅面积', key: 'residentialArea' },
    { label: '非住宅面积', key: 'nonResidentialArea' },
    { label: '人防面积', key: 'civilAirArea' },
    { label: '应缴城市基础设施配套费', key: 'receivable' },
    { label: '签发日期', key: 'issueDate' },
    { label: '缴费到账日期', key: 'payDate' },
    { label: '建设单位联系人', key: 'contact' },
    { label: '联系电话', key: 'phone' }
  ], rows.value)
}
</script>
