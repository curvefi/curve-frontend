import type { Theme } from '@mui/material'

export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const calculateLtv = (debt: number, collateralValue: number) => (debt / collateralValue) * 100

export const getHealthValueColor = (value: number, theme: Theme) => {
  if (value < 5) return theme.design.Text.TextColors.Feedback.Error
  if (value < 15) return theme.design.Text.TextColors.Feedback.Warning
  if (value < 50) return theme.design.Color.Secondary[500]
  if (value >= 100) return theme.design.Color.Secondary[600]
  return theme.design.Text.TextColors.Primary
}
