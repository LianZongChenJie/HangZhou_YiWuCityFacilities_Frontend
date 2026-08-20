<template>
  <el-form
    ref="formLogin"
    :model="loginData.loginForm"
    :rules="LoginRules"
    label-width="72px"
    @submit.prevent="getCode()"
  >
    <!-- <el-form-item v-if="loginData.tenantEnable === 'true'" :label="t('login.tenantname')" prop="tenantName">
      <el-input
        v-model="loginData.loginForm.tenantName"
        :placeholder="t('login.tenantNamePlaceholder')"
      />
    </el-form-item> -->
    <el-form-item :label="t('login.username')" prop="username">
      <el-input
        v-model="loginData.loginForm.username"
        :placeholder="t('login.usernamePlaceholder')"
      />
    </el-form-item>
    <el-form-item :label="t('login.password')" prop="password">
      <el-input
        v-model="loginData.loginForm.password"
        type="password"
        show-password
        :placeholder="t('login.passwordPlaceholder')"
        @keyup.enter="getCode()"
      />
    </el-form-item>
    <el-form-item>
      <el-checkbox v-model="loginData.loginForm.rememberMe">
        {{ t('login.remember') }}
      </el-checkbox>
    </el-form-item>
    <el-button
      type="primary"
      :loading="loginLoading"
      style="width: 100%; margin-bottom: 12px"
      @click="getCode()"
    >
      {{ t('login.login') }}
    </el-button>
    <Verify
      v-if="loginData.captchaEnable === 'true'"
      ref="verify"
      :captchaType="captchaType"
      :imgSize="{ width: '400px', height: '200px' }"
      mode="pop"
      @success="handleLogin"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { ElLoading } from 'element-plus'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'
import { useFormValid } from './useLogin'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()
const formLogin = ref()
const { validForm } = useFormValid(formLogin)
const { currentRoute, push } = useRouter()
const permissionStore = usePermissionStore()
const redirect = ref<string>('')
const loginLoading = ref(false)
const verify = ref()
const captchaType = ref('blockPuzzle')

const LoginRules = {
  tenantName: [required],
  username: [required],
  password: [required]
}

const loginData = reactive({
  isShowPassword: false,
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
    username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
    password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
    captchaVerification: '',
    rememberMe: true
  }
})

// 获取验证码
const getCode = async () => {
  if (loginData.captchaEnable === 'false') {
    await handleLogin({})
  } else {
    verify.value.show()
  }
}

// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
    authUtil.setTenantId(res)
  }
}

// 记住我
const getLoginFormCache = () => {
  const loginForm = authUtil.getLoginForm()
  if (loginForm) {
    loginData.loginForm = {
      ...loginData.loginForm,
      username: loginForm.username ? loginForm.username : loginData.loginForm.username,
      password: loginForm.password ? loginForm.password : loginData.loginForm.password,
      rememberMe: loginForm.rememberMe,
      tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
    }
  }
}

// 根据域名，获得租户信息
const getTenantByWebsite = async () => {
  if (loginData.tenantEnable === 'true') {
    const website = location.host
    const res = await LoginApi.getTenantByWebsite(website)
    if (res) {
      loginData.loginForm.tenantName = res.name
      authUtil.setTenantId(res.id)
    }
  }
}

const loading = ref() // ElLoading.service 返回的实例

// 登录
const handleLogin = async (params: any) => {
  loginLoading.value = true
  try {
    await getTenantId()
    const data = await validForm()
    if (!data) {
      return
    }
    const loginDataLoginForm = { ...loginData.loginForm }
    loginDataLoginForm.captchaVerification = params.captchaVerification
    const res = await LoginApi.login(loginDataLoginForm)
    if (!res) {
      return
    }
    loading.value = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    if (loginDataLoginForm.rememberMe) {
      authUtil.setLoginForm(loginDataLoginForm)
    } else {
      authUtil.removeLoginForm()
    }
    authUtil.setToken(res)
    if (!redirect.value) {
      redirect.value = '/'
    }
    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      await push({ path: redirect.value || permissionStore.addRouters[0].path })
    }
  } finally {
    loginLoading.value = false
    loading.value?.close()
  }
}

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

onMounted(() => {
  getLoginFormCache()
  getTenantByWebsite()
})
</script>
