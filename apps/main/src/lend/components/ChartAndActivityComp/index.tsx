import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { useMarketContext } from '@/llamalend/features/market-context'
import { MarketParticipants } from '@/llamalend/features/market-participants/MarketParticipants'
import {
  LegacyChartAndActivityLayout,
  MarketActivityLayout,
  MarketPriceChartLayout,
} from '@/llamalend/widgets/ChartAndActivityLayout'
import { getBlockchainId } from '@curvefi/prices-api'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { useBandsChartVisible } from '@evm-ui/hooks/useLocalStorage'
import type { Range } from '@evm-ui/types/util'
import { PAGE_SPACING } from '@evm-ui/widgets/DetailPageLayout/constants'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'

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
        network: getBlockchainId(networkConfig?.id),
        ammAddress,
        collateralToken,
        borrowToken,
        endpoint: 'lending',
        networkConfig,
      }}
    />
  )
}

export const MarketActivityComp = () => {
  const {
    chainId,
    ammAddress,
    controllerAddress,
    vaultToken,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext<ChainId>()
  const networkConfig = networks[chainId]

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <MarketActivityLayout
        activity={{
          network: getBlockchainId(networkConfig?.id),
          ammAddress,
          collateralToken,
          borrowToken,
          endpoint: 'lending',
          networkConfig,
        }}
      />
      <MarketParticipants
        // Remount when the market changes so both tables reset their local pagination to page one.
        key={`${chainId}-${controllerAddress}-${vaultToken?.address}`}
        chainId={chainId}
        networkConfig={networkConfig}
      />
    </Stack>
  )
}
