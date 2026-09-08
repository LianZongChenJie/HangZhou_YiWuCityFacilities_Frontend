<script lang="ts" setup>
import { ElMessageBox } from 'element-plus'

import { useDesign } from '@/hooks/web/useDesign'
import { useUserStore } from '@/store/modules/user'
import ResetPwdDialog from './ResetPwdDialog.vue'

defineOptions({ name: 'UserInfo' })

const { t } = useI18n()

const { replace } = useRouter()

const userStore = useUserStore()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const avatar = computed(() => userStore.user.avatar || '')
const userName = computed(() => userStore.user.nickname ?? 'Admin')
/** 头像首字（无头像时展示） */
const avatarText = computed(() => userName.value.charAt(0).toUpperCase())

/** 重置密码弹窗 */
const resetPwdDialogRef = ref()
const openResetPwd = () => {
  resetPwdDialogRef.value?.open()
}

const loginOut = async () => {
  try {
    await ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
      confirmButtonText: t('common.ok'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    await userStore.loginOut()
    replace('/login?redirect=/pending')
  } catch {}
}
</script>

<template>
  <ElDropdown class="custom-hover" :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <ElAvatar
        :src="avatar || undefined"
        alt=""
        class="w-[calc(var(--logo-height)-25px)] rounded-[50%]"
        :style="!avatar ? { backgroundColor: '#2b2b2b', color: '#fff' } : {}"
      >
        {{ avatarText }}
      </ElAvatar>
      <span class="pl-[5px] text-14px text-[var(--top-header-text-color)] <lg:hidden">
        {{ userName }}
      </span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem @click="openResetPwd">
          <Icon icon="ep:key" />
          <div>{{ t('profile.info.resetPwd') }}</div>
        </ElDropdownItem>
        <ElDropdownItem @click="loginOut">
          <Icon icon="ep:switch-button" />
          <div>{{ t('common.loginOut') }}</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
  <!-- 重置密码弹窗 -->
  <ResetPwdDialog ref="resetPwdDialogRef" />
</template>

<style scoped lang="scss">
</style>
