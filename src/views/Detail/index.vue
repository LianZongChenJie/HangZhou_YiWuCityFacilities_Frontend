<template>
  <div class="app-container" v-loading="loading">
    <template v-if="form && form.id">
      <div class="page-header">
        <h5 class="page-title">
          <el-icon class="title-back-icon" @click="handleBack">
            <ArrowLeft />
          </el-icon>
          {{ form.projectName || '办件详情' }}
        </h5>
      </div>

      <div class="steps-card" v-if="processNodes.length">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step
            v-for="(node, i) in processNodes"
            :key="i"
            :title="node"
            :status="stepStatus(i)"
          />
        </el-steps>
      </div>

      <div class="form-card">
        <CaseForm
          ref="cf"
          v-model="form"
          :readonly="true"
          :readonly-style="true"
          :status="form.status || ''"
        >
          <!-- 额外内容：关联单据 + 审批记录，放在意见模块下方、操作按钮上方 -->
          <template #extra>
            <!-- 关联单据（同工规证号）模块：仅拆复建项目展示 -->
            <template v-if="isRebuild && form.relatedPermitNo">
              <el-divider content-position="left">关联单据</el-divider>
              <el-form label-width="180px" disabled>
                <el-form-item label="原项目关联工规证号">
                  <el-input v-model="form.relatedPermitNo" />
                </el-form-item>
              </el-form>
            </template>

            <!-- 审批记录模块：仅进入正常审批流程后可查看 -->
            <template v-if="isInApprovalFlow">
              <el-divider content-position="left">审批记录</el-divider>
              <el-timeline v-if="approvalRecords.length">
                <el-timeline-item
                  v-for="(record, index) in approvalRecords"
                  :key="record.id || index"
                  :timestamp="dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')"
                  placement="top"
                  :type="'success'"
                >
                  <div class="approval-record-item">
                    <div class="record-header">
                      <span class="record-node">{{ FLOW_NODE[record.flowNode] }}</span>
                      <el-tag size="small" type="info" class="record-status">
                        {{ statusLabel(record.actionType) }}
                      </el-tag>
                    </div>
                    <div class="record-body">
                      <div class="record-row">
                        <span class="record-label">操作人：</span>
                        <span class="record-value">{{ record.operatorName || '—' }}</span>
                      </div>
                      <div class="record-row" v-if="record.opinion">
                        <span class="record-label">审批意见：</span>
                        <span class="record-value">{{ record.opinion }}</span>
                      </div>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无审批记录" :image-size="60" />
            </template>
          </template>

          <template #actions>
            <el-button @click="handleBack">返回</el-button>
            <!-- 修改按钮：跳转编辑页 -->
            <el-button
              v-if="checkPermi(['business:project-application:update']) && canModify"
              @click="goEdit"
            >
              修改
            </el-button>
            <!-- 根据审批节点动态渲染操作按钮 -->
            <el-button
              v-for="action in detailActions"
              :key="action.key"
              :type="actionType(action.key)"
              :loading="actionLoading(action.key)"
              @click="handleAction(action.key)"
            >
              {{ action.actionName }}
            </el-button>
          </template>
        </CaseForm>
      </div>
    </template>

    <el-empty v-if="!loading && !form.id" description="办件不存在或已删除" :image-size="80">
      <el-button type="primary" @click="handleBack">返回列表</el-button>
    </el-empty>

    <!-- 通用审批弹窗 -->
    <el-dialog v-model="actionDialog.visible" :title="actionDialog.title" width="480px">
      <el-form ref="actionFormRef" :model="actionForm" :rules="actionRules" label-width="100px">
        <template v-if="actionDialog.type === 'confirmPaid'">
          <el-form-item label="到账日期" prop="payDate" label-width="125px">
            <el-date-picker
              v-model="actionForm.payDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择到账日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="实际到账金额" prop="paidAmount" label-width="125px">
            <el-input-number
              v-model="actionForm.paidAmount"
              :min="0"
              :precision="2"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <template v-if="actionDialog.type === 'close'">
          <el-form-item label="领取人" prop="receiptSigner">
            <el-input v-model="actionForm.receiptSigner" placeholder="请输入领取人姓名" />
          </el-form-item>
        </template>

        <template v-if="actionDialog.type === 'supplement'">
          <el-form-item label="工规证号" prop="permitNo">
            <el-input v-model="actionForm.permitNo" placeholder="请输入工程规划许可证号" />
          </el-form-item>
        </template>

        <!-- 签发日期：签发时显示 -->
        <template v-if="actionDialog.type === 'issue'">
          <el-form-item label="签发日期" prop="issueDate">
            <el-date-picker
              v-model="actionForm.issueDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择签发日期"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 审批意见 / 退回意见 -->
        <template
          v-if="
            [
              'approve',
              'return',
              'issueReturn',
              'issue1Return',
              'issue2Return',
              'issue',
              'issueReview',
              'issueMeeting',
              'confirmPaid',
              'close'
            ].includes(actionDialog.type)
          "
        >
          <el-form-item
            label="审批意见"
            :prop="
              ['return', 'issueReturn', 'issue1Return', 'issue2Return'].includes(actionDialog.type)
                ? 'opinion'
                : ''
            "
            :label-width="actionDialog.type === 'confirmPaid' ? '125px' : '100px'"
          >
            <el-input
              v-model="actionForm.opinion"
              type="textarea"
              :rows="3"
              :placeholder="
                ['return', 'issueReturn', 'issue1Return', 'issue2Return'].includes(
                  actionDialog.type
                )
                  ? '请输入退回意见（必填）'
                  : '请输入审批意见（非必填）'
              "
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="actionDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="actionDialog.loading" @click="confirmAction"
          >确认</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({ name: 'ProjectApplicationDetail' })

