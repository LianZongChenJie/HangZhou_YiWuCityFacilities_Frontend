<template>
  <div class="app-container" v-if="form">
    <h3 class="page-title">{{ form.projectName || '办件详情' }}</h3>

    <el-steps :active="activeStep" align-center finish-status="success" style="margin-bottom:20px;">
      <el-step
        v-for="(n, i) in FLOW_NODES"
        :key="n.key"
        :title="n.label"
        :status="stepStatus(i)"
        @click="showNode(n)"
      />
    </el-steps>

    <div class="fee-banner">
      <el-row :gutter="12">
        <el-col :span="6">住宅面积 <div class="num">{{ form.residentialArea }}<span class="unit">㎡ × 30 元</span></div></el-col>
        <el-col :span="6">非住宅面积 <div class="num">{{ form.nonResidentialArea }}<span class="unit">㎡ × 80 元</span></div></el-col>
        <el-col :span="6">人防面积 <div class="num">{{ Number(form.civilAirArea) || 0 }}<span class="unit">㎡ 不计征</span></div></el-col>
        <el-col :span="6">应收总额 <div class="num" style="color:#c45656;">{{ formatMoney(form.receivable) }}<span class="unit">元</span></div></el-col>
      </el-row>
    </div>

    <CaseForm
      ref="cf"
      v-model="form"
      :disabled="!canEdit"
      :show-review-opinion="true"
      :show-issue-opinion="true"
    />

    <el-divider content-position="left">审批记录</el-divider>
    <el-timeline>
      <el-timeline-item v-for="(l, i) in form.logs || []" :key="i" :timestamp="l.time" placement="top">
        <b>{{ l.user }}</b> {{ l.action }}
        <div v-if="l.comment" style="color:#606266;margin-top:4px;">{{ l.comment }}</div>
      </el-timeline-item>
    </el-timeline>

    <el-divider content-position="left">关联单据（同工规证号）</el-divider>
    <el-table v-if="related.length" :data="related" border size="small">
      <el-table-column prop="projectName" label="项目名称" />
      <el-table-column prop="bizType" label="业务类型" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">{{ STATUS_LABEL[row.status] }}</template>
      </el-table-column>
      <el-table-column label="应缴金额" width="120">
        <template #default="{ row }">{{ formatMoney(row.receivable) }}</template>
      </el-table-column>
      <el-table-column label="" width="80">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/case/detail/${row.id}`)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else description="暂无" :image-size="60" />

    <div class="sticky-actions">
      <el-button @click="back">返回</el-button>
      <template v-if="role === 'accept' && canEdit">
        <el-button @click="save(false)">保存草稿</el-button>
        <el-button type="primary" @click="save(true)">提交审核</el-button>
      </template>
      <el-button v-if="role === 'accept' && needFill" type="primary" @click="fill">补录工规证号</el-button>
      <template v-if="role === 'review' && form.status === 'review'">
        <el-button type="danger" @click="reject">退回</el-button>
        <el-button type="primary" @click="pass">通过</el-button>
      </template>
      <template v-if="role === 'issue' && form.status === 'issue'">
        <el-date-picker v-model="form.issueDate" type="date" value-format="YYYY-MM-DD" placeholder="签发日期" />
        <el-button type="primary" @click="doIssue">确认签发</el-button>
      </template>
      <template v-if="role === 'issue' && form.status === 'pay'">
        <el-date-picker v-model="payDate" type="date" value-format="YYYY-MM-DD" placeholder="到账日期" />
        <el-button type="primary" @click="doPay">确认到账</el-button>
      </template>
      <template v-if="role === 'close' && (form.status === 'close' || form.status === 'archived')">
        <el-button @click="print">打印回执</el-button>
      </template>
      <template v-if="role === 'close' && form.status === 'close'">
        <el-input v-model="receiver" placeholder="领取人" style="width:140px;" />
        <el-button type="primary" @click="doArchive">确认办结</el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CaseForm from './CaseForm.vue'
import { useUserStore } from '@/stores/user'
import { useCaseStore } from '@/stores/cases'
import { DEFAULT_REVIEW_OPINION, FLOW_NODES, STATUS_LABEL } from '@/utils/constants'
import { formatMoney, nowText, todayText } from '@/utils/calc'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const cases = useCaseStore()
const cf = ref()
const form = reactive({})
const payDate = ref(todayText())
const receiver = ref('')

const role = computed(() => user.role)
const related = computed(() => cases.related(form.permitNo, form.id))
const needFill = computed(() => form.isFourCerts && !form.permitNo)
const canEdit = computed(() => {
  if (role.value === 'accept') return form.status === 'draft' && form.createdBy === user.username
  if (role.value === 'review') return form.status === 'review'
  if (role.value === 'issue') return form.status === 'issue' || form.status === 'pay'
  return false
})
const activeStep = computed(() => FLOW_NODES.findIndex((n) => n.key === form.status))

function stepStatus(i) {
  const cur = activeStep.value
  if (i < cur) return 'success'
  if (i === cur) return 'process'
  return 'wait'
}

function load() {
  const row = cases.getById(route.params.id)
  if (!row) {
    ElMessage.error('办件不存在')
    router.push('/case/query')
    return
  }
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  if (!form.reviewOpinion) form.reviewOpinion = DEFAULT_REVIEW_OPINION
  if (!form.issueDate) form.issueDate = todayText()
  payDate.value = todayText()
  receiver.value = row.receiverName || row.builderName
}

watch(() => route.params.id, load, { immediate: true })

function showNode(n) {
  const html = (form.logs || [])
    .map((l) => `${l.time}　${l.user}　${l.action}${l.comment ? '：' + l.comment : ''}`)
    .join('<br/>')
  ElMessageBox.alert(html || '暂无操作记录', n.label, { dangerouslyUseHTMLString: true })
}

function back() {
  if (route.query.tab) router.push({ path: '/case/pending', query: { tab: route.query.tab } })
  else router.push('/case/query')
}
function goNext(next, tab) {
  if (next) router.replace({ path: `/case/detail/${next.id}`, query: { tab, mode: 'handle' } })
  else router.push({ path: '/case/pending', query: { tab } })
}

async function save(submit) {
  try {
    if (submit) await cf.value.validate(true)
  } catch (e) {
    ElMessage.warning(e.message || '请完善表单')
    return
  }
  if (submit) await ElMessageBox.confirm('确认提交审核？', '提示', { type: 'warning' })
  cases.save(form.id, form, user.user, { submit })
  ElMessage.success(submit ? '已提交' : '已保存')
  if (submit) router.push('/workbench')
}
async function fill() {
  const { value } = await ElMessageBox.prompt('工程规划许可证号', '补录工规证号', { inputValue: form.permitNo })
  cases.fillPermit(form.id, value.trim(), user.user)
  ElMessage.success('已补录')
  load()
}
async function pass() {
  await ElMessageBox.confirm('确认审核通过？', '提示', { type: 'warning' })
  const next = cases.reviewPass(form.id, form, user.user)
  ElMessage.success('已通过')
  goNext(next, 'review')
}
async function reject() {
  const { value } = await ElMessageBox.prompt('退回意见（必填）', '退回修改', {
    inputValidator: (v) => !!v || '请填写退回意见'
  })
  const next = cases.reviewReject(form.id, form, user.user, value)
  ElMessage.success('已退回')
  goNext(next, 'review')
}
async function doIssue() {
  await ElMessageBox.confirm('确认签发（开票）？', '提示', { type: 'warning' })
  const next = cases.confirmIssue(form.id, form, user.user)
  ElMessage.success('已签发')
  goNext(next, 'issue')
}
async function doPay() {
  await ElMessageBox.confirm(`确认到账 ${payDate.value} ？`, '提示', { type: 'warning' })
  const next = cases.confirmPay(form.id, payDate.value, user.user)
  ElMessage.success('已到账')
  goNext(next, 'pay')
}
function print() {
  window.open(`${location.origin}${location.pathname}#/print/${form.id}`, '_blank')
}
async function doArchive() {
  if (!receiver.value) return ElMessage.warning('请填写领取人')
  await ElMessageBox.confirm('确认办结归档？', '提示', { type: 'warning' })
  const next = cases.archive(form.id, { receiverName: receiver.value, receiveTime: nowText() }, user.user)
  ElMessage.success('已归档')
  goNext(next, 'close')
}
</script>

<style scoped>
:deep(.el-step) { cursor: pointer; }
:deep(.el-step__head.is-process) { color: #e6a23c; border-color: #e6a23c; }
:deep(.el-step__title.is-process) { color: #e6a23c; }
:deep(.el-step__head.is-wait),
:deep(.el-step__title.is-wait) { color: #c0c4cc; }
</style>
