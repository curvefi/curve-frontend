import type { Theme } from '@mui/material'
import { Blues, Greens, Reds } from '@ui-kit/themes/design/0_primitives'
import { Decimal } from '@ui-kit/utils'

export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const getHealthValueColor = ({
  theme: {
    design: { Color, Text },
  },
  isFullRepay,
  health,
  prevHealth,
}: {
  health: Decimal | null | undefined
  prevHealth?: Decimal
  isFullRepay?: boolean
  theme: Theme
}) => {
  if (health != null && prevHealth != null) {
    if (Number(health) < Number(prevHealth)) {
      return Text.TextColors.Feedback.Error
    }
    if (Number(health) > Number(prevHealth)) {
      return Text.TextColors.Feedback.Success
    }
  }
  const value = Number(health ?? prevHealth ?? 0)
  if (isFullRepay) return Color.Secondary[600]
  if (value < 5) return Text.TextColors.Feedback.Error
  if (value < 15) return Text.TextColors.Feedback.Warning
  if (value < 50) return Color.Secondary[500]
  // todo: black between 50 and 100 does not make sense, it's green before & after
  return value < 100 ? Text.TextColors.Primary : Color.Secondary[600]
}

const Yellow = Reds[300]
const Orange = Reds[400]
const Red = Reds[600]
const Blue = Blues[500]
const Green = Greens[400]

export const getHealthTrackColor = (health: number | undefined | null, softLiquidation: boolean | undefined | null) => {
  if (health == null) {
    return softLiquidation ? Orange : Blue
  }
  if (softLiquidation) {
    if (health < 5) return Red
    if (health < 40) return Orange
    return Yellow
  }
  if (health < 3) return Orange
  if (health < 10) return Yellow
  if (health < 50) return Blue
  return Green
}