import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { CaseForm } from '@/components/CaseForm'
import { STATUS_LABEL, FLOW_NODE } from '@/utils/constants'
import { formatMoney, todayText, applyCalc } from '@/utils/calc'
import { checkPermi } from '@/utils/permission'
import { useEmitt } from '@/hooks/web/useEmitt'
import {
  getDetail,
  getApprovalRecords,
  updateItem,
  approve,
  returnModify,
  issue as issueApi,
  confirmPaid as confirmPaidApi,
  closeCase as closeApi,
  supplementPermit,
  issueReview,
  issueMeeting,
  submitItem
} from './api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const { emitter } = useEmitt()
const cf = ref()
const loading = ref(false)
const form = reactive({})
const actionLoadingMap = ref({})

/** 审批记录列表 */
const approvalRecords = ref([])

/** 是否已进入正常审批流程（非草稿/非退回状态） */
const isInApprovalFlow = computed(() => {
  const s = form.status ? String(form.status).toUpperCase() : ''
  return s !== '' && s !== 'DRAFT' && s !== 'RETURNED'
})

/** 是否为拆复建项目 */
const isRebuild = computed(() => form.projectSubtype === '拆复建')

/** 步骤节点列表（来自接口 processNodes 字段） */
const processNodes = computed(() => {
  return Array.isArray(form.processNodes) ? form.processNodes : []
})

/** 当前正在办理的节点序号（来自接口 currentStep 字段） */
const currentStep = computed(() => {
  return Number(form.currentStep) || 0
})

function stepStatus(i) {
  const cur = currentStep.value
  if (i < cur) return 'success'
  if (i === cur) return 'process'
  return 'wait'
}

