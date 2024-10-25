import { FETCHING, PartialQueryResult, READY } from '@/shared/lib/queries'
import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { useTokenUsdRates } from '@/entities/token/lib'
import { calculateChainTvl } from '@/entities/chain/model'

export const useTvl = (chainId: ChainId): PartialQueryResult<number> => {
  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[chainId])
  const marketsCollateralMapper = useStore((state) => state.markets.statsAmmBalancesMapper[chainId])
  const marketsTotalSupplyMapper = useStore((state) => state.markets.totalLiquidityMapper[chainId])
  const marketsTotalDebtMapper = useStore((state) => state.markets.statsTotalsMapper[chainId])
  const tokenAddresses = useMemo(
    () =>
      Object.values(owmDatasMapper ?? {})
        .flatMap(({ owm }) => [owm.borrowed_token, owm.collateral_token])
        .map((t) => t.address),
    [owmDatasMapper],
  )
  const { data: tokenUsdRates, isError: isUsdRatesError } = useTokenUsdRates({ chainId, tokenAddresses })

  return useMemo(() => {
    if (
      !owmDatasMapper ||
      !marketsCollateralMapper ||
      !marketsTotalSupplyMapper ||
      !marketsTotalDebtMapper ||
      !tokenUsdRates
    ) {
      return { ...FETCHING, isError: isUsdRatesError }
    }
    const data = calculateChainTvl(
      owmDatasMapper,
      marketsCollateralMapper,
      tokenUsdRates,
      marketsTotalDebtMapper,
      marketsTotalSupplyMapper,
    )
    return { ...READY, data }
  }, [
    isUsdRatesError,
    owmDatasMapper,
    marketsCollateralMapper,
    marketsTotalSupplyMapper,
    marketsTotalDebtMapper,
    tokenUsdRates,
  ])
}
