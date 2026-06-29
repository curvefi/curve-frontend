import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import { useOhlcChartState } from '@/loan/hooks/useOhlcChartState'
import { networks } from '@/loan/networks'
import type { ChainId } from '@/loan/types/loan.types'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useBandsChartVisible } from '@ui-kit/hooks/useLocalStorage'
import type { Range } from '@ui-kit/types/util'
import { useMarketContext } from '../../llamalend/features/market-context'

type ChartAndActivityCompProps = {
  previewPrices: Range<Decimal> | undefined
}

export const ChartAndActivityComp = ({ previewPrices }: ChartAndActivityCompProps) => {
  const {
    chainId,
    marketId,
    ammAddress,
    controllerAddress,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext<ChainId>()
  const [isBandsVisible] = useBandsChartVisible()
  const networkConfig = networks[chainId]
  const {
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({
    chainId,
    marketId: marketId ?? '',
    previewPrices,
    controllerAddress,
    ammAddress,
  })

  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    error: bandsError,
  } = useBandsData({
    chainId,
    marketId,
    enabled: isBandsVisible,
  })

  return (
    <ChartAndActivityLayout
      chart={{
        isLoading: isChartLoading,
        selectedChartKey,
        setTimeOption,
        legendSets,
        ohlcChartProps,
      }}
      bands={{
        chartData,
        userBandsBalances: userBandsBalances ?? [],
        oraclePrice,
        isLoading: isBandsLoading,
        error: bandsError,
        collateralToken,
        borrowToken,
      }}
      activity={{
        network: getBlockchainId(networkConfig?.id),
        ammAddress,
        collateralToken,
        borrowToken,
        endpoint: 'crvusd',
        networkConfig,
      }}
    />
  )
}
