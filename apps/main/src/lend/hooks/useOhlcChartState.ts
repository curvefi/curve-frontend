import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { getTokens } from '@/llamalend/llama.utils'
import { useUserPrices } from '@/llamalend/queries/user'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'
import { useLendMarket } from '../hooks/useLendMarket'

type LendingMarketTokens = ReturnType<typeof getTokens> | undefined

type UseOhlcChartStateProps = {
  rChainId: ChainId
  marketId: string
  previewPrices: Range<Decimal> | undefined
}

const useLegacyChartPrices = () => {
  const borrowMoreActiveKey = useStore(state => state.loanBorrowMore.activeKey)
  const loanRepayActiveKey = useStore(state => state.loanRepay.activeKey)
  const loanCollateralAddActiveKey = useStore(state => state.loanCollateralAdd.activeKey)
  const loanCollateralRemoveActiveKey = useStore(state => state.loanCollateralRemove.activeKey)
  const borrowMorePrices = useStore(state => state.loanBorrowMore.detailInfo[borrowMoreActiveKey]?.prices ?? null)
  const repayActiveKey = useStore(state => state.loanRepay.activeKey)
  const repayLeveragePrices = useStore(state => state.loanRepay.detailInfoLeverage[repayActiveKey]?.prices ?? null)
  const repayLoanPrices = useStore(state => state.loanRepay.detailInfo[loanRepayActiveKey]?.prices ?? null)
  const addCollateralPrices = useStore(
    state => state.loanCollateralAdd.detailInfo[loanCollateralAddActiveKey]?.prices ?? null,
  )
  const removeCollateralPrices = useStore(
    state => state.loanCollateralRemove.detailInfo[loanCollateralRemoveActiveKey]?.prices ?? null,
  )
  return useMemo(() => {
    if (repayLeveragePrices?.length) return repayLeveragePrices
    if (removeCollateralPrices?.length) return removeCollateralPrices
    if (addCollateralPrices?.length) return addCollateralPrices
    if (repayLoanPrices?.length) return repayLoanPrices
    if (borrowMorePrices?.length) return borrowMorePrices
    return null
  }, [repayLeveragePrices, removeCollateralPrices, addCollateralPrices, repayLoanPrices, borrowMorePrices]) as
    | Range<Decimal>
    | undefined
}

export const useOhlcChartState = ({ rChainId, marketId, previewPrices }: UseOhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const storePreviewPrices = useLegacyChartPrices()
  const { data: userPrices } = useUserPrices({
    chainId: rChainId,
    marketId,
    userAddress,
  })
  const market = useLendMarket(rChainId, marketId).data
  const priceInfo = useStore(state => state.markets.pricesMapper[rChainId]?.[marketId]?.prices ?? null)
  const { oraclePrice } = priceInfo ?? {}
  const networkId = networks[rChainId].id.toLowerCase()
  const network = isPricesApiChain(networkId) ? networkId : undefined
  const controllerAddress = market?.addresses.controller ?? ''
  const poolAddress = market?.addresses.amm ?? ''
  const chartState = useLlammaOhlcChartStateModel({
    endpoint: 'lending',
    chainKey: rChainId,
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

  const coins: LendingMarketTokens = useMemo(() => market && getTokens(market), [market])

  return {
    coins,
    ...chartState,
  }
}
