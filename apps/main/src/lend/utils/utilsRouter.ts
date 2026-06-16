import { networksIdMapper } from '@/lend/networks'
import { type MarketUrlParams, NetworkUrlParams } from '@/lend/types/lend.types'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  getInternalUrl('llamalend', network, LLAMALEND_ROUTES.PAGE_MARKETS)

export const parseMarketParams = ({ market, network }: MarketUrlParams) => ({
  rMarket: market.toLowerCase(),
  rChainId: networksIdMapper[network],
})
