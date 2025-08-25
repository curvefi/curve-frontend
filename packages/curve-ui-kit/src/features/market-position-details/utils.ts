import type { Theme } from '@mui/material'
import { Blues, Reds } from '@ui-kit/themes/design/0_primitives'

export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const calculateLtv = (debt: number, collateralValue: number) => (debt / collateralValue) * 100

export const getHealthValueColor = (health: number, { design: { Color, Text } }: Theme) => {
  if (health < 5) return Text.TextColors.Feedback.Error
  if (health < 15) return Text.TextColors.Feedback.Warning
  if (health < 50) return Color.Secondary[500]
  if (health < 100) return Text.TextColors.Primary // todo: black does not make sense, it's green before & after
  return Color.Secondary[600]
}

export const getHealthTrackColor = (health: number | undefined | null) =>
  health != null && health < 5 ? Reds[500] : Blues[500]
