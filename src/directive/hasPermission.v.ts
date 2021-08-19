import { useUserStore } from '@/store/modules/user.store'
import { Directive } from 'vue'

export const hasPermi: Directive = {
  mounted(el, binding) {
    const store = useUserStore()
    const { value } = binding
    const allPermission = '*:*:*'
    const permissions = store.permissions

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value
      const hasPermissions = permissions.some((permission) => {
        return allPermission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('请设置操作权限标签值')
    }
  },
}
