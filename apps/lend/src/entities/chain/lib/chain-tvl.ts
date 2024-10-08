import { FETCHING, PartialQueryResult, READY } from '@/shared/lib/queries'
import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { useTokenUsdRates } from '@/entities/token/lib'
import { calculateChainTvl } from '@/entities/chain/model'
import { useOneWayMarketMapping } from '@/entities/chain'

export const useTvl = (chainId: ChainId): PartialQueryResult<number> => {
  const marketMapping = useOneWayMarketMapping(chainId).data
  const marketsCollateralMapper = useStore((state) => state.markets.statsAmmBalancesMapper[chainId])
  const marketsTotalSupplyMapper = useStore((state) => state.markets.totalLiquidityMapper[chainId])
  const marketsTotalDebtMapper = useStore((state) => state.markets.statsTotalsMapper[chainId])
  const tokenAddresses = useMemo(
    () =>
      Object.values(marketMapping ?? {})
        .flatMap((market) => [market.borrowed_token, market.collateral_token])
        .map((t) => t.address),
    [marketMapping],
  )
  const { data: tokenUsdRates, isError: isUsdRatesError } = useTokenUsdRates({ chainId, tokenAddresses })

  return useMemo(() => {
    if (
      !marketMapping ||
      !marketsCollateralMapper ||
      !marketsTotalSupplyMapper ||
      !marketsTotalDebtMapper ||
      !tokenUsdRates
    ) {
      return { ...FETCHING, isError: isUsdRatesError }
    }
    const data = calculateChainTvl(
      marketMapping,
      marketsCollateralMapper,
      tokenUsdRates,
      marketsTotalDebtMapper,
      marketsTotalSupplyMapper,
    )
    return { ...READY, data }
  }, [
    isUsdRatesError,
    marketMapping,
    marketsCollateralMapper,
    marketsTotalSupplyMapper,
    marketsTotalDebtMapper,
    tokenUsdRates,
  ])
}
