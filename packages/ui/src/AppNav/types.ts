import type { AppLogoProps } from 'ui/src/Brand/AppLogo'
import type { ConnectState } from 'onboard-helpers'
import type { ThemeType } from 'ui/src/Select/SelectThemes'

import React from 'react'

export type PageWidth =
  | 'page-wide'
  | 'page-large'
  | 'page-medium'
  | 'page-small'
  | 'page-small-x'
  | 'page-small-xx'
  | null

export type Locale = 'en' | 'zh-Hans' | 'zh-Hant' | 'pseudo'

export type AppNavAdvancedMode = {
  isAdvanceMode: boolean
  handleClick(): void
}

export type AppNavConnect = {
  connectState: ConnectState
  walletSignerAddress: string
  handleClick: () => void
}

export type AppNavLocale = {
  locale: Locale
  locales: { name: string; value: Locale; lang: string }[]
  handleChange: (selectedLocale: React.Key) => void
}

export type AppPage = {
  route: string
  label: string
  isActive?: boolean
  target?: '_self' | '_blank'
  isDivider?: boolean
  groupedTitle?: string
  minWidth?: string
}

export type AppNavPages = {
  pages: AppPage[]
  getPath: (route: string) => string
  handleClick: (route: string) => void
}

export type AppNavSections = {
  id: string
  title: string
  links?: AppPage[]
  comp?: React.ReactNode
}[]

export type AppNavStats = { label: string; value: string }[]

export type AppNavTheme = {
  themeType: ThemeType
  handleClick: (themeType: ThemeType) => void
}

export type AppNavMobileProps = {
  appLogoProps: AppLogoProps
  connect: AppNavConnect
  advancedMode?: AppNavAdvancedMode
  locale?: AppNavLocale
  pageWidth: PageWidth
  pages: AppNavPages
  sections: AppNavSections
  selectNetwork: React.ReactNode
  stats: AppNavStats
  theme: AppNavTheme
}

export type AppNavSecondaryProps = {
  advancedMode?: AppNavAdvancedMode
  appsLinks: AppPage[]
  appStats: AppNavStats
  locale?: AppNavLocale
  theme: AppNavTheme
}
