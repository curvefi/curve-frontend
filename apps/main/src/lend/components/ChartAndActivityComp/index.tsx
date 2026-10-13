import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { ChainId } from '@/lend/types/lend.types'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { useMarketContext } from '@/llamalend/features/market-context'
import { MarketParticipantsTabs } from '@/llamalend/features/market-participants/MarketParticipantsCards'
import { MarketActivityLayout, MarketPriceChartLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import { MarketRateType } from '@evm-ui/types/market'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { PAGE_SPACING } from '@ui/features/layout/DetailPageLayout/constants'
import type { Range } from '@ui/features/queries/util'
import { useBandsChartVisible } from '@ui/features/storage/useLocalStorage'

type ChartAndActivityCompProps = { previewPrices: Range<Decimal> | undefined }

export const ChartAndActivityComp = ({ previewPrices }: ChartAndActivityCompProps) => {
  const {
    chainId,
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
  } = useOhlcChartState({ chainId, marketId, previewPrices, controllerAddress, ammAddress })

  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    error: bandsError,
  } = useBandsData({ chainId, marketId, enabled: isBandsVisible })

  const chart = { chartMode, isLoading: isChartLoading, selectedChartKey, setTimeOption, legendSets, ohlcChartProps }
  const bands = {
    chartData,
    userBandsBalances: userBandsBalances ?? [],
    oraclePrice,
    isLoading: isBandsLoading,
    error: bandsError,
    collateralToken,
    borrowToken,
  }

  return <MarketPriceChartLayout chart={chart} bands={bands} />
}

export const MarketActivityComp = ({ rateType }: { rateType: MarketRateType }) => {
  const {
    chainId,
    blockchainId,
    ammAddress,
    vaultToken,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext<ChainId>()
  const marketActivity = {
    [MarketRateType.Borrow]: { ammAddress, collateralToken, endpoint: 'lending' },
    [MarketRateType.Supply]: { vaultToken },
  } as const

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <MarketParticipantsTabs rateType={rateType} />
      <MarketActivityLayout
        rateType={rateType}
        activity={{ chainId, blockchainId, borrowToken, ...marketActivity[rateType] }}
      />
    </Stack>
  )
}
