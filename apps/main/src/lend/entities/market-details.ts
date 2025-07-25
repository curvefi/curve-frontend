import { USE_API } from '@/lend/shared/config'
import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

type MarketCapAndAvailable = {
  cap: number
  available: number
}
type MarketMaxLeverage = {
  value: string
}
type MarketCollateralAmounts = {
  collateralAmount: number
  borrowedAmount: number
}

/**
 * The purpose of this query is to allow fetching market collateral amounts on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketCapAndAvailable = async ({ marketId }: MarketQuery): Promise<MarketCapAndAvailable> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const capAndAvailable = await market.stats.capAndAvailable(false, USE_API)
  return {
    cap: +capAndAvailable.cap,
    available: +capAndAvailable.available,
  }
}

export const { useQuery: useMarketCapAndAvailable, invalidate: invalidateMarketCapAndAvailable } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketCapAndAvailable', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _getMarketCapAndAvailable,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})

/**
 * The purpose of this query is to allow fetching market max leverage on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketMaxLeverage = async ({ marketId }: MarketQuery): Promise<MarketMaxLeverage> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const maxLeverage = market.leverage.hasLeverage() ? await market.leverage.maxLeverage(market?.minBands) : ''
  return { value: maxLeverage }
}

export const { useQuery: useMarketMaxLeverage } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketMaxLeverage', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _getMarketMaxLeverage,
  validationSuite: llamaApiValidationSuite,
})

/**
 * The purpose of this query is to allow fetching market collateral amounts on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketCollateralAmounts = async ({ marketId }: MarketQuery): Promise<MarketCollateralAmounts> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const ammBalance = await market.stats.ammBalances(false, USE_API)
  return {
    collateralAmount: +ammBalance.collateral,
    borrowedAmount: +ammBalance.borrowed,
  }
}

export const { useQuery: useMarketCollateralAmounts, invalidate: invalidateMarketCollateralAmounts } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketCollateralAmounts', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _getMarketCollateralAmounts,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})

const _fetchOnChainMarketRate = async ({ marketId }: MarketQuery) => ({
  rates: await requireLib('llamaApi').getLendMarket(marketId).stats.rates(false, false),
})

/**
 * The purpose of this query is to allow fetching market parameters on chain
 * in order to display the most current data when a wallet is connected.
 * The api data can have a few minutes delay.
 * */
export const { useQuery: useMarketOnChainRates, invalidate: invalidateMarketOnChainRates } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketOnchainData', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _fetchOnChainMarketRate,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})

const _fetchMarketPricePerShare = async ({ marketId }: MarketQuery) => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  return await market.vault.previewRedeem(1)
}

/**
 * Fetches the price per share of a market on chain
 */
export const { useQuery: useMarketPricePerShare, invalidate: invalidateMarketPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketPricePerShare', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _fetchMarketPricePerShare,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})

export const invalidateMarketDetails = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) => {
  invalidateMarketCapAndAvailable({ chainId, marketId })
  invalidateMarketCollateralAmounts({ chainId, marketId })
  invalidateMarketOnChainRates({ chainId, marketId })
  invalidateMarketPricePerShare({ chainId, marketId })
}

export const useMarketDetails = (params: MarketParams, options?: { enabled?: boolean }) => {
  const queryParams = { ...params, ...options }

  const { data: marketCapAndAvailable, isLoading: isMarketCapAndAvailableLoading } =
    useMarketCapAndAvailable(queryParams)
  const { data: marketMaxLeverage, isLoading: isMarketMaxLeverageLoading } = useMarketMaxLeverage(queryParams)
  const { data: marketCollateralAmounts, isLoading: isMarketCollateralAmountsLoading } =
    useMarketCollateralAmounts(queryParams)
  const { data: marketOnChainRates, isLoading: isMarketOnChainRatesLoading } = useMarketOnChainRates(queryParams)
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } = useMarketPricePerShare(queryParams)

  return {
    data: {
      ...(marketCapAndAvailable ?? {}),
      ...(marketMaxLeverage ?? {}),
      ...(marketCollateralAmounts ?? {}),
      ...(marketOnChainRates ?? {}),
      pricePerShare: marketPricePerShare,
    },
    isLoading: {
      marketCapAndAvailable: isMarketCapAndAvailableLoading,
      marketMaxLeverage: isMarketMaxLeverageLoading,
      marketCollateralAmounts: isMarketCollateralAmountsLoading,
      marketOnChainRates: isMarketOnChainRatesLoading,
      marketPricePerShare: isMarketPricePerShareLoading,
    },
  }
}
