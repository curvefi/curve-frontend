import { getBandsChartToken } from '@/llamalend/features/bands-chart/bands-chart.utils'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import { useOhlcChartState } from '@/loan/hooks/useOhlcChartState'
import { networks } from '@/loan/networks'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import type { Chain, Address } from '@curvefi/prices-api'
import { type Token } from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'

type ChartAndActivityCompProps = {
  chainId: ChainId
  market: Llamma | null
  llammaId: string
}

export const ChartAndActivityComp = ({ chainId, market, llammaId }: ChartAndActivityCompProps) => {
  const { llamaApi: api = null } = useCurve()
  const collateralTokenAddress = market?.coinAddresses[1]
  const borrowedTokenAddress = market?.coinAddresses[0]

  const networkConfig = networks[chainId]
  const network = networkConfig?.id.toLowerCase() as Chain
  const ammAddress = market?.address as Address | undefined

  const {
    ohlcDataUnavailable,
    isLoading: isChartLoading,
    selectedChartKey,
    setSelectedChart,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({
    chainId,
    market,
    llammaId,
  })

  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    isError: isBandsError,
  } = useBandsData({
    chainId,
    marketId: llammaId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
  })

  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateralSymbol) as Token | undefined
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.coins[0]) as Token | undefined

  return (
    <ChartAndActivityLayout
      isMarketAvailable={!!market}
      chart={{
        ohlcDataUnavailable,
        isLoading: isChartLoading,
        selectedChartKey,
        setSelectedChart,
        setTimeOption,
        legendSets,
        ohlcChartProps,
      }}
      bands={{
        chartData,
        userBandsBalances: userBandsBalances ?? [],
        oraclePrice,
        isLoading: isBandsLoading,
        isError: isBandsError,
        collateralToken,
        borrowToken,
      }}
      activity={{
        network,
        ammAddress,
        collateralToken,
        borrowToken,
        endpoint: 'crvusd',
        networkConfig,
      }}
    />
  )
}
