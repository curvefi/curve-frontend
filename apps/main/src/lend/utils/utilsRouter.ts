import { type LendMarketRoute, ROUTE } from '@/lend/constants'
import { networksIdMapper } from '@/lend/networks'
import { type MarketUrlParams, NetworkUrlParams, type UrlParams } from '@/lend/types/lend.types'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'

/** Get the path for the given route in this app */
export const getPath = ({ network }: UrlParams, route: string) => getInternalUrl('lend', network, route)

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  getInternalUrl('llamalend', network, LLAMALEND_ROUTES.PAGE_MARKETS)

const getMarketPathname = ({ network }: UrlParams, marketId: string, page: LendMarketRoute) =>
  `${getInternalUrl('lend', network, ROUTE.PAGE_MARKETS)}/${marketId}${page}`

export const getLoanPathname = (params: UrlParams, marketId: string) =>
  getMarketPathname(params, marketId, ROUTE.PAGE_LOAN)

export const getVaultPathname = (params: UrlParams, marketId: string) =>
  getMarketPathname(params, marketId, ROUTE.PAGE_VAULT)

export const parseMarketParams = ({ market, network }: MarketUrlParams) => ({
  rMarket: market.toLowerCase(),
  rChainId: networksIdMapper[network],
})
