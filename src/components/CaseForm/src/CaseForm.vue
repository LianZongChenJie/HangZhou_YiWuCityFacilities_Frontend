<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="formRules"
    :disabled="readonly"
    label-width="148px"
    :class="['case-form', { 'case-form--readonly': readonlyStyle }]"
  >
    <!-- 前置材料核验 -->
    <el-divider content-position="left">前置材料核验</el-divider>
    <el-form-item label="纸质材料" required>
      <el-checkbox v-model="form.materials.feeForm">
        《义乌市城市基础设施配套费征收缴费表》（一式两份，盖章）
      </el-checkbox>
      <el-checkbox v-model="form.materials.permitCopy" :disabled="readonly || form.isFourCerts">
        《建设工程规划许可证》复印件
      </el-checkbox>
      <el-checkbox v-model="form.materials.civilAirForm">
        《人防工程易地建设核实核定表》复印件
      </el-checkbox>
    </el-form-item>

    <!-- 业务标记 -->
    <el-divider content-position="left">业务标记</el-divider>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="业务类型" prop="bizType">
          <el-select v-model="form.bizType" style="width: 100%">
            <el-option v-for="i in BIZ_TYPES" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item v-if="form.bizType === '初次'" label="项目细分" prop="projectSubtype">
          <el-select v-model="form.projectSubtype" style="width: 100%">
            <el-option v-for="i in PROJECT_SUBTYPES" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="特殊标记">
      <el-checkbox v-model="form.isFourCerts">四证齐发（工规证号可空）</el-checkbox>
      <el-checkbox v-model="form.hasReduction">免征</el-checkbox>
    </el-form-item>
    <!-- 竣备：退款银行和退款账号 -->
    <el-row v-if="isCompletion" :gutter="16">
      <el-col :span="12">
        <el-form-item label="退款银行">
          <el-input v-model="form.refundBank" placeholder="请输入退款银行" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="退款账号">
          <el-input v-model="form.refundAccount" placeholder="请输入退款账号" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-if="form.hasReduction" :gutter="16">
      <el-col :span="12">
        <el-form-item label="免征金额">
          <el-input-number
            v-model="form.reductionAmount"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="政策依据">
          <el-input v-model="form.reductionBasis" />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 项目信息 -->
    <el-divider content-position="left">项目信息</el-divider>
    <el-form-item label="项目名称" prop="projectName">
      <el-input v-model="form.projectName" />
    </el-form-item>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="地块信息" prop="plotInfo">
          <el-input v-model="form.plotInfo" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="资金来源" prop="fundSource">
          <el-select v-model="form.fundSource" style="width: 100%">
            <el-option v-for="i in FUND_SOURCES" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item v-if="form.fundSource === '其他'" label="资金来源说明">
      <el-input v-model="form.fundSourceRemark" />
    </el-form-item>
    <el-form-item label="土地用途" prop="landUses">
      <el-checkbox-group v-model="form.landUses">
        <el-checkbox v-for="i in LAND_USES" :key="i" :label="i" :value="i">{{ i }}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item v-if="(form.landUses || []).includes('其他')" label="土地用途说明">
      <el-input v-model="form.landUseRemark" />
    </el-form-item>

    <!-- 建设单位 -->
    <el-divider content-position="left">建设单位</el-divider>
    <el-row :gutter="16">
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

    <!-- 规划许可与面积 -->
    <el-divider content-position="left">规划许可与面积</el-divider>
    <el-form-item label="工规证号" :required="!form.isFourCerts">
      <el-input
        v-model="form.permitNo"
        :disabled="form.isFourCerts || readonly"
        :placeholder="form.isFourCerts ? '四证齐发，后期补录' : '必填'"
      />
    </el-form-item>

    <!-- 拆复建/竣备：原项目工规证号 -->
    <el-form-item v-if="showArchivedAssociation" label="原项目工规证号" required prop="relatedPermitNo">
      <el-select
        v-model="form.relatedPermitNo"
        filterable
        :loading="archivedLoading"
        placeholder="请选择原项目"
        style="width: 100%"
        @visible-change="onSelectVisible"
        @change="onArchivedChange"
      >
        <el-option
          v-for="item in archivedList"
          :key="item.id"
          :label="`${item.projectName}（${item.permitNo}）`"
          :value="item.permitNo"
        >
          <span>{{ item.projectName }}（{{ item.permitNo }}）</span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-form-item label="地上建筑面积">
          <el-input
            v-model="form.aboveArea"
            placeholder="请输入"
            @input="(v) => onAreaInput('aboveArea', v)"
            @blur="onAreaBlur('aboveArea')"
          >
            <template #suffix>㎡</template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="地下建筑面积">
          <el-input
            v-model="form.underArea"
            placeholder="请输入"
            @input="(v) => onAreaInput('underArea', v)"
            @blur="onAreaBlur('underArea')"
          >
            <template #suffix>㎡</template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="地上住宅面积">
          <el-input
            v-model="form.aboveResidentialArea"
            placeholder="请输入"
            @input="(v) => onAreaInput('aboveResidentialArea', v)"
            @blur="onAreaBlur('aboveResidentialArea')"
          >
            <template #suffix>㎡</template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="人防面积">
          <el-input
            v-model="form.civilAirArea"
            placeholder="请输入"
            @input="(v) => onAreaInput('civilAirArea', v)"
            @blur="onAreaBlur('civilAirArea')"
          >
            <template #suffix>㎡</template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 配套费核算 -->
    <el-divider content-position="left">配套费核算</el-divider>

    <!-- 非拆复建/非竣备：原有核算模块 -->
    <div v-if="!showArchivedAssociation" class="fee-banner">
      <el-row :gutter="12">
        <el-col :span="6">
          <div class="fee-item">
            <div class="fee-label">住宅面积</div>
            <div class="num">{{ form.residentialArea }}<span class="unit">㎡</span></div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="fee-item">
            <div class="fee-label">非住宅面积</div>
            <div class="num">{{ form.nonResidentialArea }}<span class="unit">㎡</span></div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="fee-item">
            <div class="fee-label">人防面积</div>
            <div class="num">{{ Number(form.civilAirArea) || 0 }}<span class="unit">㎡</span></div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="fee-item highlight">
            <div class="fee-label">应收总额</div>
            <div class="num">{{ formatMoney(form.receivable) }}<span class="unit">元</span></div>
          </div>
        </el-col>
      </el-row>
      <div class="fee-hint">
        住宅 30 元/㎡，非住宅 80 元/㎡，人防不计征。地下住宅面积
        {{ form.underResidentialArea }} ㎡。
      </div>
    </div>

    <!-- 拆复建/竣备：重新渲染核算模块 -->
    <div v-if="showArchivedAssociation" class="fee-banner fee-banner-rebuild">
      <!-- 当前项目 -->
      <div class="rebuild-section-label">当前项目</div>
      <el-row :gutter="12">
        <el-col :span="6">
          <div class="fee-item">
            <div class="fee-label">住宅面积</div>
            <div class="num">{{ form.residentialArea }}<span class="unit">㎡</span></div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="fee-item">
            <div class="fee-label">非住宅面积</div>
            <div class="num">{{ form.nonResidentialArea }}<span class="unit">㎡</span></div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="fee-item">
            <div class="fee-label">人防面积</div>
            <div class="num">{{ Number(form.civilAirArea) || 0 }}<span class="unit">㎡</span></div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="fee-item">
            <div class="fee-label">应收总额</div>
            <div class="num"
              >{{ formatMoney(currentAutoReceivable) }}<span class="unit">元</span></div
            >
          </div>
        </el-col>
      </el-row>
      <div class="fee-hint">
        住宅 30 元/㎡，非住宅 80 元/㎡，人防不计征。地下住宅面积
        {{ form.underResidentialArea }} ㎡。
      </div>

      <template v-if="form.relatedPermitNo">
        <el-divider class="rebuild-divider">
          <span class="rebuild-divider-text">原有项目</span>
        </el-divider>

        <el-row :gutter="12">
          <el-col :span="6">
            <div class="fee-item archived">
              <div class="fee-label">住宅面积</div>
              <div class="num"
                >{{ form.archivedResidentialArea || 0 }}<span class="unit">㎡</span></div
              >
            </div>
          </el-col>
          <el-col :span="6">
            <div class="fee-item archived">
              <div class="fee-label">非住宅面积</div>
              <div class="num"
                >{{ form.archivedNonResidentialArea || 0 }}<span class="unit">㎡</span></div
              >
            </div>
          </el-col>
          <el-col :span="6">
            <div class="fee-item archived">
              <div class="fee-label">人防面积</div>
              <div class="num"
                >{{ form.archivedCivilAirArea || 0 }}<span class="unit">㎡</span></div
              >
            </div>
          </el-col>
          <el-col :span="6">
            <div class="fee-item archived">
              <div class="fee-label">应收总额</div>
              <div class="num"
                >{{ formatMoney(form.archivedReceivable) }}<span class="unit">元</span></div
              >
            </div>
          </el-col>
        </el-row>

        <!-- 实际应收金额另起一行 -->
        <div class="rebuild-actual-row">
          <div class="fee-item highlight">
            <div class="fee-label">实际应收金额</div>
            <div class="num"
              >{{ formatMoney(form.actualReceivable) }}<span class="unit">元</span></div
            >
          </div>
          <div class="fee-hint" v-if="isRebuild">
            实际应收金额 = max(当前应收总额 - 原有项目应收总额,
            0)。若当前应收小于原有项目，则实际应收为 0；若大于，则收取差额。
          </div>
          <div class="fee-hint" v-else-if="isCompletion">
            实际应收金额 = 当前应收总额 - 原有项目应收总额。
          </div>
        </div>
      </template>
    </div>

    <!-- 意见 -->
    <el-divider content-position="left">意见</el-divider>
    <el-form-item label="受理意见">
      <el-input
        v-model="form.acceptOpinion"
        type="textarea"
        :rows="2"
        :disabled="opinionDisabled"
      />
    </el-form-item>
  </el-form>

  <!-- 额外内容插槽：用于在意见模块下方、操作按钮上方插入内容（如审批记录、关联单据等） -->
  <slot name="extra"></slot>

  <!-- 操作按钮：放在 el-form 外部，避免被 form 的 disabled 影响 -->
  <div class="form-actions">
    <slot name="actions"></slot>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { applyCalc, calcFee, formatMoney } from '@/utils/calc'
