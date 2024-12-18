import { ChainSwitcherProps } from '../../features/switch-chain'
import { ConnectWalletIndicatorProps } from '../../features/connect-wallet'
import { Dispatch, RefObject } from 'react'
import type { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'
import { AppName } from 'curve-ui-kit/src/shared/routes'

export type Locale = 'en' | 'zh-Hans' | 'zh-Hant' | 'pseudo'

export type AppPage = {
  route: string
  label: string
  isActive?: boolean
  target?: '_self' | '_blank' // note this is only used for external routes
}

export type AppRoute = {
  route: string
  label: () => string // lazy evaluation for translations
}

export type AppRoutes = {
  root: string
  label: string
  pages: AppRoute[]
}

export type NavigationSection = {
  title: string
  links: AppPage[]
}

export type BaseHeaderProps<TChainId = number> = {
  mainNavRef: RefObject<HTMLDivElement>
  currentApp: AppName
  isLite?: boolean
  ChainProps: ChainSwitcherProps<TChainId>
  WalletProps: ConnectWalletIndicatorProps
  pages: AppPage[]
  sections: NavigationSection[]
  themes: [ThemeKey, Dispatch<ThemeKey>]
  appStats?: { label: string; value: string }[]
  advancedMode?: [boolean, Dispatch<boolean>]
  locale: Locale
  networkName: string
}

export type HeaderProps<TChainId> = BaseHeaderProps<TChainId> & {
  isMdUp: boolean
}

export const APP_NAMES = {
  main: 'Curve',
  lend: 'LLAMALEND',
  crvusd: 'crvUSD',
  dao: 'DAO',
} as const
