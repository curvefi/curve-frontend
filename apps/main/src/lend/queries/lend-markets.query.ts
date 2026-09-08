import { USE_API } from '@/llamalend/queries/market/market.constants'
import type { IOneWayMarket } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { ChainParams, queryFactory, rootKeys } from '@evm-ui/lib/model/query'
import { llamaApiValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'
import { MarketVersion } from '@evm-ui/types/market'
import type { Address } from '@primitives/address.utils'

const { v1, v2 } = MarketVersion

export type LendMarketData = IOneWayMarket & { id: string }

/**
 * Extracts the necessary data from a LendMarketTemplate object so that the object can be recreated later on.
 * This is done to decouple the llamalend.js internal state with the frontend's data and allows us to recreate or
 * refresh the object with cached or backend data whenever we want.
 */
const getMarketData = ({
  id,
  name,
  version,
  addresses,
  borrowed_token,
  collateral_token,
}: LendMarketTemplate): LendMarketData => ({
  id,
  name,
  version,
  addresses,
  borrowed_token,
  collateral_token,
})

export const { useQuery: useLendMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'getLendMarkets'] as const,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- type is for documentation purposes
  queryFn: async (): Promise<Record<string | Address, LendMarketData>> => {
    const api = requireLib('llamaApi')
    await Promise.all(
      [v1, v2].map(version =>
        api.lendMarkets.fetchMarkets({ useApi: USE_API, version }).catch(e => {
          if (!(e as Error).message?.includes('not available for network')) throw e
        }),
      ),
    )
    return Object.fromEntries(
      api.lendMarkets
        .getMarketList()
        .map(name => [name, getMarketData(api.getLendMarket(name))] as const)
        .flatMap(([name, market]) => [
          [name, market],
          [market.addresses.controller as Address, market],
        ]),
    )
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
