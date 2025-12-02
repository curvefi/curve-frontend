import { useEffect, useState } from 'react'
import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { mapBreakpoints } from '@ui-kit/themes/basic-theme'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../../columns.enum'

const { IconSize, Spacing } = SizesAndSpaces

type BackgroundColor = (theme: Theme) => string
const info: BackgroundColor = (t) => t.design.Layer.Feedback.Info
const red: BackgroundColor = (t) => t.design.Layer.Feedback.Error
const orange: BackgroundColor = (t) => t.design.Color.Tertiary[400]

/**
 * Function to be called in useEffect that calls the given method in interval to create a flicker effect.
 */
const flickerEffect = (
  setBackgroundColor: (value: (prevState: BackgroundColor) => BackgroundColor) => void,
  duration = Duration.Flicker,
) => {
  let timeoutId: ReturnType<typeof setTimeout>
  const flicker = () => {
    setBackgroundColor((prev: BackgroundColor) => (prev === orange ? red : orange))
    timeoutId = setTimeout(flicker, duration)
  }
  flicker()
  return () => clearTimeout(timeoutId)
}

export const UserPositionIndicator = ({ market }: { market: LlamaMarket }) => {
  const isSoftLiquidation = useUserMarketStats(market, LlamaMarketColumnId.UserHealth)?.data?.softLiquidation
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>(() => info)
  useEffect(
    () => (isSoftLiquidation ? flickerEffect(setBackgroundColor) : setBackgroundColor(() => info)),
    [isSoftLiquidation],
  )
  return (
    <Tooltip
      title={
        isSoftLiquidation
          ? t`Your position in this market is in soft liquidation`
          : t`You have a position in this market`
      }
    >
      <Stack
        sx={{
          backgroundColor,
          alignSelf: 'stretch',
          justifyContent: 'center',
          marginInlineStart: mapBreakpoints(Spacing.md, (v) => `-${v}`), // negative padding to offset the padding of the cell
          marginInlineEnd: Spacing.sm,
        }}
      >
        <LlamaIcon sx={{ color: (t) => t.design.Layer[1].Outline, width: IconSize.md, height: IconSize.md }} />
      </Stack>
    </Tooltip>
  )
}
