<template>
  <el-form :model="form" :disabled="disabled" label-width="148px">
    <el-divider content-position="left">前置材料核验</el-divider>
    <el-form-item label="纸质材料" required>
      <el-checkbox v-model="form.materials.feeForm">《义乌市城市基础设施配套费征收缴费表》（一式两份，盖章）</el-checkbox>
      <el-checkbox v-model="form.materials.permitCopy" :disabled="form.isFourCerts">
        《建设工程规划许可证》复印件{{ form.isFourCerts ? '（四证齐发可空）' : '' }}
      </el-checkbox>
      <el-checkbox v-model="form.materials.civilAirForm">
        《人防工程易地建设核实核定表》复印件{{ Number(form.civilAirArea) > 0 ? '（人防面积>0必勾）' : '' }}
      </el-checkbox>
    </el-form-item>

    <el-divider content-position="left">业务标记</el-divider>
    <el-row>
      <el-col :span="12">
        <el-form-item label="业务类型" prop="bizType">
          <el-select v-model="form.bizType" style="width:100%;">
            <el-option v-for="i in BIZ_TYPES" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item v-if="form.bizType === '初次'" label="项目细分" prop="projectSubtype">
          <el-select v-model="form.projectSubtype" style="width:100%;">
            <el-option v-for="i in PROJECT_SUBTYPES" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="特殊标记">
      <el-checkbox v-model="form.isFourCerts">四证齐发（工规证号可空）</el-checkbox>
      <el-checkbox v-model="form.hasReduction">有减免</el-checkbox>
    </el-form-item>
    <el-row v-if="form.hasReduction">
      <el-col :span="12">
        <el-form-item label="减免金额">
          <el-input-number v-model="form.reductionAmount" :min="0" :precision="2" style="width:100%;" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="政策依据">
          <el-input v-model="form.reductionBasis" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">项目信息</el-divider>
    <el-form-item label="项目名称" prop="projectName">
      <el-input v-model="form.projectName" />
    </el-form-item>
    <el-row>
      <el-col :span="12">
        <el-form-item label="地块信息">
          <el-input v-model="form.plotInfo" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="资金来源">
          <el-select v-model="form.fundSource" style="width:100%;">
            <el-option v-for="i in FUND_SOURCES" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item v-if="form.fundSource === '其他'" label="资金来源说明">
      <el-input v-model="form.fundSourceRemark" />
    </el-form-item>
    <el-form-item label="土地用途">
      <el-checkbox-group v-model="form.landUses">
        <el-checkbox v-for="i in LAND_USES" :key="i" :label="i" :value="i">{{ i }}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item v-if="(form.landUses || []).includes('其他')" label="土地用途说明">
      <el-input v-model="form.landUseRemark" />
    </el-form-item>

    <el-divider content-position="left">建设单位</el-divider>
    <el-row>
      <el-col :span="8">
        <el-form-item label="建设单位" prop="builderName">
          <el-input v-model="form.builderName" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="联系人">
          <el-input v-model="form.contact" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">规划许可与面积</el-divider>
    <el-form-item label="工程规划许可证号" :required="!form.isFourCerts">
      <el-input v-model="form.permitNo" :placeholder="form.isFourCerts ? '四证齐发可空，后期补录' : '必填'" />
    </el-form-item>
    <el-row>
      <el-col :span="6">
        <el-form-item label="地上建筑面积">
          <el-input-number v-model="form.aboveArea" :min="0" :precision="2" style="width:100%;" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="地下建筑面积">
          <el-input-number v-model="form.underArea" :min="0" :precision="2" style="width:100%;" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="地上住宅面积">
          <el-input-number v-model="form.aboveResidentialArea" :min="0" :precision="2" style="width:100%;" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="人防面积">
          <el-input-number v-model="form.civilAirArea" :min="0" :precision="2" style="width:100%;" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">配套费核算</el-divider>
    <div class="fee-banner">
      <el-row :gutter="12">
        <el-col :span="6">住宅面积 <div class="num">{{ form.residentialArea }}<span class="unit">㎡</span></div></el-col>
        <el-col :span="6">非住宅面积 <div class="num">{{ form.nonResidentialArea }}<span class="unit">㎡</span></div></el-col>
        <el-col :span="6">人防面积 <div class="num">{{ Number(form.civilAirArea) || 0 }}<span class="unit">㎡</span></div></el-col>
        <el-col :span="6">
          应收总额
          <div class="num" style="color:#c45656;">{{ formatMoney(form.receivable) }}<span class="unit">元</span></div>
          <el-tag v-if="form.amountManual" type="danger" size="small">已人工修改</el-tag>
        </el-col>
      </el-row>
      <div style="margin-top:8px;color:#909399;font-size:12px;">
        住宅 30 元/㎡，非住宅 80 元/㎡，人防不计征。地下住宅面积 {{ form.underResidentialArea }} ㎡。
      </div>
    </div>
    <el-row>
      <el-col :span="12">
        <el-form-item label="应收金额">
          <el-input-number v-model="form.receivable" :precision="2" style="width:220px;" @change="onManualAmount" />
          <el-button v-if="form.amountManual" link type="primary" style="margin-left:8px;" @click="restoreAuto">恢复自动计算</el-button>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="减免金额">
          <span>{{ form.hasReduction ? formatMoney(form.reductionAmount) : '0.00' }} 元</span>
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">意见</el-divider>
    <el-form-item label="受理意见">
      <el-input v-model="form.acceptOpinion" type="textarea" :rows="2" />
    </el-form-item>
    <el-form-item v-if="showReviewOpinion" label="审核意见">
      <el-input v-model="form.reviewOpinion" type="textarea" :rows="2" />
    </el-form-item>
    <el-form-item v-if="showIssueOpinion" label="签发意见">
      <el-input v-model="form.issueOpinion" type="textarea" :rows="2" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { applyCalc, calcFee, formatMoney } from '@/utils/calc'
import { BIZ_TYPES, FUND_SOURCES, LAND_USES, PROJECT_SUBTYPES } from '@/utils/constants'

const props = defineProps({
  modelValue: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  showReviewOpinion: { type: Boolean, default: false },
  showIssueOpinion: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const form = reactive(props.modelValue)

watch(
  () => [
    form.aboveArea,
    form.underArea,
    form.aboveResidentialArea,
    form.civilAirArea,
    form.hasReduction,
    form.reductionAmount
  ],
  () => {
    applyCalc(form)
    emit('update:modelValue', form)
  }
)

function onManualAmount() {
  const auto = calcFee(form).autoReceivable
  form.amountManual = Number(form.receivable) !== auto
  emit('update:modelValue', form)
}
function restoreAuto() {
  form.amountManual = false
  applyCalc(form)
}

async function validate(submit) {
  if (!submit) return true
  if (!form.materials.feeForm) return Promise.reject(new Error('请勾选已收取缴费表'))
  if (!form.isFourCerts && !form.materials.permitCopy) return Promise.reject(new Error('请勾选已收取工规证复印件'))
  if ((Number(form.civilAirArea) || 0) > 0 && !form.materials.civilAirForm) {
    return Promise.reject(new Error('人防面积大于 0，请勾选人防核定表'))
  }
  if (!form.isFourCerts && !form.permitNo) return Promise.reject(new Error('请填写工程规划许可证号'))
  if (!form.projectName) return Promise.reject(new Error('请填写项目名称'))
  if (!form.builderName) return Promise.reject(new Error('请填写建设单位'))
  return true
}

defineExpose({ validate, form })
</script>
