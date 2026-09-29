import {
  bufferAmount,
  collateralTokenValue,
  collateralValue,
  equity,
  leverage,
  oracleHealth,
  priceDistance,
  type PriceDistance,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import {
  positionReturnOnEquity,
  type RewardInput,
  type RoeResult,
  type YieldInput,
} from '@/llamalend/features/market-position-details/position-roe.utils'
import { resolvePositionStatus, type PositionStatus } from '@/llamalend/features/market-position-details/position-status.utils'
import type { MarketAssetsType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

export type PositionViewInput = {
  oraclePrice: Decimal
  upperPrice: Decimal
  lowerPrice: Decimal
  debt: Decimal
  collateralTokenAmount: Decimal
  borrowedAssetInAmm: Decimal
  fullHealthPercentagePoints: Decimal | undefined
  liquidationPredicate: 'strict-negative' | 'unverified'
  assetsType: MarketAssetsType | undefined
  collateralYield: YieldInput
  borrowedYield: YieldInput
  borrowCost: YieldInput
  rewards: RewardInput
}

/** One derivation for the card, previews, and tables. Callers do not reimplement the formulas. */
export const derivePositionView = (input: PositionViewInput) => {
  const oracleHealthFactor = oracleHealth(input.oraclePrice, input.upperPrice)
  const distance: PriceDistance = priceDistance(input.oraclePrice, input.upperPrice, input.lowerPrice)
  const collateralTokenExposure = collateralTokenValue(input.collateralTokenAmount, input.oraclePrice)
  const collateral = collateralValue(input.collateralTokenAmount, input.oraclePrice, input.borrowedAssetInAmm)
  const equityAmount = equity(collateral, input.debt)
  const directionalLeverage = leverage(collateralTokenExposure, equityAmount)
  const liquidationBufferAmount = maybe(input.fullHealthPercentagePoints, health => bufferAmount(input.debt, health))
  const status: PositionStatus | undefined =
    distance.location === 'unavailable'
      ? undefined
      : resolvePositionStatus({
          oraclePrice: input.oraclePrice,
          upperPrice: input.upperPrice,
          lowerPrice: input.lowerPrice,
          fullHealth: input.fullHealthPercentagePoints,
          collateralQuantity: input.collateralTokenAmount,
          liquidationPredicate: input.liquidationPredicate,
          assetsType: input.assetsType,
        })
  const roe: RoeResult = positionReturnOnEquity({
    collateralValue: collateralTokenExposure,
    borrowedValue: input.borrowedAssetInAmm,
    debt: input.debt,
    equity: equityAmount,
    collateralYield: input.collateralYield,
    borrowedYield: input.borrowedYield,
    borrowCost: input.borrowCost,
    rewards: input.rewards,
  })
  return {
    oracleHealthFactor,
    distance,
    collateralValue: collateral,
    collateralTokenValue: collateralTokenExposure,
    equity: equityAmount,
    directionalLeverage,
    liquidationBufferPct: input.fullHealthPercentagePoints,
    liquidationBufferAmount,
    roeApr: roe,
    status,
  }
}
