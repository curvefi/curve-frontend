import { useMemo } from 'react'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { FETCHING, PartialQueryResult, READY } from '@ui-kit/lib/queries'
import { useLendMarketMapping } from '../lend-markets'
import { calculateChainTvl } from './tvl'

/** Todo: we should replace this entire hook with prices API some day, there should be an endpoint available */
export const useTvl = (chainId: ChainId | undefined): PartialQueryResult<number> => {
  const { llamaApi: api = null } = useConnection()

  const { data: marketMapping = [] } = useLendMarketMapping({ chainId })
  const markets = useMemo(() => (api ? Object.values(marketMapping).map(api.getLendMarket) : []), [api, marketMapping])
  const marketsCollateralMapper = useStore((state) => chainId && state.markets.statsAmmBalancesMapper[chainId])
  const marketsTotalSupplyMapper = useStore((state) => chainId && state.markets.totalLiquidityMapper[chainId])
  const marketsTotalDebtMapper = useStore((state) => chainId && state.markets.statsTotalsMapper[chainId])
  const tokenAddresses = useMemo(
    () => markets.flatMap((market) => [market.borrowed_token, market.collateral_token]).map((t) => t.address),
    [markets],
  )
  const { data: tokenUsdRates, isError: isUsdRatesError } = useTokenUsdRates({ chainId, tokenAddresses })

  return useMemo(() => {
    if (!marketsCollateralMapper || !marketsTotalSupplyMapper || !marketsTotalDebtMapper || !tokenUsdRates) {
      return { ...FETCHING, isError: isUsdRatesError }
    }
    const data = calculateChainTvl(
      markets,
      marketsCollateralMapper,
      tokenUsdRates,
      marketsTotalDebtMapper,
      marketsTotalSupplyMapper,
    )
    return { ...READY, data }
  }, [
    marketsCollateralMapper,
    marketsTotalSupplyMapper,
    marketsTotalDebtMapper,
    tokenUsdRates,
    markets,
    isUsdRatesError,
  ])
}
