import type { RefObject } from 'react'
import type { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import type { ConnectWalletIndicatorProps } from '@ui-kit/features/connect-wallet'
import type { ChainSwitcherProps } from '@ui-kit/features/switch-chain'
import type { AppMenuOption, AppName } from '@ui-kit/shared/routes'

export type AppPage = {
  route: string // this is the full pathname to the page, including leading slash, the app name and the network
  label: string
  isActive?: boolean
  target?: '_self' | '_blank' // note this is only used for external routes
}

export type AppRoute = {
  app: AppName
  route: string // this is a route inside the app, with leading slash, does not include the app name and the network
  label: () => string // lazy evaluation for translations
  target?: '_self' | '_blank' // note this is only used for external routes
}

export type AppRoutes = {
  label: string
  pages: AppRoute[]
}

export type NavigationSection = {
  title: string
  links: AppPage[]
}

export type BaseHeaderProps<TChainId = number> = {
  mainNavRef: RefObject<HTMLDivElement | null>
  currentMenu: AppMenuOption
  isLite?: boolean
  ChainProps: Omit<ChainSwitcherProps<TChainId>, 'headerHeight'>
  WalletProps: ConnectWalletIndicatorProps
  BannerProps: GlobalBannerProps
  height: string
  pages: AppRoute[]
  sections: NavigationSection[]
  appStats?: { label: string; value: string }[]
  networkName: string
}

export type HeaderProps<TChainId> = BaseHeaderProps<TChainId> & {
  isMdUp: boolean
}
