import type { RefObject } from 'react'
import type { NetworkMapping } from '@ui/utils'
import type { AppMenuOption, AppName } from '@ui-kit/shared/routes'

export type AppPage = {
  href: string // this is the full pathname to the page, including leading slash, the app name and the network
  label: string
  isActive?: boolean
  target?: '_self' | '_blank'
}

export type AppRoute = {
  app: AppName
  route: string // this is a route inside the app, with leading slash, does not include the app name and the network
  label: () => string // lazy evaluation for translations
  target?: '_self' | '_blank'
  betaFeature?: boolean
}

export type AppRoutes = {
  label: string
  routes: AppRoute[]
}

export type NavigationSection = {
  title: string
  links: AppPage[]
}

export type HeaderBaseProps = {
  mainNavRef: RefObject<HTMLDivElement | null>
  currentMenu: AppMenuOption
  isLite: boolean | undefined
  globalAlertRef: RefObject<HTMLDivElement | null>
  networkId: string // ID of the network as displayed in the URL
  chainId: number
  networks: NetworkMapping
  appStats?: { label: string; value: string }[]
}

export type HeaderImplementationProps = HeaderBaseProps & {
  pages: AppPage[]
  sections: NavigationSection[]
  height: string
}

export type HeaderProps = HeaderBaseProps & {
  currentApp: AppName
  routes: Record<AppMenuOption, AppRoute[]>
}
