import { requireLib } from 'curve-ui-kit/src/features/connect-wallet'
import { ChainParams, queryFactory, rootKeys } from 'curve-ui-kit/src/lib/model/query'
import { llamaApiValidationSuite } from 'curve-ui-kit/src/lib/model/query/curve-api-validation'
import { USE_API } from '@/llamalend/queries/market/market.constants'
import type { ILlamma } from '@curvefi/llamalend-api/lib/interfaces'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Address } from '@primitives/address.utils'

type MintMarketData = ILlamma & { id: string }

/**
 * Extracts the necessary data from a MintMarketTemplate object so that the object can be recreated later on.
 * This is done to decouple the llamalend.js internal state with the frontend's data and allows us to recreate or
 * refresh the object with cached or backend data whenever we want.
 */
const getMarketData = ({
  id,
  address,
  controller,
  monetaryPolicy,
  collateral,
  leverageZap,
  deleverageZap,
  healthCalculator,
  collateralSymbol,
  collateralDecimals,
  minBands,
  maxBands,
  defaultBands,
  A,
  isDeleverageSupported,
  index,
}: MintMarketTemplate): MintMarketData => ({
  id,
  amm_address: address,
  controller_address: controller,
  monetary_policy_address: monetaryPolicy,
  collateral_address: collateral,
  leverage_zap: leverageZap,
  deleverage_zap: deleverageZap,
  health_calculator_zap: healthCalculator,
  collateral_symbol: collateralSymbol,
  collateral_decimals: collateralDecimals,
  min_bands: minBands,
  max_bands: maxBands,
  default_bands: defaultBands,
  A,
  is_deleverage_supported: isDeleverageSupported,
  index,
})

export const { useQuery: useMintMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'getMintMarkets'] as const,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  queryFn: async (): Promise<Record<string | Address, MintMarketData>> => {
    const api = requireLib('llamaApi')
    await api.mintMarkets.fetchMintMarkets({ useApi: USE_API })
    return Object.fromEntries(
      api.mintMarkets
        .getMarketList()
        .map(name => [name, getMarketData(api.getMintMarket(name))] as const)
        .flatMap(([name, market]) => [
          [name, market],

          [market.controller_address as Address, market],
        ]),
    )
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
