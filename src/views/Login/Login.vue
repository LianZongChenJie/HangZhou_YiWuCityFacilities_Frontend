<template>
  <div class="login-page">
    <div class="panel">
      <h1>{{ underlineToHump(appStore.getTitle) }}</h1>
      <p class="sub">{{ t('login.message') }}</p>
      <LoginForm />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { underlineToHump } from '@/utils'
import { useAppStore } from '@/store/modules/app'
import { LoginForm } from './components'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2d3d, #304156 50%, #1e3a5f);

  .panel {
    width: 420px;
    max-width: calc(100% - 40px);
    background: #fff;
    padding: 36px 36px 28px;
    border-radius: 6px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);

    h1 {
      margin: 0;
      text-align: center;
      font-size: 22px;
    }

    .sub {
      text-align: center;
      color: #909399;
      margin: 8px 0 24px;
      font-size: 13px;
    }
  }
}
</style>
