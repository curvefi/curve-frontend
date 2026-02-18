import type { Theme } from '@mui/material'
import { Decimal } from '@ui-kit/utils'

export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const getHealthValueColor = ({
  theme: {
    design: { Text },
  },
  isFullRepay,
  health,
  prevHealth,
}: {
  health: Decimal | null | undefined
  prevHealth?: Decimal
  isFullRepay?: boolean
  theme: Theme
  colorBackground?: boolean
}) => {
  const red = Text.TextColors.Feedback.Error
  const orange = Text.TextColors.Feedback.Danger
  const green = Text.TextColors.Feedback.Success
  const neutral = Text.TextColors.Primary

  if (health != null && prevHealth != null) {
    if (Number(health) < Number(prevHealth)) {
      return red
    }
    if (Number(health) > Number(prevHealth)) {
      return green
    }
  }
  const value = Number(health ?? prevHealth ?? 0)
  if (isFullRepay) return neutral
  if (value < 2.5) return red
  if (value < 15) return orange
  if (value < 50) return neutral
  return neutral
}

export const getHealthTrackColor = ({
  health,
  softLiquidation,
  theme: {
    design: { Layer },
  },
}: {
  health: number | undefined | null
  softLiquidation: boolean | undefined | null
  theme: Theme
}) => {
  const red = Layer.Feedback.Error
  const yellow = Layer.Feedback.Warning
  const orange = Layer.Feedback.Danger
  const green = Layer.Feedback.Success

  if (health == null) {
    return softLiquidation ? Layer.Feedback.Warning : green
  }
  if (softLiquidation) {
    if (health < 2.5) return red
    if (health < 40) return orange
    return yellow
  }
  if (health < 2.5) return red
  if (health < 15) return orange
  if (health < 50) return yellow
  return green
}
