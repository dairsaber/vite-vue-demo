import { antIconNames } from '@/setup/antd'
import { Component, h, computed, ref, watch, Ref } from 'vue'
import BaseIcon from '@/components/base-icon/BaseIcon.vue'

import { SubMenu, MenuItem } from 'ant-design-vue'
import { BarsOutlined } from '@ant-design/icons-vue'
import { MenuRoute, usePermissionStore } from '@/store/modules/permission.store'

type MenuConfig = {
  components: Component[]
  routeMap: Recordable<MenuRoute>
}
type SubMenuConfig = {
  component: Component
  routeMap: Recordable<MenuRoute>
}

export const useMenu = (): Ref<MenuConfig> => {
  const menuStore = usePermissionStore()

  // 将静态路由/下的menu展平在menu中
  const menus = computed((): MenuRoute[] => {
    let routes = [...menuStore.routes]
    const mainRoute = routes.find((route) => route.path === '')
    if (mainRoute) {
      const index = routes.indexOf(mainRoute)
      routes.splice(index, 1)
      routes = [...(mainRoute.children ?? []), ...routes]
    }
    return routes
  })

  const menuConfig = ref<MenuConfig>({ components: [], routeMap: {} })
  // 导出routeMap的原因是 在外面当做字典
  const generateMenu = (menus: MenuRoute[]): MenuConfig => {
    const menuComponents: Component[] = []
    const routeMap: Recordable<MenuRoute> = {}

    menus.forEach((menu) => {
      const { hidden, children } = menu

      if (hidden) return

      if (children && children.length > 0) {
        const { component, routeMap: rm } = generateSubMenu(menu)
        menuComponents.push(component)
        Object.assign(routeMap, rm)
      } else {
        const { component, routeMap: rm } = generateMenuItem(menu)
        menuComponents.push(component)
        Object.assign(routeMap, rm)
      }
    })
    return { components: menuComponents, routeMap }
  }

  const generateSubMenu = (menu: MenuRoute): SubMenuConfig => {
    const { meta, children, fullPath } = menu

    const currentPath = fullPath

    const { title = '未设置', icon } = meta ?? {}

    const { components, routeMap: rm } = generateMenu(children!)
    const iconComponent = getIconComponent(icon)
    const slots: Recordable<() => Component | null> = { icon: () => iconComponent }
    const component = (
      <SubMenu key={currentPath} title={title} v-slots={slots}>
        {components}
      </SubMenu>
    )

    return { component, routeMap: { [currentPath]: menu, ...rm } }
  }

  const generateMenuItem = (menu: MenuRoute): SubMenuConfig => {
    const { meta, fullPath } = menu
    const { title = '未设置', icon } = meta ?? {}
    const iconComponent = getIconComponent(icon)
    const slots: Recordable<() => Component | null> = { icon: () => iconComponent }

    const currentPath = fullPath
    const component = (
      <MenuItem key={currentPath} v-slots={slots}>
        {title}
      </MenuItem>
    )

    return { component, routeMap: { [currentPath]: menu } }
  }

  const getIconComponent = (icon?: string): Component | null => {
    const iconComponent: Component = h(BarsOutlined)
    // 处理图标
    if (icon) {
      const isSvg = icon.startsWith('svg-')
      if (isSvg || antIconNames.includes(icon)) {
        const iconName = icon.replace(/^(svg-)/, '')
        return <BaseIcon icon={iconName} />
      }
    }

    return iconComponent
  }

  watch(
    () => menuStore.routes,
    () => {
      menuConfig.value = generateMenu(menus.value)
    },
    { immediate: true }
  )

  return menuConfig
}
