<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

import { InputPassword } from '@/components/InputPassword'
import { updateUserPassword } from '@/api/system/user/profile'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'ResetPwdDialog' })

const { t } = useI18n()
const message = useMessage()
const { replace } = useRouter()
const userStore = useUserStore()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const password = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

/** 两次密码一致性校验 */
const equalToPassword = (_rule, value) => {
  if (password.newPassword !== value) {
    return Promise.reject(new Error(t('profile.password.diffPwd')))
  }
  return Promise.resolve()
}

const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: t('profile.password.oldPwdMsg'), trigger: 'blur' },
    { min: 4, max: 16, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('profile.password.newPwdMsg'), trigger: 'blur' },
    { min: 4, max: 16, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('profile.password.cfPwdMsg'), trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

const open = () => {
  resetForm()
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
}

const resetForm = () => {
  password.oldPassword = ''
  password.newPassword = ''
  password.confirmPassword = ''
  formRef.value?.resetFields()
}

const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      await updateUserPassword(password.oldPassword, password.newPassword)
      message.success('密码修改成功，请重新登录')
      close()
      // 退出登录并跳转登录页
      await userStore.loginOut()
      replace('/login?redirect=/pending')
    } finally {
      submitLoading.value = false
    }
  })
}

defineExpose({ open })
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="t('profile.info.resetPwd')"
    width="450px"
    append-to-body
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="password" :rules="rules" label-width="100px">
      <el-form-item :label="t('profile.password.oldPassword')" prop="oldPassword">
        <InputPassword v-model="password.oldPassword" />
      </el-form-item>
      <el-form-item :label="t('profile.password.newPassword')" prop="newPassword">
        <InputPassword v-model="password.newPassword" strength />
      </el-form-item>
      <el-form-item :label="t('profile.password.confirmPassword')" prop="confirmPassword">
        <InputPassword v-model="password.confirmPassword" strength />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submit">
        {{ t('common.save') }}
      </el-button>
    </template>
  </ElDialog>
</template>
