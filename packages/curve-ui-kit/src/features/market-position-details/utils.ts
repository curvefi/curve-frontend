import type { Theme } from '@mui/material'
import { Blues, Reds } from '@ui-kit/themes/design/0_primitives'

export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const calculateLtv = (debt: number, collateralValue: number) => (debt / collateralValue) * 100

export const getHealthValueColor = (health: number, { design: { Color, Text } }: Theme) => {
  if (health < 5) return Text.TextColors.Feedback.Error
  if (health < 15) return Text.TextColors.Feedback.Warning
  if (health < 50) return Color.Secondary[500]
  // todo: black between 50 and 100 does not make sense, it's green before & after
  return health < 100 ? Text.TextColors.Primary : Color.Secondary[600]
}

export const getHealthTrackColor = (health: number | undefined | null, softLiquidation: boolean | undefined | null) =>
  softLiquidation ? Reds[500] : health == null || health >= 5 ? Blues[500] : Reds[400]
