import { USE_API } from '@/llamalend/queries/market/market.constants'
import type { ILlamma, IOneWayMarket } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { type ChainParams, rootKeys } from '@evm-ui/queries/root-keys'
import { llamaApiValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { MarketVersion } from '@evm-ui/types/market'
import type { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui/features/queries/factory'

type MintMarketData = ILlamma & { id: string }
type LendMarketData = IOneWayMarket & { id: string }

const mintMarketData = ({
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

const lendMarketData = ({
  id,
  name,
  version,
  addresses,
  borrowed_token,
  collateral_token,
}: LendMarketTemplate): LendMarketData => ({ id, name, version, addresses, borrowed_token, collateral_token })

/** Same cache key as the mint market page catalog, so the list does not start a second registry. */
export const { getQueryOptions: getMintMarketCatalogOptions } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'getMintMarkets'] as const,
  queryFn: async (): Promise<Record<string, { id: string }>> => {
    const api = requireLib('llamaApi')
    await api.mintMarkets.fetchMintMarkets({ useApi: USE_API })
    return Object.fromEntries(
      api.mintMarkets
        .getMarketList()
        .map(name => [name, mintMarketData(api.getMintMarket(name))] as const)
        .flatMap(([name, market]) => [
          [name, market],
          [market.controller_address as Address, market],
        ]),
    )
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})

const { v1, v2 } = MarketVersion

/** Same cache key as the lend market page catalog, so the list does not start a second registry. */
export const { getQueryOptions: getLendMarketCatalogOptions } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'getLendMarkets'] as const,
  queryFn: async (): Promise<Record<string, { id: string }>> => {
    const api = requireLib('llamaApi')
    await Promise.all(
      [v1, v2].map(version =>
        api.lendMarkets.fetchMarkets({ useApi: USE_API, version }).catch((error: unknown) => {
          if (!(error instanceof Error) || !error.message.includes('not available for network')) throw error
        }),
      ),
    )
    return Object.fromEntries(
      api.lendMarkets
        .getMarketList()
        .map(name => [name, lendMarketData(api.getLendMarket(name))] as const)
        .flatMap(([name, market]) => [
          [name, market],
          [market.addresses.controller as Address, market],
        ]),
    )
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
