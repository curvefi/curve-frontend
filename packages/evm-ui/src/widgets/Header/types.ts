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

export type AppRoute<T extends string> = {
  app: T
  route: string // this is a route inside the app, with leading slash, does not include the app name and the network
  label: () => string // lazy evaluation for translations
  target?: '_self' | '_blank'
  matchMode?: 'prefix' | 'exact' // some pages have "../marketId" and "../marketId/vault" as routes, so we need to match the exact route
}

export type AppRoutes<TApp extends string> = {
  label: string
  routes: AppRoute<TApp>[]
}

export type NavigationSection = {
  title: string
  links: AppPage[]
}

type HeaderBaseProps<TApp extends string, TMenuApp extends TApp, TId extends string, TChainId extends number> = {
  currentMenu: TMenuApp
  currentNetwork: ChainListOption<TId, TChainId>
  backendMaintenance: Maintenance
  supportedNetworks: ChainListOption<TId, TChainId>[]
  appStats?: { label: string; value: string }[]
  links: AppLinks<TApp, TMenuApp>
  urlFactory: (app: TApp, blockchainId: string, route?: string) => string
  hideChains: PartialRecord<TMenuApp, number[]>
  tvls: QueryProp<Record<string, number>>
  connectWalletProps: ConnectWalletProps
}

export type HeaderImplementationProps<
  TApp extends string,
  TMenuApp extends TApp,
  TId extends string,
  TChainId extends number,
> = HeaderBaseProps<TApp, TMenuApp, TId, TChainId> & {
  pages: AppPage[]
  sections: NavigationSection[]
}

export type HeaderProps<
  TApp extends string,
  TMenuApp extends TApp,
  TId extends string,
  TChainId extends number,
> = HeaderBaseProps<TApp, TMenuApp, TId, TChainId> & {
  currentApp: TApp
  routes: Record<TMenuApp, AppRoute<TApp>[]>
}

export type AppLinks<TApp extends string, TMenuApp extends TApp> = Record<TMenuApp, AppRoutes<TApp>>
