import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { ChainId } from '@/lend/types/lend.types'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { useMarketContext } from '@/llamalend/features/market-context'
import {
  LegacyChartAndActivityLayout,
  MarketActivityLayout,
  MarketPriceChartLayout,
} from '@/llamalend/widgets/ChartAndActivityLayout'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { useBandsChartVisible } from '@evm-ui/hooks/useLocalStorage'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui/features/queries/util'

type ChartAndActivityCompProps = {
  previewPrices: Range<Decimal> | undefined
}

export const ChartAndActivityComp = ({ previewPrices }: ChartAndActivityCompProps) => {
  const {
    chainId,
    blockchainId,
    marketId,
    ammAddress,
    controllerAddress,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext<ChainId>()
  const [isBandsVisible] = useBandsChartVisible()
  const {
    chartMode,
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({
    chainId,
    marketId,
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

  const chart = {
    chartMode,
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  }
  const bands = {
    chartData,
    userBandsBalances: userBandsBalances ?? [],
    oraclePrice,
    isLoading: isBandsLoading,
    error: bandsError,
    collateralToken,
    borrowToken,
  }

  return useNewLlamaMarketDetailPage() ? (
    <MarketPriceChartLayout chart={chart} bands={bands} />
  ) : (
    <LegacyChartAndActivityLayout
      chart={chart}
      bands={bands}
      activity={{
        chainId,
        blockchainId,
        ammAddress,
        collateralToken,
        borrowToken,
        endpoint: 'lending',
      }}
    />
  )
}

export const MarketActivityComp = () => {
  const {
    chainId,
    blockchainId,
    ammAddress,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext<ChainId>()
  return (
    <MarketActivityLayout
      activity={{
        chainId,
        blockchainId,
        ammAddress,
        collateralToken,
        borrowToken,
        endpoint: 'lending',
      }}
    />
  )
}
