import { networksIdMapper } from '@/lend/networks'
import { type MarketUrlParams, NetworkUrlParams } from '@/lend/types/lend.types'
import { LLAMALEND_ROUTES } from '@evm-ui/shared/routes'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  LLAMALEND_ROUTES.PAGE_MARKETS({ app: 'llamalend', blockchainId: network })

export const parseMarketParams = ({ market, network }: MarketUrlParams) => ({
  rMarket: market.toLowerCase(),
  chainId: networksIdMapper[network],
})
