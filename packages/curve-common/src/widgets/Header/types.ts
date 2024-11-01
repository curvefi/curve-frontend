import type { AppName, AppNavSections, AppPage } from 'ui/src/AppNav/types'
import { LanguageSwitcherProps } from '../../features/switch-language'
import { ChainSwitcherProps } from '../../features/switch-chain'
import { ConnectWalletIndicatorProps } from '../../features/connect-wallet'
import { ThemeKey } from 'curve-ui-kit/src/shared/lib'
import { Dispatch } from 'react'

export type BaseHeaderProps<TChainId> = {
  currentApp: AppName
  languages: LanguageSwitcherProps
  chains: ChainSwitcherProps<TChainId>
  wallet: ConnectWalletIndicatorProps
  pages: AppPage[]
  themes: [ThemeKey, Dispatch<ThemeKey>]
  appStats: { label: string, value: string }[]
  sections: AppNavSections
  advancedMode: [boolean, Dispatch<boolean>]
}

export type HeaderProps<TChainId> = BaseHeaderProps<TChainId> & {
  isMdUp: boolean
}

export const APP_NAMES = {
  main: 'Curve',
  lend: 'Llamalend',
  crvusd: 'crvUSD'
} as const


// TODO: Color should be in theme
export const toolbarColors = {
  light: ['#eeeceb', '#f4f3f0'],
  dark: ['#1f1f1f', '#2f2f2f'] // todo
} as const
