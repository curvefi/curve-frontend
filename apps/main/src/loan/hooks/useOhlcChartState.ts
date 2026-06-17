import { useMemo } from 'react'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { getAmmAddress, getTokens } from '@/llamalend/llama.utils'
import { networks } from '@/loan/networks'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import type { Decimal } from '@primitives/decimal.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp, Range } from '@ui-kit/types/util'

type LlammaLiquidityCoins = ReturnType<typeof getTokens> | undefined | null

type OhlcChartStateProps = {
  chainId: ChainId
  marketQuery: QueryProp<Llamma>
  previewPrices: Range<Decimal> | undefined
}

export const useOhlcChartState = ({ chainId, marketQuery, previewPrices }: OhlcChartStateProps) => {
  const market = marketQuery.data
  const networkId = networks[chainId].id.toLowerCase()
  const chartState = useLlammaOhlcChartStateModel({
    marketType: LlamaMarketType.Mint,
    chainId,
    marketQuery,
    networkId,
    previewPrices,
  })

  const poolAddress = getAmmAddress(market)
  const coins: LlammaLiquidityCoins = useMemo(() => market && getTokens(market), [market])

  return {
    poolAddress,
    coins,
    ...chartState,
  }
}
