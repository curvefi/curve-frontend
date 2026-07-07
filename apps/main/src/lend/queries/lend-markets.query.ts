import { requireLib } from 'curve-ui-kit/src/features/connect-wallet'
import { ChainParams, queryFactory, rootKeys } from 'curve-ui-kit/src/lib/model/query'
import { llamaApiValidationSuite } from 'curve-ui-kit/src/lib/model/query/curve-api-validation'
import { USE_API } from '@/llamalend/queries/market/market.constants'
import type { IOneWayMarket } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Address } from '@primitives/address.utils'
import { LlamaMarketVersion } from '@ui-kit/types/market'

const { v1, v2 } = LlamaMarketVersion

type LendMarketData = IOneWayMarket & { id: string }

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
