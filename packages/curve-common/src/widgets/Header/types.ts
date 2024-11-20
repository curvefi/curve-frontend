import { LanguageSwitcherProps } from '../../features/switch-language'
import { ChainSwitcherProps } from '../../features/switch-chain'
import { ConnectWalletIndicatorProps } from '../../features/connect-wallet'
import { Dispatch } from 'react'
import { AppNames } from './constants'
import type { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'

export type Locale = 'en' | 'zh-Hans' | 'zh-Hant' | 'pseudo'
export type AppName = typeof AppNames[number]

export type AppPage = {
  route: string
  label: string
  isActive?: boolean
  target?: '_self' | '_blank'
  groupedTitle?: string
  minWidth?: string
}

export type NavigationSection = {
  title: string
  links: AppPage[]
}

export type BaseHeaderProps<TChainId = number> = {
  currentApp: AppName
  ChainProps: ChainSwitcherProps<TChainId>
  WalletProps: ConnectWalletIndicatorProps
  pages: AppPage[]
  sections: NavigationSection[]
  themes: [ThemeKey, Dispatch<ThemeKey>]
  appStats: { label: string, value: string }[]
  advancedMode: [boolean, Dispatch<boolean>]
  locale: Locale
  translations: {
    advanced: string
    advancedMode: string
    theme: string
    otherApps: string
    settings: string
    socialMedia: string
  }
}

export type HeaderProps<TChainId> = BaseHeaderProps<TChainId> & {
  isMdUp: boolean
}

export const APP_NAMES = {
  main: 'Curve',
  lend: 'LLAMALEND',
  crvusd: 'crvUSD'
} as const
