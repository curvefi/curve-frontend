import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { CRVUSD_ADDRESS } from 'loan/src/constants'
import { BD } from '@/shared/curve-lib'
import { useCrvUsdTotalSupply } from '@/entities/chain'

export const useTvl = (rChainId: ChainId) => {
  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[rChainId])
  const marketsCollateralMapper = useStore((state) => state.markets.statsAmmBalancesMapper[rChainId])
  const marketsTotalSupplyMapper = useStore((state) => state.markets.totalLiquidityMapper[rChainId])
  const marketsTotalDebtMapper = useStore((state) => state.markets.statsTotalsMapper[rChainId])
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)

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
        const collateralUsdRate = usdRatesMapper[collateral_token.address]
        const marketTotalCollateralUsd = +(ammBalance?.collateral ?? '0') * +(collateralUsdRate ?? '0')

        totalCollateral += marketTotalCollateralUsd
        totalDebt += +marketsTotalDebtMapper[id]?.totalDebt
        totalLiquidity += +marketsTotalSupplyMapper[id]?.totalLiquidity
      })

      const tvl = totalCollateral + totalLiquidity - totalDebt

      return tvl > 0 ? formatNumber(tvl, { ...FORMAT_OPTIONS.USD, showDecimalIfSmallNumberOnly: true }) : '-'
    }
  }, [owmDatasMapper, marketsCollateralMapper, marketsTotalSupplyMapper, marketsTotalDebtMapper, usdRatesMapper])
}

export const useCrvUsdPrice = () => {
  return useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
}

export const useCrvUsdTotalSupplyInUSD = (chainId: ChainId) => {
  const { data: totalCrvUsd } = useCrvUsdTotalSupply({ chainId })
  const inUsd = useCrvUsdPrice()
  if (!totalCrvUsd || !inUsd) {
    return null
  }
  return BD.from(totalCrvUsd).div(BD.from(inUsd))
}