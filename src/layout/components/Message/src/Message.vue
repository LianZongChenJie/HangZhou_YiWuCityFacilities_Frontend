<script lang="ts" setup>
import * as NotifyMessageApi from '@/api/system/notify/message'
import { useUserStoreWithOut } from '@/store/modules/user'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'Message' })

defineProps({
  color: propTypes.string.def('')
})

const userStore = useUserStoreWithOut()
const unreadCount = ref(0) // 未读消息数量
let unreadCountTimer: ReturnType<typeof setInterval> | undefined

// 获得未读消息数
const getUnreadCount = async () => {
  NotifyMessageApi.getUnreadNotifyMessageCount().then((data) => {
    unreadCount.value = data
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
  <div class="message">
    <Icon :size="18" class="cursor-pointer" icon="ep:bell" :color="color" />
    <ElBadge
      v-if="unreadCount > 0"
      :value="unreadCount"
      :max="99"
      class="message-badge"
    />
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
    margin-left: 4px;

    :deep(.el-badge__content) {
      font-size: 12px;
    }
  }
}
</style>
