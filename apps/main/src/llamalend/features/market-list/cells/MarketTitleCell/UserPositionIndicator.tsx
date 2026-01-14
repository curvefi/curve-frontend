import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { mapBreakpoints } from '@ui-kit/themes/basic-theme'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../../columns'

const { IconSize, Spacing, FontWeight } = SizesAndSpaces

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

const Paragraph = ({ children }: { children?: ReactNode }) => (
  <Typography variant="bodySRegular" fontWeight={FontWeight.Medium}>
    {children}
  </Typography>
)

const TooltipHealthy = ({ children }: { children: ReactElement }) => (
  <Tooltip
    title={t`Position is healthy`}
    body={
      <Paragraph>{t`The oracle price is above your liquidation range. No soft-liquidation conversions are occurring.`}</Paragraph>
    }
  >
    {children}
  </Tooltip>
)

const TooltipInLiqRange = ({ children }: { children: ReactElement }) => (
  <Tooltip
    title={t`Liquidation protection active`}
    body={
      <Stack gap={Spacing.sm}>
        <Paragraph>{t`The oracle price is inside your liquidation range. LLAMMA is gradually converting collateral while price moves inside the range. Volatility inside the range can erode health over time.`}</Paragraph>
        <Paragraph>{t`Positions get fully liquidated if health reaches 0.`}</Paragraph>
        <Paragraph>{t`You may reduce risk by repaying debt, waiting for price recovery or closing the position and reopening it.`}</Paragraph>
      </Stack>
    }
  >
    {children}
  </Tooltip>
)

const TooltipBelowLiqRange = ({ children }: { children: ReactElement }) => (
  <Tooltip
    title={t`Below liquidation range`}
    body={
      <Stack gap={Spacing.sm}>
        <Paragraph>{t`The oracle price is below your liquidation range. Collateral is fully converted and no further soft-liquidation trades occur while price stays below the range.`}</Paragraph>
        <Paragraph>{t`No further conversion trades occur while price stays below the range. Health is not being eroded anymore but will be if price re-enters the liquidation zone.`}</Paragraph>
        <Paragraph>{t`Positions get fully liquidated if health reaches 0.`}</Paragraph>
        <Paragraph>{t`You may reduce risk by repaying debt, waiting for price recovery or closing the position and reopening it.`}</Paragraph>
      </Stack>
    }
  >
    {children}
  </Tooltip>
)

export const UserPositionIndicator = ({ market }: { market: LlamaMarket }) => {
  const { softLiquidation, liquidated } = useUserMarketStats(market, LlamaMarketColumnId.UserHealth)?.data ?? {}
  const [colorState, setColorState] = useState<ColorState>('info')

  useEffect(
    // eslint-disable-next-line react-hooks/set-state-in-effect
    () => (softLiquidation ? flickerEffect(setColorState) : liquidated ? setColorState('red') : setColorState('info')),
    [softLiquidation, liquidated],
  )

  const Tooltip = softLiquidation ? TooltipInLiqRange : liquidated ? TooltipBelowLiqRange : TooltipHealthy

  return (
    <Tooltip>
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
