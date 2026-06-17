import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { getTokens } from '@/llamalend/llama.utils'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import { networks } from '@/loan/networks'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import type { Decimal } from '@primitives/decimal.utils'
import { useBandsChartVisible } from '@ui-kit/hooks/useLocalStorage'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery, type QueryProp, type Range } from '@ui-kit/types/util'

type ChartAndActivityCompProps = {
  chainId: ChainId
  marketQuery: QueryProp<Llamma>
  previewPrices: Range<Decimal> | undefined
}

export const ChartAndActivityComp = ({ chainId, marketQuery, previewPrices }: ChartAndActivityCompProps) => {
  const [isBandsVisible] = useBandsChartVisible()
  const networkConfig = networks[chainId]

  const {
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useLlammaOhlcChartStateModel({
    marketType: LlamaMarketType.Mint,
    chainId,
    marketQuery,
    networkId: networkConfig.id.toLowerCase(),
    previewPrices,
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
      bands={useBandsData({ chainId, marketQuery, enabled: isBandsVisible })}
      tokens={mapQuery(marketQuery, getTokens)}
      activity={{ marketQuery, networkConfig }}
    />
  )
}
