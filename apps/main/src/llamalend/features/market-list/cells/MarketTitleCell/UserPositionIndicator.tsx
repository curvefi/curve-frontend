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
import { LlamaMarketColumnId } from '../../columns'

const { IconSize, Spacing } = SizesAndSpaces

const ColorStates = {
  info: {
    bg: (t: Theme) => t.design.Layer.Feedback.Info,
    fg: (t: Theme) => t.design.Layer[1].Outline,
  },
  orange: {
    bg: (t: Theme) => t.design.Color.Tertiary[400],
    fg: (t: Theme) => t.design.Layer[1].Outline,
  },
  red: {
    bg: (t: Theme) => t.design.Layer.Feedback.Error,
    fg: (t: Theme) => t.design.Text.TextColors.FilledFeedback.Alert.Primary,
  },
}
type ColorState = keyof typeof ColorStates

/**
 * Creates a flicker effect by toggling between orange and red colors
 * @returns Cleanup function to stop the flicker interval
 */
const flickerEffect = (
  setState: (value: (prevState: ColorState) => ColorState) => void,
  duration = Duration.Flicker,
) => {
  let timeoutId: ReturnType<typeof setTimeout>
  const flicker = () => {
    setState((prev: ColorState) => (prev === 'orange' ? 'red' : 'orange'))
    timeoutId = setTimeout(flicker, duration)
  }
  flicker()
  return () => clearTimeout(timeoutId)
}

export const UserPositionIndicator = ({ market }: { market: LlamaMarket }) => {
  const { softLiquidation, liquidated } = useUserMarketStats(market, LlamaMarketColumnId.UserHealth)?.data ?? {}
  const [colorState, setColorState] = useState<ColorState>('info')

  useEffect(
    // eslint-disable-next-line react-hooks/set-state-in-effect
    () => (softLiquidation ? flickerEffect(setColorState) : liquidated ? setColorState('red') : setColorState('info')),
    [softLiquidation, liquidated],
  )

  return (
    <Tooltip
      title={
        softLiquidation
          ? t`Your position in this market is in soft liquidation`
          : liquidated
            ? t`Your position in this market has been liquidated`
            : t`You have a position in this market`
      }
    >
      <Stack
        sx={{
          backgroundColor: ColorStates[colorState].bg,
          alignSelf: 'stretch',
          justifyContent: 'center',
          marginInlineStart: mapBreakpoints(Spacing.md, (v) => `-${v}`), // negative padding to offset the padding of the cell
          marginInlineEnd: Spacing.sm,
        }}
      >
        <LlamaIcon sx={{ color: ColorStates[colorState].fg, width: IconSize.md, height: IconSize.md }} />
      </Stack>
    </Tooltip>
  )
}
