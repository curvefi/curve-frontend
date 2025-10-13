import { useState } from 'react'
import type { BrushStartEndIndex } from '@/lend/components/ChartBandBalances/types'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'

export const useUserBandsData = ({
  rChainId,
  rOwmId,
  api,
  market,
}: Pick<PageContentProps, 'api' | 'rChainId' | 'rOwmId' | 'market'>) => {
  const loansPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])
  const loansStatsBands = useStore((state) => state.markets.statsBandsMapper[rChainId]?.[rOwmId])
  const userActiveKey = helpers.getUserActiveKey(api, market!)

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })

  const { bandsBalances: userBandsBalances } = useUserLoanDetails(userActiveKey)
  const { liquidationBand, bandsBalances: marketBandsBalances } = loansStatsBands?.bands ?? {}
  const { oraclePrice, oraclePriceBand } = loansPrices?.prices ?? {}

  return {
    userBandsBalances,
    marketBandsBalances,
    brushIndex,
    setBrushIndex,
    liquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}
