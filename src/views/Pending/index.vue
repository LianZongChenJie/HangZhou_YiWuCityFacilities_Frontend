<template>
  <div class="app-container">

    <div class="tabs-card">
      <el-tabs v-model="tab" @tab-change="onTab">
        <el-tab-pane
          v-for="t in visibleTabs"
          :key="t.statusCode"
          :label="t.statusName"
          :name="t.statusCode"
        />
      </el-tabs>

      <!-- 所有 tab 共用的筛选条件 -->
      <div class="search-bar">
        <el-form :inline="true" :model="query">
          <el-form-item label="工规证号">
            <el-input v-model="query.permitNo" placeholder="精准查询" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="建设单位名称">
            <el-input v-model="query.builderName" placeholder="请输入" clearable style="width: 180px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input v-model="query.projectName" placeholder="请输入" clearable style="width: 180px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="办件日期">
            <el-date-picker
              v-model="query.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="起"
              end-placeholder="止"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="业务类型">
            <el-select v-model="query.bizType" clearable placeholder="全部" style="width: 130px">
              <el-option v-for="i in BIZ_TYPES" :key="i" :label="i" :value="i" />
            </el-select>
          </el-form-item>
          <el-form-item label="办件状态">
            <el-select v-model="query.status" clearable placeholder="全部" style="width: 130px">
              <el-option v-for="(lab, k) in STATUS_LABEL" :key="k" :label="lab" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item label="金额区间">
            <el-input v-model="query.minAmt" style="width: 90px" placeholder="最小" />
            <span style="margin: 0 6px">-</span>
            <el-input v-model="query.maxAmt" style="width: 90px" placeholder="最大" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">筛选</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="filtered" border stripe v-loading="loading">
        <el-table-column prop="permitNo" label="工规证号" min-width="170">
          <template #default="{ row }">{{ row.permitNo || '（待补录）' }}</template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="builderName" label="建设单位" min-width="160" show-overflow-tooltip />
        <el-table-column prop="bizType" label="业务类型" width="100" />
        <el-table-column label="应缴金额" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.receivable) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="STATUS_TAG[row.status] || 'info'" size="small">{{ statusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatCreateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <!-- 详情按钮：跳转详情页 -->
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <!-- 根据 data 中 actions 配置动态渲染操作按钮（基于 business 权限过滤） -->
            <el-button
              v-for="action in visibleActions"
              :key="action.key"
              link
              :type="actionType(action.key)"
              :loading="actionLoading(row.id, action.key)"
              @click="handleAction(action.key, row)"
            >
              {{ action.actionName }}
            </el-button>

            <!-- 草稿待提交 / 退回待修改 下显示删除按钮 -->
            <el-button
              v-if="checkPermi(['business:project-application:delete']) && (tab === 'DRAFT' || tab === 'returned')"
              link
              type="danger"
              :loading="actionLoading(row.id, 'delete')"
              @click="deleteRow(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="query.pageNo"
          :page-size="query.pageSize"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </div>

    <!-- 通用审批弹窗：审核通过 / 退回 / 签发 / 办结 / 补录 / 确认到账 -->
    <el-dialog v-model="actionDialog.visible" :title="actionDialog.title" width="480px">
      <el-form ref="actionFormRef" :model="actionForm" :rules="actionRules" label-width="100px">
        <template v-if="actionDialog.type === 'confirmPaid'">
          <el-form-item label="到账日期" prop="payDate">
            <el-date-picker
              v-model="actionForm.payDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择到账日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="实际到账金额" prop="paidAmount">
            <el-input-number v-model="actionForm.paidAmount" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </template>

        <template v-if="actionDialog.type === 'close'">
          <el-form-item label="领取人签字" prop="receiptSigner">
            <el-input v-model="actionForm.receiptSigner" placeholder="请输入领取人姓名" />
          </el-form-item>
        </template>

        <template v-if="actionDialog.type === 'supplement'">
          <el-form-item label="工规证号" prop="permitNo">
            <el-input v-model="actionForm.permitNo" placeholder="请输入工程规划许可证号" />
          </el-form-item>
        </template>

        <!-- 审核意见 / 退回意见：approve 非必填，return 必填 -->
        <template v-if="['approve', 'return', 'issue', 'confirmPaid', 'close'].includes(actionDialog.type)">
          <el-form-item label="审批意见" :prop="actionDialog.type === 'return' ? 'opinion' : ''">
            <el-input
              v-model="actionForm.opinion"
              type="textarea"
              :rows="3"
              :placeholder="actionDialog.type === 'return' ? '请输入退回意见（必填）' : '请输入审批意见（非必填）'"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="actionDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="actionDialog.loading" @click="confirmAction">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STATUS_TAG, STATUS_LABEL, BIZ_TYPES } from '@/utils/constants'
import { formatMoney, todayText } from '@/utils/calc'
import { checkPermi } from '@/utils/permission'
import {
  getPendingList,
  deleteItem,
  updateItem,
  approve,
  returnModify,
  issue as issueApi,
  confirmPaid as confirmPaidApi,
  closeCase as closeApi,
  supplementPermit
} from './api'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const total = ref(0)
const rows = ref([])

/** 按钮级别的 loading 状态：key = `${rowId}-${actionKey}` */
const loadingMap = ref({})

function setActionLoading(rowId, key, val) {
  loadingMap.value[`${rowId}-${key}`] = val
}
function actionLoading(rowId, key) {
  return !!loadingMap.value[`${rowId}-${key}`]
}

const data = [
  {
    statusName: '草稿待提交',
    statusCode: 'DRAFT',
    business: 'business:pending:draft',
    actions: [
      { key: 'modify', actionName: '修改', business: 'business:project-application:update' },
      { key: 'submit', actionName: '提交审核', business: 'business:approval:submit' }
    ]
  },
  {
    statusName: '退回待修改',
    statusCode: 'returned',
    business: 'business:pending:returned',
    actions: [
      { key: 'modify', actionName: '修改', business: 'business:project-application:update' },
      { key: 'resubmit', actionName: '提交审核', business: 'business:approval:submit' }
    ]
  },
  {
    statusName: '待审核',
    statusCode: 'review',
    business: 'business:pending:review',
    actions: [
      { key: 'approve', actionName: '审核通过', business: 'business:approval:approve' },
      { key: 'return', actionName: '退回', business: 'business:approval:return' }
    ]
  },
  {
    statusName: '待签发',
    statusCode: 'issue',
    business: 'business:pending:issue',
    actions: [
      { key: 'issue', actionName: '确认签发', business: 'business:approval:issue' }
    ]
  },
  {
    statusName: '待签发(建设科复核)',
    statusCode: 'issue1',
    business: 'business:pending:issue1',
    actions: [
      { key: 'issue', actionName: '确认签发', business: 'business:approval:issue' }
    ]
  },
  {
    statusName: '待签发(建设科过会)',
    statusCode: 'issue2',
    business: 'business:pending:issue2',
    actions: [
      { key: 'issue', actionName: '确认签发', business: 'business:approval:issue' }
    ]
  },
  {
    statusName: '待缴款',
    statusCode: 'pay',
    business: 'business:pending:pay',
    actions: [
      { key: 'confirmPaid', actionName: '确认到账', business: 'business:approval:confirm-paid' }
    ]
  },
  {
    statusName: '待办结',
    statusCode: 'close',
    business: 'business:pending:close',
    actions: [
      { key: 'close', actionName: '办结', business: 'business:approval:close' }
    ]
  },
  {
    statusName: '待信息补录',
    statusCode: 'secondReview',
    business: 'business:pending:secondReview',
    actions: [
      { key: 'supplement', actionName: '补录证号', business: 'business:approval:supplement' }
    ]
  }
]

const tabs = data
const tab = ref('')

/** 根据 business 权限过滤后的可见 tab 列表 */
const visibleTabs = computed(() =>
  tabs.filter((t) => checkPermi([t.business]))
)

/** 当前 tab 对应的 actions 配置（基于 business 权限过滤） */
const visibleActions = computed(() => {
  const found = tabs.find((t) => t.statusCode === tab.value)
  return (found?.actions || []).filter((a) => checkPermi([a.business]))
})

/** 筛选条件 */
const query = reactive({
  pageNo: 1,
  pageSize: 10,
  permitNo: '',
  builderName: '',
  projectName: '',
  dateRange: [],
  bizType: '',
  status: '',
  minAmt: '',
  maxAmt: ''
})

/** 构建请求参数 */
function buildParams() {
  const params = {
    status: tab.value,
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    permitNo: query.permitNo || undefined,
    builderName: query.builderName || undefined,
    projectName: query.projectName || undefined,
    bizType: query.bizType || undefined,
    statusFilter: query.status || undefined,
    acceptDates: query.dateRange?.length === 2 ? query.dateRange : undefined
  }
  const amount = []
  if (query.minAmt !== '') amount.push(query.minAmt)
  if (query.maxAmt !== '') amount.push(query.maxAmt)
  if (amount.length) params.amount = amount
  return params
}

const filtered = computed(() => rows.value)

function statusText(row) {
  if (row.rejected && row.status === 'draft') return '退回待修改'
  if (row.isFourCerts && !row.permitNo) return '待证号补录'
  return STATUS_LABEL[row.status] || row.status
}

/** 创建时间格式化为 YYYY-MM-DD HH:mm */
function formatCreateTime(v) {
  if (!v) return '—'
  const d = dayjs(v)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : String(v)
}

/** 查询列表 */
async function fetchData() {
  loading.value = true
  try {
    const res = await getPendingList(buildParams())
    rows.value = res.list || []
    total.value = res.total || 0
  } catch (e) {
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.pageNo = 1
  fetchData()
}

function resetQuery() {
  query.permitNo = ''
  query.builderName = ''
  query.projectName = ''
  query.dateRange = []
  query.bizType = ''
  query.status = ''
  query.minAmt = ''
  query.maxAmt = ''
  query.pageNo = 1
  fetchData()
}

function onTab() {
  query.pageNo = 1
  fetchData()
}

function onPageChange(page) {
  query.pageNo = page
  fetchData()
}

function onSizeChange(size) {
  query.pageSize = size
  query.pageNo = 1
  fetchData()
}

/** 根据 action key 返回按钮类型 */
function actionType(key) {
  if (['approve', 'confirmPaid', 'close', 'supplement'].includes(key)) return 'success'
  if (['return'].includes(key)) return 'danger'
  return 'primary'
}

// ===================== 通用审批弹窗 =====================

const actionDialog = reactive({
  visible: false,
  title: '',
  type: '',
  rowId: null,
  loading: false
})

const actionFormRef = ref()
const actionForm = reactive({
  opinion: '',
  payDate: '',
  paidAmount: null,
  paymentNoticeNo: '',
  receiptSigner: '',
  permitNo: ''
})

/** 动态校验规则：退回时 opinion 必填 */
const actionRules = computed(() => {
  const rules = {}
  if (actionDialog.type === 'return') {
    rules.opinion = [{ required: true, message: '请输入退回意见', trigger: 'blur' }]
  }
  if (actionDialog.type === 'confirmPaid') {
    rules.payDate = [{ required: true, message: '请选择到账日期', trigger: 'change' }]
    rules.paidAmount = [{ required: true, message: '请输入实际到账金额', trigger: 'blur' }]
  }
  if (actionDialog.type === 'close') {
    rules.receiptSigner = [{ required: true, message: '请输入领取人姓名', trigger: 'blur' }]
  }
  if (actionDialog.type === 'supplement') {
    rules.permitNo = [{ required: true, message: '请输入工规证号', trigger: 'blur' }]
  }
  return rules
})

/** 重置弹窗表单 */
function resetActionForm() {
  actionForm.opinion = ''
  actionForm.payDate = todayText()
  actionForm.paidAmount = null
  actionForm.paymentNoticeNo = ''
  actionForm.receiptSigner = ''
  actionForm.permitNo = ''
}

/** 根据 action key 分发操作 */
function handleAction(key, row) {
  // 提交审核 / 退回 / 审核通过 / 签发 / 确认到账 / 办结 / 补录
  // 修改按钮：跳转到修改页面
  if (key === 'modify') {
    // 跳转到修改页面，复用 Create 页面
    router.push({ path: '/project-application-create', query: { id: String(row.id), mode: 'edit' } })
    return
  }

  // 提交审核：二次确认弹窗，确认后直接调用 update 接口
  if (key === 'submit' || key === 'resubmit') {
    submitForReview(row, key)
    return
  }

  // 其他按钮打开通用弹窗
  const titleMap = {
    approve: '审核通过',
    return: '退回修改',
    issue: '确认签发',
    confirmPaid: '确认到账',
    close: '办结归档',
    supplement: '补录工规证号'
  }

  actionDialog.visible = true
  actionDialog.title = titleMap[key] || '操作'
  actionDialog.type = key
  actionDialog.rowId = row.id
  actionDialog.loading = false

  resetActionForm()

  // 预填一些默认值
  if (key === 'close') {
    actionForm.receiptSigner = row.builderName || ''
  }
  if (key === 'supplement') {
    actionForm.permitNo = row.permitNo || ''
  }
  if (key === 'confirmPaid') {
    actionForm.paidAmount = row.receivable || null
  }

  // 清除上一次的校验状态
  setTimeout(() => actionFormRef.value?.clearValidate(), 0)
}

/** 提交审核：二次弹窗确认 → 调用 update 接口 */
async function submitForReview(row, key) {
  const actionLabel = key === 'resubmit' ? '重新提交审核' : '提交审核'
  try {
    await ElMessageBox.confirm(`确认${actionLabel}？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  setActionLoading(row.id, key, true)
  try {
    // 从列表行数据构建 update 入参（入参与新建一致，多了 id 字段）
    const payload = buildUpdatePayload(row)
    await updateItem(payload)
    ElMessage.success(`${actionLabel}成功`)
    fetchData()
  } catch (e) {
    ElMessage.error(e?.message || `${actionLabel}失败`)
  } finally {
    setActionLoading(row.id, key, false)
  }
}

/** 从列表行数据构建 update 入参 */
function buildUpdatePayload(row) {
  return {
    id: row.id,
    projectName: row.projectName,
    plotInfo: row.plotInfo,
    fundSource: row.fundSource,
    fundSourceRemark: row.fundSourceRemark,
    landUses: row.landUses,
    landUseRemark: row.landUseRemark,
    builderName: row.builderName,
    contact: row.contact,
    phone: row.phone,
    permitNo: row.permitNo,
    aboveArea: row.aboveArea,
    underArea: row.underArea,
    aboveResidentialArea: row.aboveResidentialArea,
    civilAirArea: row.civilAirArea,
    bizType: row.bizType,
    projectSubtype: row.projectSubtype,
    isFourCerts: row.isFourCerts,
    hasReduction: row.hasReduction,
    reductionAmount: row.reductionAmount,
    reductionBasis: row.reductionBasis,
    amountManual: row.amountManual,
    receivable: row.receivable,
    acceptOpinion: row.acceptOpinion,
    reviewOpinion: row.reviewOpinion,
    issueOpinion: row.issueOpinion,
    materialsFeeForm: row.materialsFeeForm,
    materialsPermitCopy: row.materialsPermitCopy,
    materialsCivilAirForm: row.materialsCivilAirForm,
    relatedPermitNo: row.relatedPermitNo,
    relatedProjectName: row.relatedProjectName,
    archivedResidentialArea: row.archivedResidentialArea,
    archivedReceivable: row.archivedReceivable,
    actualReceivable: row.actualReceivable
  }
}

/** 确认弹窗操作 */
async function confirmAction() {
  // 先做表单校验
  try {
    await actionFormRef.value?.validate()
  } catch {
    return
  }

  // 二次确认
  const confirmMap = {
    approve: '确认审核通过？',
    return: '确认退回该办件？',
    issue: '确认签发并进入待缴款？',
    confirmPaid: '确认到账并进入待办结？',
    close: '确认办结归档？',
    supplement: '确认补录工规证号？'
  }
  try {
    await ElMessageBox.confirm(confirmMap[actionDialog.type] || '确认操作？', '提示', { type: 'warning' })
  } catch {
    return
  }

  actionDialog.loading = true
  try {
    const rowId = actionDialog.rowId
    const type = actionDialog.type

    // 构建审批接口入参
    const payload = { applicationId: rowId }

    if (type === 'approve') {
      payload.opinion = actionForm.opinion || undefined
      await approve(payload)
    } else if (type === 'return') {
      payload.opinion = actionForm.opinion
      await returnModify(payload)
    } else if (type === 'issue') {
      payload.paymentNoticeNo = actionForm.paymentNoticeNo || undefined
      payload.opinion = actionForm.opinion || undefined
      await issueApi(payload)
    } else if (type === 'confirmPaid') {
      payload.paidAmount = actionForm.paidAmount
      payload.opinion = actionForm.opinion || undefined
      await confirmPaidApi(payload)
    } else if (type === 'close') {
      payload.receiptSigner = actionForm.receiptSigner
      payload.opinion = actionForm.opinion || undefined
      await closeApi(payload)
    } else if (type === 'supplement') {
      payload.permitNo = actionForm.permitNo
      await supplementPermit(payload)
    }

    const successMap = {
      approve: '已审核通过',
      return: '已退回',
      issue: '已签发',
      confirmPaid: '已确认到账',
      close: '已办结归档',
      supplement: '已补录证号'
    }
    ElMessage.success(successMap[type] || '操作成功')
    actionDialog.visible = false
    fetchData()
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    actionDialog.loading = false
  }
}

/** 详情跳转 */
function openDetail(row) {
  router.push({ path: '/detail', query: { id: String(row.id) } })
}

/** 删除 */
async function deleteRow(row) {
  try {
    await ElMessageBox.confirm('确认删除该办件？删除后不可恢复。', '删除确认', { type: 'warning' })
  } catch {
    return
  }
  setActionLoading(row.id, 'delete', true)
  try {
    await deleteItem(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  } finally {
    setActionLoading(row.id, 'delete', false)
  }
}

onMounted(() => {
  if (visibleTabs.value.length > 0) {
    tab.value = visibleTabs.value[0].statusCode
  }
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

.tabs-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 24px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.search-bar :deep(.el-form--inline .el-form-item) {
  margin-bottom: 12px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
