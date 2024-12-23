import { IDict } from '@curvefi/lending-api/lib/interfaces'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { logQuery, logSuccess } from '@ui-kit/lib/logging'

export function calculateChainTvl(
  marketMapping: IDict<OneWayMarketTemplate>,
  marketsCollateralMapper: MarketsStatsAMMBalancesMapper,
  tokenUsdRates: IDict<number>,
  marketsTotalDebtMapper: MarketsStatsTotalsMapper,
  marketsTotalSupplyMapper: MarketsTotalLiquidityMapper,
) {
  let totalCollateral = 0
  let totalLiquidity = 0
  let totalDebt = 0

  Object.values(marketMapping).forEach(({ id, collateral_token }) => {
    const ammBalance = marketsCollateralMapper[id] ?? {}
    const collateralUsdRate = tokenUsdRates[collateral_token.address] ?? 0
    const marketTotalCollateralUsd = +(ammBalance?.collateral ?? '0') * collateralUsdRate

    totalCollateral += marketTotalCollateralUsd
    totalDebt += +marketsTotalDebtMapper[id]?.totalDebt
    totalLiquidity += +marketsTotalSupplyMapper[id]?.totalLiquidity
  })

  const tvl = totalCollateral + totalLiquidity - totalDebt
  logSuccess(['chain-tvl'], { totalCollateral, totalLiquidity, totalDebt }, tvl)
  return tvl
}
