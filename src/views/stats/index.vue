<template>
  <div class="app-container">
    <div class="search-card">
      <el-form :model="q" label-width="100px">
        <el-row>
          <el-col :span="7">
            <el-form-item label="受理时间">
              <el-date-picker
                v-model="q.acceptDates"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="起"
                end-placeholder="止"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="办结/开票/到账" label-width="150px">
              <div style="display: flex; align-items: center; width: 100%">
                <el-select
                  v-model="q.timeKind"
                  clearable
                  placeholder="请选择"
                  style="width: 110px; margin-right: 8px"
                >
                  <el-option label="办结时间" value="closeDate" />
                  <el-option label="开票时间" value="issueDate" />
                  <el-option label="到账时间" value="payDate" />
                </el-select>
                <el-date-picker
                  v-model="q.otherDates"
                  type="daterange"
                  value-format="YYYY-MM-DD"
                  start-placeholder="起"
                  end-placeholder="止"
                  style="flex: 1"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="金额区间">
              <div style="display: flex; align-items: center; width: 100%">
                <el-input v-model="q.minAmt" placeholder="最小" style="flex: 1" />
                <span style="margin: 0 6px; flex-shrink: 0">-</span>
                <el-input v-model="q.maxAmt" placeholder="最大" style="flex: 1" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <el-form-item label="状态">
              <el-select v-model="q.status" clearable style="width: 100%">
                <el-option v-for="(lab, k) in CASE_STATUS_LABEL" :key="k" :label="lab" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="9" style="text-align: right">
            <el-button :loading="exportLoading" @click="exportXls">导出 Excel</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" :loading="loading" @click="handleQuery">筛选</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <el-row :gutter="12" class="summary-row" v-loading="loading">
      <el-col :span="4" v-for="s in summary" :key="s.label">
        <div class="summary-card">
          <div class="summary-label">{{ s.label }}</div>
          <div class="summary-value">{{ s.value }}</div>
        </div>
      </el-col>
    </el-row>

    <div class="table-card">
      <el-table :data="rows" border stripe v-loading="loading">
        <el-table-column prop="permitNo" label="工程规划许可证号" min-width="160" />
        <el-table-column prop="builderName" label="建设单位" min-width="150" />
        <el-table-column prop="fundSource" label="资金来源" width="90" />
        <el-table-column
          prop="projectName"
          label="建设项目名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="landUses" label="土地用途" min-width="120" show-overflow-tooltip />
        <el-table-column prop="residentialArea" label="住宅面积" width="100" />
        <el-table-column prop="nonResidentialArea" label="非住宅面积" width="110" />
        <el-table-column prop="civilAirArea" label="人防面积" width="90" />
        <el-table-column
          prop="receivable"
          label="应缴配套费"
          width="120"
          align="right"
          :formatter="(_, __, val) => formatMoney(val)"
        />
        <el-table-column prop="acceptTime" label="受理时间" width="110" />
        <el-table-column prop="closeDate" label="办结时间" width="110" />
        <el-table-column prop="issueDate" label="开票时间" width="110" />
        <el-table-column prop="payDate" label="到账时间" width="120" />
        <el-table-column label="办件状态" width="110">
          <template #default="{ row }">
            <el-tag :type="STATUS_TAG[row.status] || 'info'" size="small">{{
              CASE_STATUS_LABEL[row.status] || row.status || '—'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" width="90" />
        <el-table-column prop="phone" label="联系电话" width="120" />
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="q.pageNo"
          :page-size="q.pageSize"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CASE_STATUS_LABEL, STATUS_TAG } from '@/utils/constants'
import { formatMoney } from '@/utils/calc'
import download from '@/utils/download'
import { getList, getSummary, exportList } from './api'
import type { Request, ReportApplicationVO } from './type'

/** 获取当月1号 ~ 当月最后一天 */
function defaultMonthRange(): string[] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const p = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(y, m + 1, 0).getDate()
  return [`${y}-${p(m + 1)}-01`, `${y}-${p(m + 1)}-${p(lastDay)}`]
}

const loading = ref(false)
const exportLoading = ref(false)
const rows = ref<ReportApplicationVO[]>([])
const total = ref(0)
const summary = ref<{ label: string; value: string | number }[]>([])

const q = reactive({
  pageNo: 1,
  pageSize: 10,
  acceptDates: defaultMonthRange() as string[],
  timeKind: '',
  otherDates: [] as string[],
  minAmt: '',
  maxAmt: '',
  status: ''
})

/** 构建请求参数 */
function buildParams(): Request {
  const params: Request = {
    pageNo: q.pageNo,
    pageSize: q.pageSize,
    timeKind: q.timeKind || undefined,
    otherDates: q.otherDates?.length === 2 ? q.otherDates : undefined,
    status: q.status || undefined
  }
  // 受理日期
  if (q.acceptDates?.length === 2) {
    params.acceptDates = q.acceptDates
  }
  // 金额区间
  const amount: number[] = []
  if (q.minAmt !== '') amount.push(Number(q.minAmt))
  if (q.maxAmt !== '') amount.push(Number(q.maxAmt))
  if (amount.length) params.amount = amount
  return params
}

/** 查询列表 + 汇总 */
async function fetchData() {
  loading.value = true
  try {
    const params = buildParams()
    const [pageRes, summaryRes] = await Promise.all([getList(params), getSummary(params)])
    rows.value = pageRes?.list || []
    total.value = pageRes?.total || 0

    console.log('pageRes', pageRes)
    // 映射汇总数据
    const s = summaryRes || {}
    summary.value = [
      { label: '办件数量', value: s.totalCount ?? 0 },
      { label: '应收合计（元）', value: formatMoney(s.totalReceivable ?? 0) },
      { label: '已到账合计（元）', value: formatMoney(s.totalReceived ?? 0) },
      { label: '待缴款数量', value: s.pendingPayCount ?? 0 },
      { label: '免征办件数量', value: s.reductionCount ?? 0 },
      { label: '免征金额合计（元）', value: formatMoney(s.totalReductionAmount ?? 0) }
    ]
  } catch (e: any) {
    ElMessage.error(e?.message || '查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  q.pageNo = 1
  fetchData()
}

function reset() {
  q.pageNo = 1
  q.pageSize = 10
  q.acceptDates = defaultMonthRange()
  q.timeKind = ''
  q.otherDates = []
  q.minAmt = ''
  q.maxAmt = ''
  q.status = ''
  fetchData()
}

function onPageChange(page: number) {
  q.pageNo = page
  fetchData()
}

function onSizeChange(size: number) {
  q.pageSize = size
  q.pageNo = 1
  fetchData()
}

async function exportXls() {
  exportLoading.value = true
  try {
    const data = (await exportList(buildParams())) as unknown as Blob
    download.excel(data, '配套费办件清单.xlsx')
  } catch (e: any) {
    ElMessage.error(e?.message || '导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.title-icon {
  font-size: 22px;
}

.page-subtitle {
  font-size: 13px;
  color: #86909c;
  margin: 6px 0 0;
}

.search-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.search-card :deep(.el-form--inline .el-form-item) {
  margin-bottom: 16px;
}

.search-actions {
  margin-left: auto !important;
}

.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  background: #fff;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  text-align: center;
}

.summary-label {
  color: #86909c;
  font-size: 12px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
  margin-top: 8px;
}

.table-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
