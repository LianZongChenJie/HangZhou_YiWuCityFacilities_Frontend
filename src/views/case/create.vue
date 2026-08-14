<template>
  <div class="app-container">
    <h3 class="page-title">新建办件</h3>
    <CaseForm ref="cf" v-model="form" />
    <div class="sticky-actions">
      <el-button @click="$router.back()">取消</el-button>
      <el-button @click="save(false)">保存草稿</el-button>
      <el-button type="primary" @click="save(true)">提交审核</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CaseForm from './CaseForm.vue'
import { emptyForm } from '@/utils/calc'
import { useCaseStore } from '@/stores/cases'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cases = useCaseStore()
const user = useUserStore()
const cf = ref()
const form = reactive(emptyForm())

async function save(submit) {
  try {
    if (submit) await cf.value.validate(true)
  } catch (e) {
    ElMessage.warning(e.message || '请完善表单')
    return
  }
  if (submit) {
    await ElMessageBox.confirm('确认提交审核？', '提示', { type: 'warning' })
  }
  cases.create(form, user.user, { submit })
  if (submit) {
    ElMessageBox.confirm('提交成功。窗口下一家继续录件？', '提交成功', {
      confirmButtonText: '继续新建',
      cancelButtonText: '返回工作台',
      type: 'success'
    })
      .then(() => {
        Object.assign(form, emptyForm())
      })
      .catch(() => router.push('/workbench'))
  } else {
    ElMessage.success('草稿已保存')
    router.push('/case/query')
  }
}
</script>