import { BIZ_TYPES, FUND_SOURCES, LAND_USES, PROJECT_SUBTYPES } from '@/utils/constants'
import { getList } from './api'

const props = defineProps({
  modelValue: { type: Object, required: true },
  /** 只读态：true 时表单全部禁用 */
  readonly: { type: Boolean, default: false },
  /** 只读样式：true 时不禁用表单，而是用只读样式展示 */
  readonlyStyle: { type: Boolean, default: false },
  /** 办件状态：用于控制意见模块的可见性和可编辑性 */
  status: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const form = reactive(props.modelValue)
const formRef = ref()

/** 是否为拆复建项目 */
const isRebuild = computed(() => form.projectSubtype === '拆复建')

/** 是否为竣备项目 */
const isCompletion = computed(() => form.bizType === '竣备')

/** 是否需要关联原项目（拆复建 或 竣备） */
const showArchivedAssociation = computed(() => isRebuild.value || isCompletion.value)

/** 当前项目按面积计算的全额应收金额（不含拆复建差额扣减） */
const currentAutoReceivable = computed(() => calcFee(form).autoReceivable)

/** 归一化状态 key（兼容大小写） */
const statusKey = computed(() => (form.status || props.status || '').toUpperCase())

/** 受理意见是否禁用：草稿/退回状态时可编辑 */
const opinionDisabled = computed(() => {
  const s = statusKey.value
  const isDraftOrReturned = s === 'DRAFT' || s === 'RETURNED'
  // 只读态时，非草稿/退回状态下受理意见不可编辑
  return props.readonly ? !isDraftOrReturned : false
})

/** 表单校验规则 */
const formRules = {
  bizType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  projectSubtype: [{ required: true, message: '请选择项目细分', trigger: 'change' }],
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  builderName: [{ required: true, message: '请输入建设单位', trigger: 'blur' }],
  plotInfo: [{ required: true, message: '请输入地块信息', trigger: 'blur' }],
  fundSource: [{ required: true, message: '请选择资金来源', trigger: 'change' }],
  landUses: [{ required: true, message: '请选择土地用途', trigger: 'change' }],
  relatedPermitNo: [{ required: true, message: '请选择原项目工规证号', trigger: 'change' }]
}

/** 已归档（已办结）项目列表，用于拆复建关联选择 */
const archivedList = ref([])
const archivedLoading = ref(false)

/** 加载已归档项目列表 */
async function loadArchivedList() {
  archivedLoading.value = true
  try {
    const res = await getList({ keyword: '' })
    // 兼容接口返回数组或 { list: [] } 两种结构
    if (Array.isArray(res)) {
      archivedList.value = res
    } else if (res?.list) {
      archivedList.value = res.list
    } else if (Array.isArray(res?.data)) {
      archivedList.value = res.data
    } else {
      archivedList.value = []
    }
    // 列表加载完成后，如果已有 relatedPermitNo，自动匹配并填充原有项目信息
    if (form.relatedPermitNo && showArchivedAssociation.value) {
      const item = archivedList.value.find((i) => i.permitNo === form.relatedPermitNo)
      if (item) {
        form.relatedProjectName = item.projectName || ''
        form.archivedResidentialArea = Number(item.residentialArea) || 0
        form.archivedNonResidentialArea = Number(item.nonResidentialArea) || 0
        form.archivedCivilAirArea = Number(item.civilAirArea) || 0
        form.archivedReceivable = Number(item.receivable) || 0
        applyCalc(form)
      }
    }
  } catch (e) {
    archivedList.value = []
  } finally {
    archivedLoading.value = false
  }
}

/** 下拉打开/关闭时触发，首次打开加载列表 */
function onSelectVisible(visible) {
  if (visible && archivedList.value.length === 0) {
    loadArchivedList()
  }
}

/** 选择原有项目后，回填相关字段 */
function onArchivedChange(permitNo) {
  const item = archivedList.value.find((i) => i.permitNo === permitNo)
  if (item) {
    form.relatedProjectName = item.projectName || ''
    form.archivedResidentialArea = Number(item.residentialArea) || 0
    form.archivedNonResidentialArea = Number(item.nonResidentialArea) || 0
    form.archivedCivilAirArea = Number(item.civilAirArea) || 0
    form.archivedReceivable = Number(item.receivable) || 0
  } else {
    form.relatedProjectName = ''
    form.archivedResidentialArea = 0
    form.archivedNonResidentialArea = 0
    form.archivedCivilAirArea = 0
    form.archivedReceivable = 0
  }
  applyCalc(form)
}

/** 关联原项目变化时：拆复建或竣备需加载归档列表，否则清空关联数据 */
watch(
  [() => form.projectSubtype, () => form.bizType],
  ([projectSubtype, bizType]) => {
    const shouldShowArchived = projectSubtype === '拆复建' || bizType === '竣备'
    if (shouldShowArchived) {
      // 拆复建/竣备时：自动加载归档列表，确保 el-select 能正确回显已选中的原项目工规证号
      if (form.relatedPermitNo && archivedList.value.length === 0) {
        loadArchivedList()
      }
    } else {
      // 切换为非关联时，清空关联数据
      clearArchivedRelation()
    }
  }
)

/** 当 relatedPermitNo 有值但归档列表未加载时，自动加载列表（确保详情页回显） */
watch(
  () => form.relatedPermitNo,
  (val) => {
    if (val && showArchivedAssociation.value && archivedList.value.length === 0) {
      loadArchivedList()
    }
  }
)

/** 清空原项目关联数据 */
function clearArchivedRelation() {
  form.relatedPermitNo = ''
  form.relatedProjectName = ''
  form.archivedResidentialArea = 0
  form.archivedNonResidentialArea = 0
  form.archivedCivilAirArea = 0
  form.archivedReceivable = 0
  applyCalc(form)
  emit('update:modelValue', form)
}

watch(
  () => [
    form.aboveArea,
    form.underArea,
    form.aboveResidentialArea,
    form.civilAirArea,
    form.hasReduction,
    form.reductionAmount,
    form.archivedReceivable
  ],
  () => {
    applyCalc(form)
    emit('update:modelValue', form)
  }
)

/** 四证齐发联动：勾选时清除工规证复印件选中状态 */
watch(
  () => form.isFourCerts,
  (val) => {
    if (val) form.materials.permitCopy = false
  }
)

/** 业务类型联动：非初次时清空项目细分 */
watch(
  () => form.bizType,
  (val) => {
    if (val && val !== '初次') {
      form.projectSubtype = ''
    }
  }
)

function onManualAmount() {
  const auto = calcFee(form).autoReceivable
  form.amountManual = Number(form.receivable) !== auto
  emit('update:modelValue', form)
}

/** 面积输入处理：只允许数字和小数点，失焦时补齐两位小数 */
function onAreaInput(field, v) {
  // 过滤非数字和小数点
  let val = String(v).replace(/[^\d.]/g, '')
  // 只保留第一个小数点
  const idx = val.indexOf('.')
  if (idx >= 0) {
    val = val.substring(0, idx + 1) + val.substring(idx + 1).replace(/\./g, '')
    // 小数点后最多两位
    val = val.substring(0, idx + 3)
  }
  form[field] = val
}

/** 面积失焦处理：不足两位小数时用 0 补齐 */
function onAreaBlur(field) {
  const val = form[field]
  if (val === '' || val === null || val === undefined) return
  const num = Number(val)
  if (!isNaN(num)) {
    form[field] = num.toFixed(2)
  }
}
function restoreAuto() {
  form.amountManual = false
  applyCalc(form)
}

async function validate(submit) {
  if (!submit) return true
  // 先做 el-form 原生校验（校验 rules 规则）
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('请完善必填表单项'))
  }
  // 再做业务校验
  if (!form.materials.feeForm) return Promise.reject(new Error('请勾选已收取缴费表'))
  if (!form.isFourCerts && !form.materials.permitCopy)
    return Promise.reject(new Error('请勾选《建设工程规划许可证》复印件'))
  if ((Number(form.civilAirArea) || 0) > 0 && !form.materials.civilAirForm) {
    return Promise.reject(new Error('人防面积大于 0，请勾选《人防工程易地建设核实核定表》'))
  }
  if (!form.isFourCerts && !form.permitNo)
    return Promise.reject(new Error('请填写工程规划许可证号'))
  return true
}

