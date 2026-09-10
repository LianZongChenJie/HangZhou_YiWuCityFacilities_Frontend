<template>
  <div class="app-container" v-loading="loading">
    <div class="search-card">
      <el-form :model="q" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="项目名称">
              <el-input v-model="q.projectName" placeholder="模糊" clearable style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="建设单位">
              <el-input v-model="q.builderName" placeholder="模糊" clearable style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="工规证号">
              <el-input
                v-model="q.permitNo"
                placeholder="精确唯一查询"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="受理日期">
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
          <el-col :span="8">
            <el-form-item label="业务类型">
              <el-select v-model="q.bizType" clearable style="width: 100%">
                <el-option v-for="i in BIZ_TYPES" :key="i" :label="i" :value="i" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="办件状态">
              <el-select v-model="q.status" clearable style="width: 100%">
                <el-option v-for="(lab, k) in CASE_STATUS_LABEL" :key="k" :label="lab" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="金额区间">
              <div style="display: flex; align-items: center">
                <el-input v-model="q.minAmt" placeholder="最小" style="width: 100px" />
                <span style="margin: 0 6px">-</span>
                <el-input v-model="q.maxAmt" placeholder="最大" style="width: 100px" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="办结/开票/到账" label-width="150px">
              <div style="display: flex; align-items: center; width: 100%">
                <el-select
                  v-model="q.timeKind"
                  clearable
                  placeholder="时间类型"
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
          <el-col :span="8">
            <el-form-item label="免征">
              <el-select v-model="q.reduction" clearable style="width: 100%">
                <el-option label="有免征" :value="1" />
                <el-option label="无免征" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="16" />
          <el-col :span="8" style="text-align: right">
            <el-button
              v-if="user.role === 'accept'"
              type="success"
              @click="$router.push('/project-application-create')"
            >
              新增
            </el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" @click="onSearch">查询</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="rows" border stripe @row-dblclick="(r) => open(r)">
        <el-table-column
          prop="projectName"
          label="项目名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="builderName"
          label="建设单位"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="permitNo" label="工规证号" min-width="160">
          <template #default="{ row }">{{ row.permitNo || '—' }}</template>
        </el-table-column>
        <el-table-column prop="bizType" label="业务类型" width="100" />
        <el-table-column label="免征" width="90">
          <template #default="{ row }">{{ row.hasReduction ? '有免征' : '无免征' }}</template>
        </el-table-column>
        <el-table-column label="应缴金额" width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.receivable) }}</template>
        </el-table-column>
        <el-table-column prop="fundSource" label="企业性质" width="90" />
        <el-table-column label="土地用途" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.landUses || '—' }}</template>
        </el-table-column>
        <el-table-column label="办件状态" width="110">
          <template #default="{ row }">
            <el-tag :type="STATUS_TAG[row.status] || 'info'" size="small">{{
              CASE_STATUS_LABEL[row.status] || row.status || '—'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开票时间" width="110">
          <template #default="{ row }">{{ formatDate(row.paymentNoticeIssuedAt) }}</template>
        </el-table-column>
        <el-table-column label="到账时间" width="110">
          <template #default="{ row }">{{ formatDate(row.paymentReceivedDate) }}</template>
        </el-table-column>
        <el-table-column label="办结时间" width="110">
          <template #default="{ row }">{{ formatDate(row.closedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="open(row)">详情</el-button>
            <el-button v-if="canHandle(row)" link type="success" @click="open(row, 'handle')"
              >办理</el-button
            >
            <el-button v-if="row.status === 'archived'" link @click="print(row)">打印</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="q.pageNo"
          v-model:page-size="q.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { BIZ_TYPES, CASE_STATUS_LABEL, STATUS_TAG } from '@/utils/constants'
import { formatMoney } from '@/utils/calc'
import { getPageList } from './api'
import dayjs from 'dayjs'

/** 日期格式化：YYYY-MM-DD */
function formatDate(v) {
  if (!v) return '—'
  const d = dayjs(v)
  return d.isValid() ? d.format('YYYY-MM-DD') : '—'
}

const router = useRouter()
const user = useUserStore()

const loading = ref(false)
const rows = ref([])
const total = ref(0)

const q = ref({
  permitNo: '',
  builderName: '',
  projectName: '',
  acceptDates: [],
  bizType: '',
  status: '',
  minAmt: '',
  maxAmt: '',
  timeKind: '',
  otherDates: [],
  reduction: undefined,
  pageNo: 1,
  pageSize: 10
})

/** 构建请求参数，适配待处理列表接口 */
function buildParams() {
  const params = {
    pageNo: q.value.pageNo,
    pageSize: q.value.pageSize,
    permitNo: q.value.permitNo || undefined,
    builderName: q.value.builderName || undefined,
    projectName: q.value.projectName || undefined,
    bizType: q.value.bizType || undefined,
    status: q.value.status || undefined,
    acceptDates:
      q.value.acceptDates && q.value.acceptDates.length === 2 ? q.value.acceptDates : undefined,
    timeKind: q.value.timeKind || undefined,
    otherDates:
      q.value.otherDates && q.value.otherDates.length === 2 ? q.value.otherDates : undefined,
    reduction: q.value.reduction,
    amount:
      q.value.minAmt !== '' || q.value.maxAmt !== ''
        ? [
            q.value.minAmt !== '' ? Number(q.value.minAmt) : undefined,
            q.value.maxAmt !== '' ? Number(q.value.maxAmt) : undefined
          ]
        : undefined
  }
  // 删除 undefined 和 null 字段
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null) {
      delete params[key]
    }
  })
  return params
}

/** 查询 */
async function onSearch() {
  loading.value = true
  try {
    const res = await getPageList(buildParams())
    rows.value = (res && res.list) || []
    total.value = (res && res.total) || 0
  } catch (e) {
    ElMessage.error((e && e.message) || '查询失败')
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function reset() {
  q.value = {
    permitNo: '',
    builderName: '',
    projectName: '',
    acceptDates: [],
    bizType: '',
    status: '',
    minAmt: '',
    maxAmt: '',
    timeKind: '',
    otherDates: [],
    reduction: undefined,
    pageNo: 1,
    pageSize: 10
  }
  onSearch()
}

function open(row, mode) {
  router.push({ path: '/detail', query: { id: row.id, mode: mode || 'view' } })
}
function print(row) {
  window.open(`/print?id=${row.id}`, '_blank')
}
function canHandle(row) {
  const role = user.role
  if (role === 'accept') {
    return (
      (row.status === 'draft' && row.createdBy === user.username) ||
      (row.isFourCerts && !row.permitNo)
    )
  }
  if (role === 'review') return row.status === 'review'
  if (role === 'issue') return row.status === 'issue' || row.status === 'pay'
  if (role === 'close') return row.status === 'close'
  return false
}

onMounted(() => {
  onSearch()
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
  padding: 20px;
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

.table-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
