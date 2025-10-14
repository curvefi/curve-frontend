import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'

export const useBandsData = ({
  rChainId,
  rOwmId,
  api,
  market,
}: Pick<PageContentProps, 'api' | 'rChainId' | 'rOwmId' | 'market'>) => {
  const loansPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])
  const loansStatsBands = useStore((state) => state.markets.statsBandsMapper[rChainId]?.[rOwmId])
  const userActiveKey = helpers.getUserActiveKey(api, market!)

  const { bandsBalances: userBandsBalances } = useUserLoanDetails(userActiveKey)
  const { liquidationBand, bandsBalances: marketBandsBalances } = loansStatsBands?.bands ?? {}
  const { oraclePrice, oraclePriceBand } = loansPrices?.prices ?? {}

  return {
    userBandsBalances,
    marketBandsBalances,
    liquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}
