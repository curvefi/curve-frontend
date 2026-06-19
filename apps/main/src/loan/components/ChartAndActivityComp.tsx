import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import { useOhlcChartState } from '@/loan/hooks/useOhlcChartState'
import { networks } from '@/loan/networks'
import { ChainId } from '@/loan/types/loan.types'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useBandsChartVisible } from '@ui-kit/hooks/useLocalStorage'
import type { Range } from '@ui-kit/types/util'

type ChartAndActivityCompProps = {
  chainId: ChainId
  marketId: string
  previewPrices: Range<Decimal> | undefined
  collateralToken: { address: Address; symbol: string } | undefined
  borrowToken: { address: Address; symbol: string } | undefined
  ammAddress: Address | undefined
  controllerAddress: Address | undefined
}

export const ChartAndActivityComp = ({
  chainId,
  marketId,
  previewPrices,
  collateralToken,
  borrowToken,
  ammAddress,
  controllerAddress,
}: ChartAndActivityCompProps) => {
  const { llamaApi: api = null } = useCurve()
  const [isBandsVisible] = useBandsChartVisible()

  const networkConfig = networks[chainId]
  const network = networkConfig?.id.toLowerCase() as Chain

  const {
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
        endpoint: 'crvusd',
        networkConfig,
      }}
    />
  )
}
