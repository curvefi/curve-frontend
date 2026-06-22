import { getBandsChartToken } from '@/llamalend/features/bands-chart/bands-chart.utils'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getAmmAddress } from '@/llamalend/llama.utils'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import { useOhlcChartState } from '@/loan/hooks/useOhlcChartState'
import { networks } from '@/loan/networks'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useBandsChartVisible } from '@ui-kit/hooks/useLocalStorage'
import type { Range } from '@ui-kit/types/util'

type ChartAndActivityCompProps = {
  chainId: ChainId
  market: Llamma | null
  previewPrices: Range<Decimal> | undefined
}

export const ChartAndActivityComp = ({ chainId, market, previewPrices }: ChartAndActivityCompProps) => {
  const [isBandsVisible] = useBandsChartVisible()
  const [borrowedTokenAddress, collateralTokenAddress] = market?.coinAddresses ?? []
  const networkConfig = networks[chainId]
  const {
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({ chainId, market, previewPrices })

  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    error: bandsError,
  } = useBandsData({
    chainId,
    marketId: market?.id,
    enabled: isBandsVisible,
  })

  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateralSymbol) as Token | undefined
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.coins[0]) as Token | undefined

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
        isMarketAvailable: !!market,
        network: getBlockchainId(networkConfig?.id),
        ammAddress: getAmmAddress(market),
        collateralToken,
        borrowToken,
        endpoint: 'crvusd',
        networkConfig,
      }}
    />
  )
}
