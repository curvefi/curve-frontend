import { requireLib } from 'curve-ui-kit/src/features/connect-wallet'
import { ChainParams, type ChainQuery, queryFactory, rootKeys } from 'curve-ui-kit/src/lib/model/query'
import { llamaApiValidationSuite } from 'curve-ui-kit/src/lib/model/query/curve-api-validation'
import { Chain } from 'curve-ui-kit/src/utils'
import { USE_API } from '@/llamalend/queries/market/market.constants'
import type { IOneWayMarket } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { notFalsy } from '@curvefi/primitives/objects.utils'
import type { Address } from '@primitives/address.utils'

const V1 = 'v1' as const
const V2 = 'v2' as const

const v2chains = [Chain.Optimism]

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
  queryKey: ({ chainId, enableLLv2 }: ChainParams & { enableLLv2: boolean }) =>
    [...rootKeys.chain({ chainId }), 'getLendMarkets', { enableLLv2 }] as const,
  queryFn: async ({
    chainId,
    enableLLv2,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  }: ChainQuery & { enableLLv2: boolean }): Promise<Record<string | Address, LendMarketData>> => {
    const api = requireLib('llamaApi')
    await Promise.all(
      notFalsy(V1, enableLLv2 && v2chains.includes(chainId) && V2).map(version =>
        api.lendMarkets.fetchMarkets({ useApi: USE_API, version }),
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
