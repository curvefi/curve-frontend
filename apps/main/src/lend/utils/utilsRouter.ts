import { ROUTE } from '@/lend/constants'
import { networksIdMapper } from '@/lend/networks'
import { type MarketUrlParams, NetworkUrlParams, type UrlParams } from '@/lend/types/lend.types'
import { getInternalUrl, LendMarketRoute, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  getInternalUrl('llamalend', network, LLAMALEND_ROUTES.PAGE_MARKETS)

const getMarketPathname = ({ network }: UrlParams, marketId: string, page: LendMarketRoute) =>
  `${getInternalUrl('lend', network, ROUTE.PAGE_MARKETS)}/${marketId}${page}`

export const getLoanPathname = (params: UrlParams, marketId: string) =>
  getMarketPathname(params, marketId, ROUTE.PAGE_LOAN)

export const parseMarketParams = ({ market, network }: MarketUrlParams) => ({
  rMarket: market.toLowerCase(),
  rChainId: networksIdMapper[network],
})