/** 根据当前办件状态，确定可用的操作按钮列表 */
const STATUS_ACTIONS = {
  DRAFT: [{ key: 'submit', actionName: '提交审核', business: 'business:approval:submit' }],
  RETURNED: [{ key: 'resubmit', actionName: '提交审核', business: 'business:approval:submit' }],
  REVIEW: [
    { key: 'return', actionName: '退回', business: 'business:approval:return' },
    { key: 'approve', actionName: '审核通过', business: 'business:approval:approve' }
  ],
  ISSUE: [
    { key: 'issueReturn', actionName: '退回', business: 'business:approval:issueReturn' },
    { key: 'issue', actionName: '确认签发', business: 'business:approval:issue' }
  ],
  ISSUE1: [
    { key: 'issue1Return', actionName: '退回', business: 'business:approval:issue1Return' },
    { key: 'issueReview', actionName: '建设科复核通过', business: 'business:approval:issue' }
  ],
  ISSUE2: [
    { key: 'issue2Return', actionName: '退回', business: 'business:approval:issue2Return' },
    { key: 'issueMeeting', actionName: '建设科过会通过', business: 'business:approval:issue' }
  ],
  PAY: [
    { key: 'issueReturn', actionName: '退回', business: 'business:approval:issueReturn' },
    { key: 'confirmPaid', actionName: '确认到账', business: 'business:approval:confirm-paid' }
  ],
  CLOSE: [{ key: 'close', actionName: '办结', business: 'business:approval:close' }],
  SECONDREVIEW: [
    { key: 'supplement', actionName: '补录证号', business: 'business:approval:supplement' }
  ]
}

/** 当前状态对应的操作按钮（基于权限过滤） */
const detailActions = computed(() => {
  // 兼容大小写：接口可能返回 'draft' 或 'DRAFT'
  const statusKey = form.status ? String(form.status).toUpperCase() : ''
  const actions = STATUS_ACTIONS[statusKey] || []
  return actions.filter((a) => checkPermi([a.business]))
})

/** 是否可修改（草稿或退回状态时可修改） */
const canModify = computed(() => {
  const s = form.status ? String(form.status).toUpperCase() : ''
  return s === 'DRAFT' || s === 'RETURNED'
})

/** 是否展示修改按钮 */
const showModifyButton = computed(() => {
  return checkPermi(['business:project-application:update']) && canModify.value
})

function actionType(key) {
  if (['approve', 'confirmPaid', 'close', 'supplement'].includes(key)) return 'success'
  if (['return', 'issueReturn', 'issue1Return', 'issue2Return'].includes(key)) return 'danger'
  return 'primary'
}

function actionLoading(key) {
  return !!actionLoadingMap.value[key]
}
function setActionLoading(key, val) {
  actionLoadingMap.value[key] = val
}

/** 从接口加载详情数据 */
async function loadDetail() {
  const id = Number(route.query.id)
  if (!id) {
    // 路由切换离开详情页时，清除表单数据
    Object.keys(form).forEach((k) => delete form[k])
    approvalRecords.value = []
    return
  }
  loading.value = true
  try {
    const res = await getDetail(id)
    Object.keys(form).forEach((k) => delete form[k])
    const r = res || {}
    Object.assign(form, r)
    // 确保 materials 结构完整
    form.materials = {
      feeForm: !!r.materialsFeeForm,
      permitCopy: !!r.materialsPermitCopy,
      civilAirForm: !!r.materialsCivilAirForm
    }
    // 确保 landUses 是数组
    if (typeof r.landUses === 'string' && r.landUses) {
      form.landUses = r.landUses.split(',').filter(Boolean)
    } else if (Array.isArray(r.landUses)) {
      form.landUses = r.landUses
    } else {
      form.landUses = []
    }
    // 拆复建相关字段回显
    form.relatedPermitNo = r.relatedPermitNo || ''
    form.relatedProjectName = r.relatedProjectName || ''
    form.archivedResidentialArea = r.archivedResidentialArea || 0
    form.archivedNonResidentialArea = r.archivedNonResidentialArea || 0
    form.archivedCivilAirArea = r.archivedCivilAirArea || 0
    form.archivedReceivable = r.archivedReceivable || 0
    form.actualReceivable = r.actualReceivable || 0
    // 触发配套费计算
    applyCalc(form)
    // 加载审批记录（仅进入正常审批流程后）
    loadApprovalRecords(id)
  } catch (e) {
    ElMessage.error(e?.message || '获取详情失败')
  } finally {
    loading.value = false
  }
}

/** 加载审批记录 */
async function loadApprovalRecords(applicationId) {
  try {
    const res = await getApprovalRecords(applicationId)
    approvalRecords.value = Array.isArray(res) ? res : res?.list || []
  } catch {
    approvalRecords.value = []
  }
}

