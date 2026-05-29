import type { NetworkMapping } from '@ui/utils'
import type { Maintenance } from '@ui-kit/features/maintenance/hooks/useMaintenance'
import type { AppMenuOption, AppName } from '@ui-kit/shared/routes'

export interface AppPage {
  href: string // this is the full pathname to the page, including leading slash, the app name and the network
  label: string
  isActive?: boolean
  target?: '_self' | '_blank'
}

export interface AppRoute {
  app: AppName
  route: string // this is a route inside the app, with leading slash, does not include the app name and the network
  label: () => string // lazy evaluation for translations
  target?: '_self' | '_blank'
  matchMode?: 'prefix' | 'exact' // some pages have "../marketId" and "../marketId/vault" as routes, so we need to match the exact route
}

export interface AppRoutes {
  label: string
  routes: AppRoute[]
}

export interface NavigationSection {
  title: string
  links: AppPage[]
}

export interface HeaderBaseProps {
  currentMenu: AppMenuOption
  isLite: boolean | undefined
  networkId: string // ID of the network as displayed in the URL
  chainId: number
  backendMaintenance: Maintenance
  supportedNetworks: NetworkMapping
  appStats?: { label: string; value: string }[]
}

export type HeaderImplementationProps = HeaderBaseProps & {
  pages: AppPage[]
  sections: NavigationSection[]
}

export type HeaderProps = HeaderBaseProps & {
  currentApp: AppName
  routes: Record<AppMenuOption, AppRoute[]>
}
