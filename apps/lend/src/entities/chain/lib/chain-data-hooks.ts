import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { useTokenUsdRates } from '@/entities/token'
import { PartialQueryResult } from '@/shared/lib/queries'

export const useChainId = () => {
  const api = useStore(state => state.api)
  return api?.chainId
}

const getTokenAddresses = (oneWayMarkets?: OWMDatasMapper) => Object.values(oneWayMarkets ?? {}).flatMap(({ owm }) => [owm.borrowed_token, owm.collateral_token]).map(t => t.address)

export const useTvl = (chainId: ChainId): PartialQueryResult<number> => {
  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[chainId])
  const marketsCollateralMapper = useStore((state) => state.markets.statsAmmBalancesMapper[chainId])
  const marketsTotalSupplyMapper = useStore((state) => state.markets.totalLiquidityMapper[chainId])
  const marketsTotalDebtMapper = useStore((state) => state.markets.statsTotalsMapper[chainId])
  const tokenAddresses = useMemo(() => getTokenAddresses(owmDatasMapper), [owmDatasMapper]);
  const { data: tokenUsdRates, isError: isUsdRatesError } = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses })

  return useMemo(() => {
    if (!owmDatasMapper || !marketsCollateralMapper || !marketsTotalSupplyMapper || !marketsTotalDebtMapper || !Object.keys(tokenUsdRates).length) {
      return {
        isError: isUsdRatesError,
        isLoading: true,
        isPending: true,
        isFetching: true,
        data: undefined
      }
    }
    let totalCollateral = 0
    let totalLiquidity = 0
    let totalDebt = 0

    Object.values(owmDatasMapper).map(({ owm }) => {
      const { id, collateral_token } = owm

      const ammBalance = marketsCollateralMapper[id] ?? {}
      const collateralUsdRate = tokenUsdRates[collateral_token.address] ?? 0
      const marketTotalCollateralUsd = +(ammBalance?.collateral ?? '0') * collateralUsdRate

      totalCollateral += marketTotalCollateralUsd
      totalDebt += +marketsTotalDebtMapper[id]?.totalDebt
      totalLiquidity += +marketsTotalSupplyMapper[id]?.totalLiquidity
    })

    return {
      data: totalCollateral +totalLiquidity - totalDebt,
      isError: false,
      isLoading: false,
      isPending: false,
      isFetching: false
    }
  }, [isUsdRatesError, owmDatasMapper, marketsCollateralMapper, marketsTotalSupplyMapper, marketsTotalDebtMapper, tokenUsdRates])
}