defineExpose({ validate, form, clearValidate: () => formRef.value?.clearValidate?.() })
</script>

<style scoped>
.case-form :deep(.el-input),
.case-form :deep(.el-input-number),
.case-form :deep(.el-select),
.case-form :deep(.el-textarea) {
  width: 100%;
}

.case-form :deep(.el-input-number.--fixed-width) {
  width: auto;
}

.fee-banner {
  background: linear-gradient(135deg, #f8faff 0%, #f0f5ff 100%);
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border: 1px solid #e8eef9;
}

.fee-item {
  text-align: center;
}

.fee-label {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 6px;
}

.fee-item .num {
  font-size: 24px;
  font-weight: 700;
  color: #1d2129;
}

.fee-item .unit {
  font-size: 12px;
  font-weight: 400;
  color: #86909c;
  margin-left: 4px;
}

.fee-item.highlight .num {
  color: #c45656;
}

.fee-hint {
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
}

/* 拆复建配套费核算模块 */
.fee-banner-rebuild {
  border-color: #e6f0ff;
}

.rebuild-section-label {
  font-size: 13px;
  font-weight: 600;
  color: #86909c;
  margin-bottom: 10px;
}

.rebuild-divider {
  margin: 16px 0 12px;
}

.rebuild-divider-text {
  font-size: 13px;
  color: #86909c;
  font-weight: 600;
}

.fee-item.archived .num {
  color: #86909c;
  font-size: 24px;
  font-weight: 700;
}

/* 实际应收金额单独一行 */
.rebuild-actual-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #d9d9d9;
  text-align: center;
}

.rebuild-actual-row .fee-item {
  margin-bottom: 8px;
}

.rebuild-actual-row .fee-item .num {
  font-size: 28px;
}

/* 操作按钮行：占满全行，右对齐 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
  gap: 12px;
}
</style>
