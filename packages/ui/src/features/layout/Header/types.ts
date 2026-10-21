import type { ReactNode } from 'react'
import type { ConnectWalletProps } from '@ui/features/connect-wallet/ConnectWalletIndicator'
import type { ChainListOption } from '@ui/features/layout/switch-chain/ChainList'
import type { QueryProp } from '@ui/features/queries/util'
import type { NetworkSwitchPolicy } from '../switch-chain/util'

export type HeaderLink = {
  href: string // this is the full pathname to the page, including leading slash, the app name and the network
  label: string
  isActive?: boolean
  target?: '_self' | '_blank'
}

export type HeaderAppLinks<TApp extends string> = Record<TApp, { label: string; href: string; pages: HeaderLink[] }>

export type HeaderProps<TApp extends string> = {
  networkSwitch: NetworkSwitchPolicy
  currentMenu: TApp
  currentNetwork: ChainListOption
  banners: ReactNode
  supportedNetworks: ChainListOption[]
  appStats?: { label: string; value: string }[]
  links: HeaderAppLinks<TApp>
  tvls: QueryProp<Record<string, number>>
  connectWalletProps: ConnectWalletProps
  pages: HeaderLink[]
  sections: { title: string; links: HeaderLink[] }[]
}
