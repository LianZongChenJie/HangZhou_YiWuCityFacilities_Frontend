import type { App } from 'vue'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { t } = useI18n() // 国际化

/** 判断权限的指令 directive */
export function hasPermi(app: App<Element>) {
  app.directive('hasPermi', (el, binding) => {
    const { value } = binding

    if (value && value instanceof Array && value.length > 0) {
      const hasPermissions = hasPermission(value)

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(t('permission.hasPermission'))
    }
  })
}

/** 判断权限的方法 function */
const all_permission = '*:*:*'
export const hasPermission = (permission: string[]) => {
  const { wsCache } = useCache()
  const userInfo = wsCache.get(CACHE_KEY.USER)
  const permissions = userInfo?.permissions || []

  return (
    permissions.includes(all_permission) ||
    permission.some((item) => permissions.includes(item))
  )
}
