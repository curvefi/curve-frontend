import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { useTokenUsdRates } from '@/entities/token'
import { PartialQueryResult } from '@/shared/lib/queries'
import { useOneWayMarketNames } from '@/entities/chain'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import networks from '@/networks'

export const useApi = (): Api | null => useStore(state => state.api)
export const useChainId = () => useApi()?.chainId

const getTokenAddresses = (oneWayMarkets?: OWMDatasMapper) =>
  Object.values(oneWayMarkets ?? {})
    .flatMap(({ owm }) => [owm.borrowed_token, owm.collateral_token])
    .map(t => t.address)

export const useTvl = (chainId: ChainId): PartialQueryResult<number> => {
  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[chainId])
  const marketsCollateralMapper = useStore((state) => state.markets.statsAmmBalancesMapper[chainId])
  const marketsTotalSupplyMapper = useStore((state) => state.markets.totalLiquidityMapper[chainId])
  const marketsTotalDebtMapper = useStore((state) => state.markets.statsTotalsMapper[chainId])
  const tokenAddresses = useMemo(() => getTokenAddresses(owmDatasMapper), [owmDatasMapper]);
  const { data: tokenUsdRates, isError: isUsdRatesError } = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses })

  return useMemo(() => {
    if (!owmDatasMapper || !marketsCollateralMapper || !marketsTotalSupplyMapper || !marketsTotalDebtMapper || !tokenUsdRates) {
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

export const useMarketMapping = (chainId: ChainId) => {
  const { data: marketNames = null, ...rest } = useOneWayMarketNames({ chainId })
  const api = useApi();
  const data: Record<string, OneWayMarketTemplate> | null = useMemo(() =>
    marketNames && api && Object.fromEntries(
      marketNames
        .filter(name => !networks[chainId].hideMarketsInUI[name])
        .map(name => [name, api.getOneWayMarket(name)])
    ), [api, chainId, marketNames]
  )
  return { data, ...rest }
}
