import type { ReactNode } from 'react'
import type { ConnectWalletProps } from '@evm-ui/features/connect-wallet/ui/ConnectWalletIndicator'
import type { ChainListOption } from '@evm-ui/features/switch-chain/ui/ChainList'
import type { PartialRecord } from '@primitives/objects.utils'
import type { QueryProp } from '@ui/features/queries/util'

export type HeaderLink = {
  href: string // this is the full pathname to the page, including leading slash, the app name and the network
  label: string
  isActive?: boolean
  target?: '_self' | '_blank'
}

export type HeaderAppLinks<TApp extends string> = Record<TApp, { label: string; href: string; pages: HeaderLink[] }>

export type HeaderProps<TApp extends string, TId extends string, TChainId extends number> = {
  currentMenu: TApp
  currentNetwork: ChainListOption<TId, TChainId>
  banners: ReactNode
  supportedNetworks: ChainListOption<TId, TChainId>[]
  appStats?: { label: string; value: string }[]
  links: HeaderAppLinks<TApp>
  hideChains: PartialRecord<TApp, number[]>
  tvls: QueryProp<Record<string, number>>
  connectWalletProps: ConnectWalletProps
  pages: HeaderLink[]
  sections: { title: string; links: HeaderLink[] }[]
}