/** 格式化状态标签 */
function statusLabel(status) {
  if (!status) return '—'
  return STATUS_LABEL[status] || status
}

watch(() => route.query.id, loadDetail, { immediate: true })

/** 返回：无操作按钮且无修改按钮时直接返回上一页，否则二次确认 */
async function handleBack() {
  // 没有操作按钮且没有修改按钮时，无需确认，直接返回来源页
  if (detailActions.value.length === 0 && !showModifyButton.value) {
    goBack()
    return
  }
  // 有操作按钮或修改按钮时，二次确认（可能涉及未保存的操作）
  try {
    await ElMessageBox.confirm('确定返回吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定返回',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  goBack()
}

/** 返回来源页，无历史记录时兜底到待处理页 */
function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/pending')
  }
}

function goEdit() {
  router.push({ path: '/project-application-create', query: { id: String(form.id), mode: 'edit' } })
}

// ===================== 操作按钮分发 =====================

function handleAction(key) {
  // 提交审核：二次确认 → 调用 update 接口
  if (key === 'submit' || key === 'resubmit') {
    submitForReview(key)
    return
  }

  // 其他按钮打开通用弹窗
  const titleMap = {
    approve: '审核通过',
    return: '退回修改',
    issueReturn: '退回修改',
    issue1Return: '退回修改',
    issue2Return: '退回修改',
    issue: '确认签发',
    issueReview: '建设科复核通过',
    issueMeeting: '建设科过会通过',
    confirmPaid: '确认到账',
    close: '办结归档',
    supplement: '补录工规证号'
  }

  actionDialog.visible = true
  actionDialog.title = titleMap[key] || '操作'
  actionDialog.type = key
  actionDialog.loading = false

  resetActionForm()

  // 预填默认值
  if (key === 'supplement') {
    actionForm.permitNo = form.permitNo || ''
  }
  if (key === 'confirmPaid') {
    actionForm.paidAmount = form.receivable || null
  }

  setTimeout(() => actionFormRef.value?.clearValidate(), 0)
}

