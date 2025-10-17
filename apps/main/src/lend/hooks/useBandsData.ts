import { shallow } from 'zustand/shallow'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import { useProcessedBandsData } from '@/llamalend/hooks/useBandsData'

export const useBandsData = ({
  rChainId,
  rOwmId,
  api,
  market,
}: Pick<PageContentProps, 'api' | 'rChainId' | 'rOwmId' | 'market'>) => {
  const userActiveKey = helpers.getUserActiveKey(api, market!)

  const { userBandsBalances, liquidationBand, marketBandsBalances, oraclePrice, oraclePriceBand } = useStore(
    (state) => {
      const marketPrices = state.markets.pricesMapper[rChainId]?.[rOwmId]
      const marketStatsBands = state.markets.statsBandsMapper[rChainId]?.[rOwmId]
      const userLoanDetails = state.user.loansDetailsMapper[userActiveKey]

      return {
        userBandsBalances: userLoanDetails?.details?.bandsBalances,
        liquidationBand: marketStatsBands?.bands?.liquidationBand,
        marketBandsBalances: marketStatsBands?.bands?.bandsBalances,
        oraclePrice: marketPrices?.prices?.oraclePrice,
        oraclePriceBand: marketPrices?.prices?.oraclePriceBand,
      }
    },
    shallow,
  )

  const chartData = useProcessedBandsData({
    marketBandsBalances: marketBandsBalances ?? [],
    userBandsBalances: userBandsBalances ?? [],
    oraclePriceBand,
  })

  return {
    chartData,
    userBandsBalances, // Pass original for brush calculation
    liquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}
