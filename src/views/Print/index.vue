<template>
  <div class="sheet" v-loading="loading">
    <template v-if="row">
      <div class="no-print bar">
        <el-button type="primary" @click="doPrint">打印</el-button>
        <el-button @click="doClose">关闭</el-button>
      </div>
      <h2>城市基础设施配套费征收缴费情况审签单</h2>
      <p class="sub">办结回执单</p>
      <table>
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
          <td>{{ row.residentialArea }} ㎡</td>
          <th>非住宅面积</th>
          <td>{{ row.nonResidentialArea }} ㎡</td>
        </tr>
        <tr>
          <th>人防面积</th>
          <td>{{ row.civilAirArea || 0 }} ㎡</td>
          <th>缴费金额</th>
          <td>{{ formatMoney(row.receivable) }} 元</td>
        </tr>
        <tr>
          <th>受理意见</th>
          <td colspan="3">{{ row.acceptOpinion }}</td>
        </tr>
        <tr>
          <th>审核意见</th>
          <td colspan="3">{{ row.reviewOpinion }}</td>
        </tr>
        <tr>
          <th>签发意见、办结</th>
          <td colspan="3">{{ row.issueOpinion || '—' }}</td>
        </tr>
        <tr>
          <th>缴费表领取人（签字）</th>
          <td>{{ row.receiverName || '　　　　' }}</td>
          <th>领取时间</th>
          <td>{{ row.receiveTime || '　　　　' }}</td>
        </tr>
      </table>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatMoney } from '@/utils/calc'
import { getDetail } from './api'

const route = useRoute()
const loading = ref(true)
const row = ref(null)

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
@media print {
  .bar { display: none; }
  .sheet { padding: 0; max-width: 100%; }
  @page { margin: 5mm; }
}
</style>
