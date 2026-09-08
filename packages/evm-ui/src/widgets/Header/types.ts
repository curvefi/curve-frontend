import type { ConnectWalletProps } from '@evm-ui/features/connect-wallet/ui/ConnectWalletIndicator'
import type { Maintenance } from '@evm-ui/features/maintenance/hooks/useMaintenance'
import type { ChainListOption } from '@evm-ui/features/switch-chain/ui/ChainList'
import type { PartialRecord } from '@primitives/objects.utils'
import type { QueryProp } from '@ui/features/queries/util'

export type AppPage = {
  href: string // this is the full pathname to the page, including leading slash, the app name and the network
  label: string
  isActive?: boolean
  target?: '_self' | '_blank'
}

export type AppLinks<TMenuApp extends string> = Record<TMenuApp, { label: string; href: string; pages: AppPage[] }>

export type NavigationSection = { title: string; links: AppPage[] }

export type HeaderProps<TApp extends string, TId extends string, TChainId extends number> = {
  currentMenu: TApp
  currentNetwork: ChainListOption<TId, TChainId>
  backendMaintenance: Maintenance
  supportedNetworks: ChainListOption<TId, TChainId>[]
  appStats?: { label: string; value: string }[]
  links: AppLinks<TApp>
  hideChains: PartialRecord<TApp, number[]>
  tvls: QueryProp<Record<string, number>>
  connectWalletProps: ConnectWalletProps
} & { pages: AppPage[]; sections: NavigationSection[] }
