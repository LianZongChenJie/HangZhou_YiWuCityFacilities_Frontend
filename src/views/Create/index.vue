<template>
  <div class="app-container" v-loading="loading">
    <div class="form-card">
      <CaseForm ref="cf" v-model="form" :status="form.status || (isEdit ? 'draft' : '')">
        <template #actions>
          <el-button @click="$router.back()">取消</el-button>
          <el-button :loading="saving" @click="save(false)">保存草稿</el-button>
          <el-button type="primary" :loading="saving" @click="save(true)">提交审核</el-button>
        </template>
      </CaseForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CaseForm } from '@/components/CaseForm'
import { emptyForm, applyCalc } from '@/utils/calc'
import { createApi, draftApi, getDetail, updateApi, submitApi } from './api'
import type { Request } from './type'

const route = useRoute()
const router = useRouter()
const cf = ref()
const form = reactive(emptyForm())
const saving = ref(false)
const loading = ref(false)

/** 是否为修改模式（路由 query 中有 id 参数） */
const isEdit = computed(() => !!route.query.id)

/** 将前端表单结构映射为后端 Request 入参 */
function buildPayload(): Request {
  applyCalc(form)
  return {
    projectName: form.projectName,
    plotInfo: form.plotInfo,
    fundSource: form.fundSource,
    fundSourceRemark: form.fundSourceRemark,
    landUses: Array.isArray(form.landUses) ? form.landUses.join(',') : form.landUses,
    landUseRemark: form.landUseRemark,
    builderName: form.builderName,
    contact: form.contact,
    phone: form.phone,
    permitNo: form.permitNo,
    aboveArea: form.aboveArea ?? undefined,
    underArea: form.underArea ?? undefined,
    aboveResidentialArea: form.aboveResidentialArea ?? undefined,
    civilAirArea: form.civilAirArea ?? undefined,
    bizType: form.bizType,
    projectSubtype: form.projectSubtype,
    isFourCerts: form.isFourCerts,
    hasReduction: form.hasReduction,
    reductionAmount: form.reductionAmount ?? undefined,
    reductionBasis: form.reductionBasis,
    amountManual: form.amountManual,
    receivable: form.receivable ?? undefined,
    acceptOpinion: form.acceptOpinion,
    reviewOpinion: form.reviewOpinion,
    issueOpinion: form.issueOpinion,
    materialsFeeForm: form.materials?.feeForm,
    materialsPermitCopy: form.materials?.permitCopy,
    materialsCivilAirForm: form.materials?.civilAirForm,
    relatedPermitNo: form.relatedPermitNo || undefined,
    relatedProjectName: form.relatedProjectName || undefined,
    residentialArea: form.residentialArea || undefined,
    nonResidentialArea: form.nonResidentialArea || undefined,
    archivedResidentialArea: form.archivedResidentialArea || undefined,
    archivedReceivable: form.archivedReceivable || undefined,
    actualReceivable: form.actualReceivable || undefined
  }
}

/** 修改模式：从接口加载详情数据，正确回显所有字段 */
async function loadDetail() {
  const id = Number(route.query.id)
  if (!id) return
  loading.value = true
  try {
    const res: any = await getDetail(id)
    // 先重置为空表单
    Object.keys(form).forEach((k) => delete form[k])
    Object.assign(form, emptyForm())
    // 逐字段映射接口返回数据到表单结构
    const r = res || {}
    form.projectName = r.projectName || ''
    form.plotInfo = r.plotInfo || ''
    form.fundSource = r.fundSource || ''
    form.fundSourceRemark = r.fundSourceRemark || ''
    form.landUseRemark = r.landUseRemark || ''
    form.builderName = r.builderName || ''
    form.contact = r.contact || ''
    form.phone = r.phone || ''
    form.permitNo = r.permitNo || ''
    form.aboveArea = r.aboveArea ?? null
    form.underArea = r.underArea ?? null
    form.aboveResidentialArea = r.aboveResidentialArea ?? null
    form.civilAirArea = r.civilAirArea ?? 0
    form.bizType = r.bizType || ''
    form.projectSubtype = r.projectSubtype || ''
    form.isFourCerts = !!r.isFourCerts
    form.hasReduction = !!r.hasReduction
    form.reductionAmount = r.reductionAmount ?? 0
    form.reductionBasis = r.reductionBasis || ''
    form.amountManual = !!r.amountManual
    form.receivable = r.receivable ?? 0
    form.acceptOpinion = r.acceptOpinion || ''
    form.reviewOpinion = r.reviewOpinion || ''
    form.issueOpinion = r.issueOpinion || ''
    form.status = r.status || ''
    // 前置材料核验：接口返回扁平字段，需映射到 materials 嵌套结构
    form.materials = {
      feeForm: !!r.materialsFeeForm,
      permitCopy: !!r.materialsPermitCopy,
      civilAirForm: !!r.materialsCivilAirForm
    }
    // 土地用途：接口返回逗号分隔字符串，需转为数组
    if (typeof r.landUses === 'string' && r.landUses) {
      ;(form as any).landUses = r.landUses.split(',').filter(Boolean)
    } else if (Array.isArray(r.landUses)) {
      ;(form as any).landUses = r.landUses
    } else {
      ;(form as any).landUses = []
    }
    // 拆复建相关字段
    form.relatedPermitNo = r.relatedPermitNo || ''
    form.relatedProjectName = r.relatedProjectName || ''
    form.archivedResidentialArea = r.archivedResidentialArea || 0
    form.archivedNonResidentialArea = r.archivedNonResidentialArea || 0
    form.archivedCivilAirArea = r.archivedCivilAirArea || 0
    form.archivedReceivable = r.archivedReceivable || 0
    form.actualReceivable = r.actualReceivable || 0
    // 触发计算
    applyCalc(form)
  } catch (e: any) {
    ElMessage.error(e?.message || '获取详情失败')
  } finally {
    loading.value = false
  }
}

async function save(submit?: boolean) {
  // 提交审核/审批时先做表单校验
  if (submit) {
    try {
      await cf.value.validate(true)
    } catch (e: any) {
      ElMessage.warning(e.message || '请完善表单')
      return
    }
  }

  // 二次确认
  if (submit) {
    const confirmText = isEdit.value ? '确认提交审批？' : '确认提交审核？'
    try {
      await ElMessageBox.confirm(confirmText, '提示', { type: 'warning' })
    } catch {
      return
    }
  }

  saving.value = true
  try {
    const payload = buildPayload()

    if (isEdit.value) {
      // 修改模式：保存草稿 / 提交审批，都调用 update 接口，入参带 id
      const updatePayload = { ...payload, id: Number(route.query.id) }
      await updateApi(updatePayload)
      await submitApi({ applicationId: Number(route.query.id) })
      if (submit) {
        // 提交审批成功
        ElMessage.success('提交审批成功')
        router.push('/pending')
      } else {
        // 保存草稿成功
        ElMessage.success('草稿已保存')
        router.push('/pending')
      }
    } else {
      // 新建模式
      if (submit) {
        await createApi(payload)
        // 提交成功后的弹窗
        try {
          await ElMessageBox.confirm('提交成功。窗口下一家继续录件？', '提交成功', {
            confirmButtonText: '继续新建',
            cancelButtonText: '返回待处理',
            type: 'success'
          })
          Object.assign(form, emptyForm())
          window.scrollTo(0, 0)
        } catch {
          router.push('/pending')
        }
      } else {
        await draftApi(payload)
        ElMessage.success('草稿已保存')
        router.push('/pending')
      }
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadDetail()
  }
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

.form-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px 28px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}
</style>
