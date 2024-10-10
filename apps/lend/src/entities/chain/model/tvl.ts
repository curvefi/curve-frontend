export function calculateChainTvl(
  owmDatasMapper: OWMDatasMapper,
  marketsCollateralMapper: MarketsStatsAMMBalancesMapper,
  tokenUsdRates: Record<string, number>,
  marketsTotalDebtMapper: MarketsStatsTotalsMapper,
  marketsTotalSupplyMapper: MarketsTotalLiquidityMapper,
) {
  let totalCollateral = 0
  let totalLiquidity = 0
  let totalDebt = 0

  Object.values(owmDatasMapper).forEach(({ owm }) => {
    const { id, collateral_token } = owm

    const ammBalance = marketsCollateralMapper[id] ?? {}
    const collateralUsdRate = tokenUsdRates[collateral_token.address] ?? 0
    const marketTotalCollateralUsd = +(ammBalance?.collateral ?? '0') * collateralUsdRate

    totalCollateral += marketTotalCollateralUsd
    totalDebt += +marketsTotalDebtMapper[id]?.totalDebt
    totalLiquidity += +marketsTotalSupplyMapper[id]?.totalLiquidity
  })

  return totalCollateral + totalLiquidity - totalDebt
}
