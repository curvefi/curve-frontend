import type { Theme } from '@mui/material'

export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const calculateLtv = (debt: number, collateralValue: number) => (debt / collateralValue) * 100

export const getHealthValueColor = (health: number, theme: Theme) => {
  const { Color, Text } = theme.design
  if (health < 5) return Text.TextColors.Feedback.Error
  if (health < 15) return Text.TextColors.Feedback.Warning
  if (health < 50) return Color.Secondary[500]
  if (health < 100) return Text.TextColors.Primary
  return Color.Secondary[600]
}
