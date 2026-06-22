import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/bands-chart.utils'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getAmmAddress } from '@/llamalend/llama.utils'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useBandsChartVisible } from '@ui-kit/hooks/useLocalStorage'
import type { Range } from '@ui-kit/types/util'

type ChartAndActivityCompProps = {
  rChainId: ChainId
  market: LendMarketTemplate | undefined
  previewPrices: Range<Decimal> | undefined
}

export const ChartAndActivityComp = ({ rChainId, market, previewPrices }: ChartAndActivityCompProps) => {
  const [isBandsVisible] = useBandsChartVisible()
  const collateralTokenAddress = market?.collateral_token.address
  const borrowedTokenAddress = market?.borrowed_token.address
  const networkConfig = networks[rChainId]
  const {
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({ rChainId, market, previewPrices })

  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    error: bandsError,
  } = useBandsData({ chainId: rChainId, marketId: market?.id, enabled: isBandsVisible })

  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateral_token.symbol) as
    | Token
    | undefined
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.borrowed_token.symbol) as Token | undefined

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
        endpoint: 'lending',
        networkConfig,
      }}
    />
  )
}