/** 提交审核：二次弹窗确认 → 调用 update + submit 接口 */
async function submitForReview(key) {
  const actionLabel = key === 'resubmit' ? '重新提交审核' : '提交审核'
  try {
    await ElMessageBox.confirm(`确认${actionLabel}？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  setActionLoading(key, true)
  try {
    // 从详情数据构建 update 入参
    const payload = buildUpdatePayload(form)
    await updateItem(payload)
    // 调用 submit 接口推进审批流
    await submitItem({ applicationId: form.id })
    ElMessage.success(`${actionLabel}成功`)
    // 重新加载数据
    loadDetail()
    emitter.emit('pending-stats-updated')
  } catch (e) {
    ElMessage.error(e?.message || `${actionLabel}失败`)
  } finally {
    setActionLoading(key, false)
  }
}

/** 从详情数据构建 update 入参 */
function buildUpdatePayload(row) {
  return {
    id: row.id,
    projectName: row.projectName,
    plotInfo: row.plotInfo,
    fundSource: row.fundSource,
    fundSourceRemark: row.fundSourceRemark,
    landUses: Array.isArray(row.landUses) ? row.landUses.join(',') : row.landUses,
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
    residentialArea: row.residentialArea,
    nonResidentialArea: row.nonResidentialArea,
    archivedResidentialArea: row.archivedResidentialArea,
    archivedReceivable: row.archivedReceivable,
    actualReceivable: row.actualReceivable
  }
}

// ===================== 通用审批弹窗 =====================

const actionDialog = reactive({
  visible: false,
  title: '',
  type: '',
  loading: false
})

const actionFormRef = ref()
const actionForm = reactive({
  opinion: '',
  payDate: '',
  paidAmount: null,
  paymentNoticeNo: '',
  receiptSigner: '',
  permitNo: '',
  issueDate: ''
})

const actionRules = computed(() => {
  const rules = {}
  if (['return', 'issueReturn', 'issue1Return', 'issue2Return'].includes(actionDialog.type)) {
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
  if (actionDialog.type === 'issue') {
    rules.issueDate = [{ required: true, message: '请选择签发日期', trigger: 'change' }]
  }
  return rules
})

function resetActionForm() {
  actionForm.opinion = ''
  actionForm.payDate = todayText()
  actionForm.paidAmount = null
  actionForm.paymentNoticeNo = ''
  actionForm.receiptSigner = ''
  actionForm.permitNo = ''
  actionForm.issueDate = todayText()
}

/** 确认弹窗操作 */
async function confirmAction() {
  try {
    await actionFormRef.value?.validate()
  } catch {
    return
  }

  const confirmMap = {
    approve: '确认审核通过？',
    return: '确认退回该办件？',
    issueReturn: '确认退回该办件？',
    issue1Return: '确认退回该办件？',
    issue2Return: '确认退回该办件？',
    issue: '确认签发并进入待缴款？',
    issueReview: '确认建设科复核通过？',
    issueMeeting: '确认建设科过会通过？',
    confirmPaid: '确认到账并进入待办结？',
    close: '确认办结归档？',
    supplement: '确认补录工规证号？'
  }
  try {
    await ElMessageBox.confirm(confirmMap[actionDialog.type] || '确认操作？', '提示', {
      type: 'warning'
    })
  } catch {
    return
  }

  actionDialog.loading = true
  try {
    const type = actionDialog.type
    const payload = { applicationId: form.id }

    if (type === 'approve') {
      payload.opinion = actionForm.opinion || undefined
      await approve(payload)
    } else if (
      type === 'return' ||
      type === 'issueReturn' ||
      type === 'issue1Return' ||
      type === 'issue2Return'
    ) {
      payload.opinion = actionForm.opinion
      await returnModify(payload)
    } else if (type === 'issue') {
      payload.paymentNoticeNo = actionForm.paymentNoticeNo || undefined
      payload.opinion = actionForm.opinion || undefined
      payload.issueDate = actionForm.issueDate || undefined
      await issueApi(payload)
    } else if (type === 'issueReview') {
      payload.opinion = actionForm.opinion || undefined
      await issueReview(payload)
    } else if (type === 'issueMeeting') {
      payload.opinion = actionForm.opinion || undefined
      await issueMeeting(payload)
    } else if (type === 'confirmPaid') {
      payload.paidAmount = actionForm.paidAmount
      payload.paymentReceivedDate = actionForm.payDate || undefined
      payload.opinion = actionForm.opinion || undefined
      await confirmPaidApi(payload)
    } else if (type === 'close') {
      payload.receiptSigner = actionForm.receiptSigner
      payload.opinion = actionForm.opinion || undefined
      await closeApi(payload)
    } else if (type === 'supplement') {
      payload.permitNo = actionForm.permitNo
      await supplementPermit(payload)
      await submitItem({ applicationId: payload.applicationId })
    }

    const successMap = {
      approve: '已审核通过',
      return: '已退回',
      issueReturn: '已退回',
      issue1Return: '已退回',
      issue2Return: '已退回',
      issue: '已签发',
      issueReview: '复核已通过',
      issueMeeting: '过会已通过',
      confirmPaid: '已确认到账',
      close: '已办结归档',
      supplement: '已补录证号'
    }
    ElMessage.success(successMap[type] || '操作成功')
    actionDialog.visible = false
    loadDetail()
    emitter.emit('pending-stats-updated')
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    actionDialog.loading = false
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 12px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.title-back-icon {
  cursor: pointer;
  color: #4e5969;
  font-size: 18px;
  transition: color 0.2s;
}

.title-back-icon:hover {
  color: #165dff;
}

.steps-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px 28px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.form-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px 28px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

/* 审批记录样式 */
.approval-record-item {
  padding: 4px 0;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.record-node {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.record-status {
  font-size: 12px;
}

.record-body {
  font-size: 13px;
  color: #4e5969;
}

.record-row {
  margin-bottom: 4px;
  line-height: 1.6;
}

.record-label {
  color: #86909c;
}

.record-value {
  color: #1d2129;
}

/* 确认到账弹窗：实际到账金额输入框文字左对齐 */
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
