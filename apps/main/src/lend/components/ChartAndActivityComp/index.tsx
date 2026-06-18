import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { networks } from '@/lend/networks'
import { Api, ChainId } from '@/lend/types/lend.types'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useBandsChartVisible } from '@ui-kit/hooks/useLocalStorage'
import type { Range } from '@ui-kit/types/util'

type ChartAndActivityCompProps = {
  rChainId: ChainId
  marketId: string
  api: Api | undefined
  previewPrices: Range<Decimal> | undefined
  collateralToken: { address: Address; symbol: string } | undefined
  borrowToken: { address: Address; symbol: string } | undefined
  ammAddress: Address | undefined
  controllerAddress: Address | undefined
}

export const ChartAndActivityComp = ({
  rChainId,
  marketId,
  api,
  previewPrices,
  collateralToken,
  borrowToken,
  ammAddress,
  controllerAddress,
}: ChartAndActivityCompProps) => {
  const [isBandsVisible] = useBandsChartVisible()
  const networkConfig = networks[rChainId]
  const network = networkConfig?.id.toLowerCase() as Chain

  const {
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({
    rChainId,
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
    chainId: rChainId,
    marketId,
    api,
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
        network,
        ammAddress,
        collateralToken,
        borrowToken,
        endpoint: 'lending',
        networkConfig,
      }}
    />
  )
}
