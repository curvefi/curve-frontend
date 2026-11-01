import { networksIdMapper } from '@/lend/networks'
import { type MarketUrlParams, NetworkUrlParams } from '@/lend/types/lend.types'
import { llamalendRoutes } from '@evm-ui/shared/routes'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  llamalendRoutes.markets({ blockchainId: network })

export const parseMarketParams = ({ market, network }: MarketUrlParams) => ({
  rMarket: market.toLowerCase(),
  chainId: networksIdMapper[network],
})
