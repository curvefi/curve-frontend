import { USE_API } from '@/lend/shared/config'
import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { MarketParams, MarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import { type PreciseNumber, toPrecise } from '@ui-kit/utils'

const getLendMarket = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId)

type MarketCapAndAvailable = {
  cap: PreciseNumber
  available: PreciseNumber
}
type MarketCollateralAmounts = {
  collateralAmount: PreciseNumber
  borrowedAmount: PreciseNumber
}

/**
 * The purpose of this query is to allow fetching market collateral amounts on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketCapAndAvailable = async ({ marketId }: MarketQuery): Promise<MarketCapAndAvailable> => {
  const market = getLendMarket(marketId)
  const capAndAvailable = await market.stats.capAndAvailable(false, USE_API)
  return {
    cap: toPrecise(capAndAvailable.cap),
    available: toPrecise(capAndAvailable.available),
  }
}

export const { useQuery: useMarketCapAndAvailable, invalidate: invalidateMarketCapAndAvailable } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketCapAndAvailable', 'v1'] as const,
  queryFn: _getMarketCapAndAvailable,
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})

/**
 * The purpose of this query is to allow fetching market max leverage on chain
 * in order to display the most current data when a wallet is connected.
 * */
export const { useQuery: useMarketMaxLeverage } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketMaxLeverage', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    if (market.leverage.hasLeverage()) {
      return toPrecise(await market.leverage.maxLeverage(market?.minBands))
    }
  },
  validationSuite: marketIdValidationSuite,
})

/**
 * The purpose of this query is to allow fetching market collateral amounts on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketCollateralAmounts = async ({ marketId }: MarketQuery): Promise<MarketCollateralAmounts> => {
  const market = getLendMarket(marketId)
  const ammBalance = await market.stats.ammBalances(false, USE_API)
  return {
    collateralAmount: toPrecise(ammBalance.collateral),
    borrowedAmount: toPrecise(ammBalance.borrowed),
  }
}

export const { useQuery: useMarketCollateralAmounts, invalidate: invalidateMarketCollateralAmounts } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketCollateralAmounts', 'v1'] as const,
  queryFn: _getMarketCollateralAmounts,
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})

const _fetchOnChainMarketRate = async ({ marketId }: MarketQuery) => ({
  rates: await getLendMarket(marketId).stats.rates(false, false),
  rewardsApr: await getLendMarket(marketId).vault.rewardsApr(false),
  crvRates: await getLendMarket(marketId).vault.crvApr(false),
})

/**
 * The purpose of this query is to allow fetching market parameters on chain
 * in order to display the most current data when a wallet is connected.
 * The api data can have a few minutes delay.
 * */
export const { useQuery: useMarketOnChainRates, invalidate: invalidateMarketOnChainRates } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketOnchainData', 'v1'] as const,
  queryFn: _fetchOnChainMarketRate,
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})

const _fetchMarketPricePerShare = async ({ marketId }: MarketQuery) => {
  const market = getLendMarket(marketId)
  return await market.vault.previewRedeem(1)
}

/**
 * Fetches the price per share of a market on chain
 */
export const { useQuery: useMarketPricePerShare, invalidate: invalidateMarketPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketPricePerShare', 'v1'] as const,
  queryFn: _fetchMarketPricePerShare,
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
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
      ...marketCapAndAvailable,
      ...(marketMaxLeverage && { maxLeverage: marketMaxLeverage }),
      ...marketCollateralAmounts,
      ...marketOnChainRates,
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
