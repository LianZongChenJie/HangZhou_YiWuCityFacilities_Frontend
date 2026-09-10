<script lang="ts" setup>
import * as NotifyMessageApi from '@/api/system/notify/message'
import { useRouter } from 'vue-router'
import { useUserStoreWithOut } from '@/store/modules/user'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'Message' })

defineProps({
  color: propTypes.string.def('')
})

const router = useRouter()
const userStore = useUserStoreWithOut()
const unreadCount = ref(0) // 未读消息数量
let unreadCountTimer: ReturnType<typeof setInterval> | undefined

/** 跳转到待处理页 */
const goToPending = () => {
  router.push('/pending')
}

// 获得未读消息数（接口返回对象，累加所有值）
const getUnreadCount = async () => {
  NotifyMessageApi.getUnreadNotifyMessageCount().then((data) => {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      unreadCount.value = (Object.values(data) as number[]).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
      )
    } else {
      unreadCount.value = Number(data) || 0
    }
  })
}

// ========== 初始化 =========
onMounted(() => {
  // 首次加载小红点
  getUnreadCount()
  // 轮询刷新小红点
  unreadCountTimer = setInterval(
    () => {
      if (userStore.getIsSetUser) {
        getUnreadCount()
      } else {
        unreadCount.value = 0
      }
    },
    1000 * 60 * 2
  )
})

onBeforeUnmount(() => {
  if (unreadCountTimer) {
    clearInterval(unreadCountTimer)
    unreadCountTimer = undefined
  }
})
</script>
<template>
  <div class="message" @click="goToPending">
    <Icon :size="18" class="cursor-pointer" icon="ep:bell" :color="color" />
    <ElBadge :value="unreadCount" :max="99" class="message-badge" />
  </div>
</template>
<style lang="scss" scoped>
// 铃铛对齐修复：
// DOM 链路 div.message > Icon + ElBadge
// 让 .message 变 flex-center 容器，Icon 和 Badge 水平排列
.message {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;

  .message-badge {
    display: flex;
    margin-left: 4px;

    :deep(.el-badge__content) {
      font-size: 12px;
    }
  }
}
</style>
