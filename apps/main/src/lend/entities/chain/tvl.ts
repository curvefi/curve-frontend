import {
  MarketsStatsAMMBalancesMapper,
  MarketsStatsTotalsMapper,
  MarketsTotalLiquidityMapper,
  OneWayMarketTemplate,
} from '@/lend/types/lend.types'
import { IDict } from '@curvefi/llamalend-api/lib/interfaces'
import { logSuccess } from '@ui-kit/lib'

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

  Object.entries(marketMapping)
    .filter(([key]) => !key.startsWith('0x')) // the market mapping has addresses and ids, we only want the ids
    .forEach(([id, { collateral_token }]) => {
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
