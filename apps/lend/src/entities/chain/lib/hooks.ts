import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { CRVUSD_ADDRESS } from 'loan/src/constants'
import { BD } from '@/shared/curve-lib'
import { useCrvUsdTotalSupply } from '@/entities/chain'
import { useTokenUsdRate, useTokenUsdRates } from '@/entities/token'

export const useChainId = () => {
  const api = useStore(state => state.api)
  return api?.chainId
}

const getTokenAddresses = (oneWayMarkets?: OWMDatasMapper) => Object.values(oneWayMarkets ?? {}).flatMap(({ owm }) => [owm.borrowed_token, owm.collateral_token]).map(t => t.address)

export const useTvl = (chainId: ChainId) => {
  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[chainId])
  const marketsCollateralMapper = useStore((state) => state.markets.statsAmmBalancesMapper[chainId])
  const marketsTotalSupplyMapper = useStore((state) => state.markets.totalLiquidityMapper[chainId])
  const marketsTotalDebtMapper = useStore((state) => state.markets.statsTotalsMapper[chainId])
  const tokenAddresses = useMemo(() => getTokenAddresses(owmDatasMapper), [owmDatasMapper]);
  const { data: usdRatesMapper } = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses })

  return useMemo(() => {
    if (
      owmDatasMapper &&
      marketsCollateralMapper &&
      marketsTotalSupplyMapper &&
      marketsTotalDebtMapper &&
      Object.keys(usdRatesMapper).length
    ) {
      let totalCollateral = 0
      let totalLiquidity = 0
      let totalDebt = 0

      Object.values(owmDatasMapper).map(({ owm }) => {
        const { id, collateral_token } = owm

        const ammBalance = marketsCollateralMapper[id] ?? {}
        const collateralUsdRate = usdRatesMapper[collateral_token.address] ?? 0
        const marketTotalCollateralUsd = +(ammBalance?.collateral ?? '0') * collateralUsdRate

        totalCollateral += marketTotalCollateralUsd
        totalDebt += +marketsTotalDebtMapper[id]?.totalDebt
        totalLiquidity += +marketsTotalSupplyMapper[id]?.totalLiquidity
      })

      const tvl = totalCollateral + totalLiquidity - totalDebt

      return tvl > 0 ? formatNumber(tvl, { ...FORMAT_OPTIONS.USD, showDecimalIfSmallNumberOnly: true }) : '-'
    }
  }, [owmDatasMapper, marketsCollateralMapper, marketsTotalSupplyMapper, marketsTotalDebtMapper, usdRatesMapper])
}
