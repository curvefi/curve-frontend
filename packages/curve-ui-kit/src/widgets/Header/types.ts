import type { RefObject } from 'react'
import type { ChainOption } from '@ui-kit/features/switch-chain'
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

export type HeaderBaseProps<TChainId> = {
  mainNavRef: RefObject<HTMLDivElement | null>
  currentMenu: AppMenuOption
  isLite?: boolean
  globalAlertRef: RefObject<HTMLDivElement | null>
  networkId: string // ID of the network as displayed in the URL
  chainId: TChainId
  chains: ChainOption<TChainId>[]
  height: string
  sections: NavigationSection[]
  appStats?: { label: string; value: string }[]
}

export type HeaderImplementationProps<TChainId> = HeaderBaseProps<TChainId> & {
  pages: AppPage[]
}

export type HeaderProps<TChainId> = HeaderBaseProps<TChainId> & {
  routes: AppRoute[]
}
