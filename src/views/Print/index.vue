<template>
  <div class="sheet" v-loading="loading">
    <template v-if="row">
      <div class="no-print bar">
        <el-button type="primary" @click="doPrint">打印</el-button>
        <el-button @click="doClose">关闭</el-button>
      </div>

      <!-- 竣备：退款申请表 -->
      <div v-if="row.bizType === '竣备'">
        <h2>义乌市城市基础设施配套费补缴（退款）申请表</h2>

        <table class="refund-table">
          <tbody>
            <!-- 基本信息区 -->
            <tr>
              <th>项目名称</th>
              <td colspan="3">{{ row.projectName }}</td>
            </tr>
            <tr>
              <th>项目地址</th>
              <td colspan="3">{{ row.plotInfo }}</td>
            </tr>
            <tr>
              <th>建设单位（个人）名称</th>
              <td colspan="3">{{ row.builderName }}</td>
            </tr>
            <tr>
              <th>联系人</th>
              <td>{{ row.contact }}</td>
              <th>联系电话</th>
              <td>{{ row.phone }}</td>
            </tr>
            <tr>
              <th>退款银行</th>
              <td>{{ row.refundBank || '' }}</td>
              <th>退款账户</th>
              <td>{{ row.refundAccount || '' }}</td>
            </tr>
            <!-- 建设主管部门填写确认数据及意见 -->
            <tr>
              <td colspan="4" class="section-header">建设主管部门填写确认数据及意见</td>
            </tr>
            <tr>
              <th>受理意见</th>
              <td>{{ row.acceptOpinion || '—' }}</td>
              <th>受理时间</th>
              <td>{{ formatDate(row.acceptDate || row.createTime) }}</td>
            </tr>
            <tr>
              <th>审核意见</th>
              <td>{{ row.reviewOpinion || '—' }}</td>
              <th>审核时间</th>
              <td>{{ formatDate(row.reviewTime) }}</td>
            </tr>
            <tr>
              <th>签发意见</th>
              <td>{{ row.issueOpinion || '—' }}</td>
              <th>签发时间</th>
              <td>{{ formatDate(row.paymentNoticeIssuedAt) }}</td>
            </tr>

            <tr>
              <th>到账意见</th>
              <td>{{ row.payOpinion || '—' }}</td>
              <th>到账时间</th>
              <td>{{ formatDate(row.paymentReceivedDate) }}</td>
            </tr>
            <tr>
              <th>办结意见</th>
              <td>{{ row.closeOpinion || '—' }}</td>
              <th>办结时间</th>
              <td>{{ formatDate(row.closedAt || row.closeDate) }}</td>
            </tr>
            <tr>
              <td colspan="4" class="section-header"
                >规划核实及人防竣工验收确认面积（建筑面积含不计容积率建筑面积）</td
              >
            </tr>
            <tr>
              <th rowspan="3">建筑面积(m²)</th>
              <th>住宅</th>
              <th>非住宅</th>
              <th>人防面积</th>
            </tr>
            <tr>
              <td>{{ row.residentialArea || 0 }}</td>
              <td>{{ row.nonResidentialArea || 0 }}</td>
              <td>{{ row.civilAirArea || 0 }}</td>
            </tr>
            <tr>
              <td colspan="4" class="note-cell">其他说明事项：</td>
            </tr>
            <!-- 城市基础设施配套费补缴（退款）收讫情况 -->
            <tr>
              <td colspan="4" class="section-header">城市基础设施配套费补缴（退款）收讫情况</td>
            </tr>
            <tr>
              <th>项目</th>
              <th colspan="2">金额（大写）</th>
              <th>小写</th>
            </tr>
            <tr>
              <td>补缴</td>
              <td colspan="2">{{ !isRefund && displayAmount > 0 ? amountChinese : '&nbsp;' }}</td>
              <td>{{
                !isRefund && displayAmount > 0 ? '¥ ' + formatMoney(displayAmount) : '&nbsp;'
              }}</td>
            </tr>
            <tr>
              <td>退款</td>
              <td colspan="2">{{ isRefund && displayAmount > 0 ? amountChinese : '&nbsp;' }}</td>
              <td>{{
                isRefund && displayAmount > 0 ? '¥ ' + formatMoney(displayAmount) : '&nbsp;'
              }}</td>
            </tr>
            <tr>
              <td colspan="4" class="seal-cell">（建设主管部门盖章）　　　年　　月　　日</td>
            </tr>
          </tbody>
        </table>
        <p class="sub"
          >说明：本表一式两份，费用收讫完毕后一份建设主管部门留存、一份建设单位或个人留存。</p
        >
      </div>

      <!-- 默认：审签单 -->
      <div v-else>
        <h2>城市基础设施配套费征收缴费情况审签单</h2>
        <p class="sub">办结回执单</p>
        <table>
          <tbody>
            <tr>
              <th>建设单位（个人）名称</th>
              <td colspan="3">{{ row.builderName }}</td>
            </tr>
            <tr>
              <th>项目名称</th>
              <td colspan="3">{{ row.projectName }}</td>
            </tr>
            <tr>
              <th>工程规划许可证号</th>
              <td colspan="3">{{ row.permitNo || '（四证齐发待补录）' }}</td>
            </tr>
            <tr>
              <th>住宅面积</th>
              <td>{{ row.residentialArea || 0 }} ㎡</td>
              <th>非住宅面积</th>
              <td>{{ row.nonResidentialArea || 0 }} ㎡</td>
            </tr>
            <tr>
              <th>人防面积</th>
              <td>{{ row.civilAirArea || 0 }} ㎡</td>
              <th>缴费金额</th>
              <td>{{ formatMoney(row.receivable) || 0 }} 元</td>
            </tr>
            <tr>
              <th>受理意见</th>
              <td>{{ row.acceptOpinion || '—' }}</td>
              <th>受理时间</th>
              <td>{{ formatDate(row.acceptDate || row.createTime) }}</td>
            </tr>
            <tr>
              <th>审核意见</th>
              <td>{{ row.reviewOpinion || '—' }}</td>
              <th>审核时间</th>
              <td>{{ formatDate(row.reviewTime) }}</td>
            </tr>
            <tr>
              <th>签发意见</th>
              <td>{{ row.issueOpinion || '—' }}</td>
              <th>签发时间</th>
              <td>{{ formatDate(row.paymentNoticeIssuedAt) }}</td>
            </tr>
            <tr>
              <th>办结意见</th>
              <td>{{ row.closeOpinion || '—' }}</td>
              <th>办结时间</th>
              <td>{{ formatDate(row.closedAt || row.closeDate) }}</td>
            </tr>
            <tr>
              <th>开具缴款通知书</th>
              <td>{{ formatDate(row.paymentNoticeIssuedAt) }}</td>
              <th>费用收讫</th>
              <td>{{ formatDate(row.paymentReceivedDate) }}</td>
            </tr>
            <tr>
              <th>缴费表领取人（签字）</th>
              <td>{{ '　　　　' }}</td>
              <th>领取时间</th>
              <td>{{ '　　　　' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatMoney } from '@/utils/calc'
import { formatDate } from '@/utils/formatTime'
import { getDetail } from './api'

const route = useRoute()
const loading = ref(true)
const row = ref(null)

/** 数字金额转中文大写 */
function numberToChinese(num) {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']
  const decimalUnits = ['角', '分']

  if (num === 0) return '零元整'

  const strVal = Number(Math.abs(num)).toFixed(2)
  const [intPart, decPart] = strVal.split('.')
  const intNum = parseInt(intPart, 10)

  // 转换整数部分
  let intStr = ''
  let zeroCount = 0
  const intLen = intPart.length

  for (let i = 0; i < intLen; i++) {
    const n = parseInt(intPart[i], 10)
    const unit = units[intLen - 1 - i]

    if (n === 0) {
      zeroCount++
      // 万、亿位补单位
      if ((intLen - 1 - i) % 4 === 0 && zeroCount < 4) {
        intStr += unit
        zeroCount = 0
      }
    } else {
      if (zeroCount > 0) {
        intStr += '零'
        zeroCount = 0
      }
      intStr += digits[n] + unit
    }
  }

  intStr = intStr || ''
  if (!intStr) intStr = '零'

  let result = intStr + '元'

  // 转换小数部分
  const jiao = parseInt(decPart[0], 10) || 0
  const fen = parseInt(decPart[1], 10) || 0

  if (jiao === 0 && fen === 0) {
    result += '整'
  } else {
    if (jiao > 0) {
      result += digits[jiao] + '角'
    } else if (intNum > 0) {
      result += '零'
    }
    if (fen > 0) {
      result += digits[fen] + '分'
    }
  }

  return result
}

// 根据 finalPayable 判断是补缴还是退款
const isRefund = computed(() => {
  if (!row.value) return false
  return Number(row.value.finalPayable || 0) < 0
})

const displayAmount = computed(() => {
  if (!row.value) return 0
  return Math.abs(Number(row.value.finalPayable) || 0)
})

const amountChinese = computed(() => {
  return numberToChinese(displayAmount.value)
})

onMounted(async () => {
  console.log('route', route)
  try {
    row.value = await getDetail(Number(route.query.id))
    console.log('row', row)
  } finally {
    loading.value = false
  }
})

function doPrint() {
  window.print()
}
function doClose() {
  window.close()
}
</script>

<style scoped>
.bar {
  text-align: right;
}
.sheet {
  max-width: 860px;
  margin: 0 auto;
  background: #fff;
  padding: 24px 32px 48px;
  min-height: 100%;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}
h2,
.sub {
  text-align: center;
  margin: 0;
}
.sub {
  color: #666;
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #333;
  padding: 10px 12px;
  font-size: 14px;
}
th {
  width: 180px;
  background: #f7f7f7;
  text-align: left;
  font-weight: 600;
}
.refund-table {
  margin-top: 20px;
}
/* 退款申请表样式 */
.refund-table th {
  width: 200px;
  background: #f7f7f7;
  text-align: left;
  font-weight: 600;
}
.refund-table td {
  text-align: left;
}
.refund-table th,
.refund-table td {
  padding: 8px 12px;
}
/* 分区大标题 */
td.section-header {
  background: #f0f0f0;
  font-weight: 700;
  text-align: center !important;
  font-size: 15px;
  letter-spacing: 2px;
}
/* 其他说明事项 */
.note-cell {
  height: 60px;
  vertical-align: top;
  text-align: left;
  padding-left: 12px;
}
/* 盖章行 */
.seal-cell {
  height: 80px;
  vertical-align: bottom;
  text-align: right;
  padding-right: 40px;
  padding-bottom: 10px;
}
@media print {
  .bar {
    display: none;
  }
  .sheet {
    padding: 0;
    max-width: 100%;
  }
  @page {
    margin: 5mm;
  }
}
</style>
