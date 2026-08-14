<template>
  <div class="login-page">
    <div class="panel">
      <h1>义乌市建设局</h1>
      <p class="sub">城市基础设施配套费征收审批系统（原型）</p>
      <el-form :model="form" @submit.prevent="onLogin" label-width="72px">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="accept01 / review01 / issue01 / close01 / admin01" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="123456" @keyup.enter="onLogin" />
        </el-form-item>
        <el-button type="primary" style="width:100%;margin-bottom:12px;" @click="onLogin">登 录</el-button>
      </el-form>
      <div class="quick">
        <div class="hint">演示快捷入口（密码均为 123456）</div>
        <el-button v-for="r in roles" :key="r.key" @click="quick(r.key)">{{ r.name }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { mockRoles } from '@/mock/users'

const router = useRouter()
const user = useUserStore()
const roles = mockRoles
const form = reactive({ username: 'accept01', password: '123456' })

function onLogin() {
  const res = user.login({ username: form.username, password: form.password })
  if (!res.ok) return ElMessage.error(res.message)
  router.push(res.path)
}
function quick(role) {
  const res = user.login({ role })
  if (!res.ok) return ElMessage.error(res.message)
  router.push(res.path)
}
</script>

<style scoped>
.login-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2d3d, #304156 50%, #1e3a5f);
}
.panel {
  width: 420px;
  background: #fff;
  padding: 36px 36px 28px;
  border-radius: 6px;
  box-shadow: 0 12px 40px rgba(0,0,0,.25);
}
h1 { margin: 0; text-align: center; font-size: 22px; }
.sub { text-align: center; color: #909399; margin: 8px 0 24px; font-size: 13px; }
.quick { border-top: 1px dashed #ebeef5; padding-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
.hint { width: 100%; font-size: 12px; color: #909399; margin-bottom: 4px; }
</style>
