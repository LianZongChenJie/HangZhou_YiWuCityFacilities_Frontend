<template>
  <div class="app-container">
    <h3 class="page-title">待处理</h3>
    <el-tabs v-model="tab" @tab-change="onTab">
      <el-tab-pane v-for="t in tabs" :key="t.name" :label="t.label" :name="t.name" />
    </el-tabs>

    <el-form v-if="tab === 'pay'" inline>
      <el-form-item label="工规证号">
        <el-input v-model="permitQ" placeholder="精确搜索，对财政系统" clearable style="width:260px;" />
      </el-form-item>
    </el-form>

    <el-table :data="filtered" border stripe>
      <el-table-column prop="permitNo" label="工规证号" min-width="170">
        <template #default="{ row }">{{ row.permitNo || '（待补录）' }}</template>
      </el-table-column>
      <el-table-column prop="projectName" label="项目名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="builderName" label="建设单位" min-width="160" show-overflow-tooltip />
      <el-table-column label="应缴金额" width="130" align="right">
        <template #default="{ row }">{{ formatMoney(row.receivable) }}</template>
      </el-table-column>
      <el-table-column v-if="tab === 'pay' || tab === 'issue'" label="开票日" width="120">
        <template #default="{ row }">{{ formatDate(row.issueDate) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="STATUS_TAG[row.status]" size="small">{{ statusText(row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)">详情</el-button>
          <el-button v-if="tab === 'fillPermit'" link type="primary" @click="fill(row)">补录证号</el-button>
          <el-button v-if="tab === 'returned'" link type="primary" @click="open(row, 'edit')">修改提交</el-button>
          <el-button v-if="tab === 'review'" link type="primary" @click="open(row, 'handle')">办理</el-button>
          <el-button v-if="tab === 'issue'" link type="primary" @click="issue(row)">确认签发</el-button>
          <template v-if="tab === 'pay'">
            <el-date-picker
              v-model="payDates[row.id]"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="到账日期"
              style="width:140px;margin:0 8px;"
              size="small"
            />
            <el-button link type="success" @click="pay(row)">确认到账</el-button>
          </template>
          <el-button v-if="tab === 'close'" link type="primary" @click="print(row)">打印回执</el-button>
          <el-button v-if="tab === 'close'" link type="success" @click="closeCase(row)">办结</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCaseStore } from '@/stores/cases'
import { STATUS_TAG, STATUS_LABEL } from '@/utils/constants'
import { formatDate, formatMoney, todayText, nowText } from '@/utils/calc'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const cases = useCaseStore()
const permitQ = ref('')
const payDates = reactive({})

const roleTabs = {
  accept: [
    { name: 'returned', label: '退回待修改' },
    { name: 'fillPermit', label: '待证号补录' }
  ],
  review: [{ name: 'review', label: '待审核' }],
  issue: [
    { name: 'pay', label: '待缴款' },
    { name: 'issue', label: '待签发' }
  ],
  close: [{ name: 'close', label: '待办结' }]
}

const tabs = computed(() => roleTabs[user.role] || [])
const tab = ref(route.query.tab || tabs.value[0]?.name || 'review')

watch(
  () => [user.role, route.query.tab],
  () => {
    const allowed = tabs.value.map((t) => t.name)
    const q = route.query.tab
    tab.value = allowed.includes(q) ? q : allowed[0]
  },
  { immediate: true }
)

const filtered = computed(() => {
  let list = cases.pendingOf(user.user, tab.value)
  if (tab.value === 'pay' && permitQ.value) {
    list = list.filter((x) => x.permitNo === permitQ.value.trim())
  }
  return list
})

function statusText(row) {
  if (row.rejected && row.status === 'draft') return '退回待修改'
  if (row.isFourCerts && !row.permitNo) return '待证号补录'
  return STATUS_LABEL[row.status]
}
function onTab(name) {
  router.replace({ path: '/case/pending', query: { tab: name } })
}
function open(row, mode) {
  router.push({ path: `/case/detail/${row.id}`, query: { tab: tab.value, mode: mode || 'handle' } })
}
async function fill(row) {
  const { value } = await ElMessageBox.prompt('请输入工程规划许可证号', '补录工规证号', {
    inputValue: row.permitNo,
    confirmButtonText: '保存'
  })
  if (!value) return
  cases.fillPermit(row.id, value.trim(), user.user)
  ElMessage.success('已补录，不重走审批')
}
async function issue(row) {
  const { value } = await ElMessageBox.prompt('签发日期（开票日）', '确认签发', {
    inputValue: todayText(),
    confirmButtonText: '确认签发'
  })
  await ElMessageBox.confirm('确认将该办件签发并进入待缴款？', '提示', { type: 'warning' })
  cases.confirmIssue(row.id, { ...row, issueDate: value, issueOpinion: row.issueOpinion }, user.user)
  ElMessage.success('已签发')
}
async function pay(row) {
  const d = payDates[row.id] || todayText()
  await ElMessageBox.confirm(`确认到账日期 ${d} ？`, '确认到账', { type: 'warning' })
  cases.confirmPay(row.id, d, user.user)
  ElMessage.success('已确认到账，进入待办结')
}
function print(row) {
  window.open(`${location.origin}${location.pathname}#/print/${row.id}`, '_blank')
}
async function closeCase(row) {
  const { value } = await ElMessageBox.prompt('领取人姓名', '办结归档', {
    inputValue: row.builderName,
    confirmButtonText: '确认归档'
  })
  await ElMessageBox.confirm('确认办结归档？', '提示', { type: 'warning' })
  cases.archive(row.id, { receiverName: value, receiveTime: nowText() }, user.user)
  ElMessage.success('已归档')
}
</script>
