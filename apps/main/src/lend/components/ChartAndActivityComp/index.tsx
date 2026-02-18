import { useOneWayMarket } from '@/lend/entities/chain'
import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { networks } from '@/lend/networks'
import { Api, ChainId } from '@/lend/types/lend.types'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/bands-chart.utils'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { ChartAndActivityLayout } from '@/llamalend/widgets/ChartAndActivityLayout'
import type { Address, Chain } from '@curvefi/prices-api'
import { type Token } from '@ui-kit/features/activity-table'

type ChartAndActivityCompProps = {
  rChainId: ChainId
  rOwmId: string
  api: Api | undefined
  previewPrices: string[] | undefined
}

export const ChartAndActivityComp = ({ rChainId, rOwmId, api, previewPrices }: ChartAndActivityCompProps) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const collateralTokenAddress = market?.collateral_token.address
  const borrowedTokenAddress = market?.borrowed_token.address

  const networkConfig = networks[rChainId]
  const network = networkConfig?.id.toLowerCase() as Chain
  const ammAddress = market?.addresses.amm as Address | undefined

  const {
    ohlcDataUnavailable,
    isLoading: isChartLoading,
    selectedChartKey,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({
    rChainId,
    rOwmId,
    previewPrices,
  })

  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    isError: isBandsError,
  } = useBandsData({
    chainId: rChainId,
    marketId: rOwmId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
  })

  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateral_token.symbol) as
    | Token
    | undefined
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.borrowed_token.symbol) as Token | undefined

  return (
    <ChartAndActivityLayout
      chart={{
        ohlcDataUnavailable,
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
        isError: isBandsError,
        collateralToken,
        borrowToken,
      }}
      activity={{
        isMarketAvailable: !!market,
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
