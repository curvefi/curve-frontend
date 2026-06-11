import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { getTokens } from '@/llamalend/llama.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useLoanSlices } from '@ui-kit/hooks/useFeatureFlags'
import type { Range } from '@ui-kit/types/util'

type LlammaLiquidityCoins = ReturnType<typeof getTokens> | undefined | null

type OhlcChartStateProps = {
  chainId: ChainId
  market: Llamma | null
  marketId: string
  previewPrices: Range<Decimal> | undefined
}

const useLegacyChartPrices = (enabled: boolean) => {
  const increaseActiveKey = useStore(state => state.loanIncrease.activeKey)
  const decreaseActiveKey = useStore(state => state.loanDecrease.activeKey)
  const deleverageActiveKey = useStore(state => state.loanDeleverage.activeKey)
  const collateralIncreaseActiveKey = useStore(state => state.loanCollateralIncrease.activeKey)
  const collateralDecreaseActiveKey = useStore(state => state.loanCollateralDecrease.activeKey)
  const increaseLoanPrices = useStore(state => state.loanIncrease.detailInfo[increaseActiveKey]?.prices ?? null)
  const decreaseLoanPrices = useStore(state => state.loanDecrease.detailInfo[decreaseActiveKey]?.prices ?? null)
  const deleveragePrices = useStore(state => state.loanDeleverage.detailInfo[deleverageActiveKey]?.prices ?? null)
  const increaseCollateralPrices = useStore(
    state => state.loanCollateralIncrease.detailInfo[collateralIncreaseActiveKey]?.prices ?? null,
  )
  const decreaseCollateralPrices = useStore(
    state => state.loanCollateralDecrease.detailInfo[collateralDecreaseActiveKey]?.prices ?? null,
  )
  return useMemo(() => {
    if (!enabled) return undefined
    if (deleveragePrices?.length) return deleveragePrices
    if (decreaseCollateralPrices?.length) return decreaseCollateralPrices
    if (increaseCollateralPrices?.length) return increaseCollateralPrices
    if (decreaseLoanPrices?.length) return decreaseLoanPrices
    if (increaseLoanPrices?.length) return increaseLoanPrices
    return undefined
  }, [
    enabled,
    deleveragePrices,
    decreaseCollateralPrices,
    increaseCollateralPrices,
    decreaseLoanPrices,
    increaseLoanPrices,
  ]) as Range<Decimal> | undefined
}

export const useOhlcChartState = ({ chainId, market, marketId, previewPrices }: OhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const storePreviewPrices = useLegacyChartPrices(useLoanSlices())
  const { data: userPrices } = useUserPrices({ chainId, marketId, userAddress })
  const poolAddress = market?.address ?? ''
  const controllerAddress = market?.controller ?? ''
  const { data: oraclePrice } = useMarketOraclePrice({ chainId, marketId })
  const networkId = networks[chainId].id.toLowerCase()
  const network = isPricesApiChain(networkId) ? networkId : undefined
  const chartState = useLlammaOhlcChartStateModel({
    endpoint: 'crvusd',
    chainKey: chainId,
    marketId,
    network,
    controllerAddress,
    llammaAddress: poolAddress,
    oraclePrice,
    enabled: !!market,
    userPrices,
    previewPrices,
    legacyPreviewPrices: storePreviewPrices,
  })

  const coins: LlammaLiquidityCoins = useMemo(() => market && getTokens(market), [market])

  return {
    poolAddress,
    coins,
    ...chartState,
  }
}
