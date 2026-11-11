import { useEffect, useState } from 'react'
import {
  POSITION_STATUS_BADGE,
  POSITION_STATUS_DESCRIPTION,
} from '@/llamalend/features/market-position-details/health/position-status'
import type { PositionStatus } from '@/llamalend/health.utils'
import type { UserPositionStatusKey } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useLlamalendPositionTables } from '@evm-ui/hooks/useFeatureFlags'
import { Typography } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { UserPositionIndicator, type ColorState } from '@ui/features/tables/UserPositionIndicator'
import { Duration } from '@ui/features/themes/design/0_primitives'
import { t } from '@ui/lib/i18n'

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

type ColorEffect = (set: (value: (prev: ColorState) => ColorState) => void) => void | (() => void)

const setInfo: ColorEffect = set => set(() => 'info')
const statusColorEffect: Record<UserPositionStatusKey, ColorEffect> = {
  healthy: setInfo,
  softLiquidation: flickerEffect,
  incompleteConversion: flickerEffect,
  fullyConverted: flickerEffect,
  hardLiquidation: flickerEffect,
}

const positionStatusColorEffect: Record<PositionStatus, ColorEffect> = {
  liquidatable: flickerEffect,
  inRange: flickerEffect,
  belowRange: flickerEffect,
  nearRange: setInfo,
  aboveRange: setInfo,
}

export const UserMarketPositionIndicator = ({ market }: { market: LlamaMarketRow }) => {
  const isPositionHealth = useLlamalendPositionTables()
  // No status while the stats load or after they failed, and supply positions have no stats
  const { legacyStatus, positionHealth } = market.positionQueries.stats.data ?? {}
  const [colorState, setColorState] = useState<ColorState>('info')

  const colorEffect =
    (isPositionHealth
      ? maybe(positionHealth, ({ status }) => positionStatusColorEffect[status])
      : maybe(legacyStatus, status => statusColorEffect[status])) ?? setInfo
  useEffect(() => colorEffect(setColorState), [colorEffect])

  const legacyContent =
    legacyStatus &&
    getPositionStatusContent(market.assets.collateral.symbol, market.assets.borrowed.symbol)[legacyStatus]

  return (
    <UserPositionIndicator
      colorState={colorState}
      tooltipTitle={
        (isPositionHealth
          ? maybe(positionHealth, ({ status }) => POSITION_STATUS_BADGE[status].label)
          : legacyContent?.title) ?? t`Position active`
      }
      tooltipBody={
        isPositionHealth ? (
          <TooltipWrapper>
            {(
              maybe(positionHealth, ({ status }) => POSITION_STATUS_DESCRIPTION[status]) ?? [
                t`You have an active position in this market.`,
              ]
            ).map(text => (
              <TooltipDescription key={text} text={text} />
            ))}
          </TooltipWrapper>
        ) : (
          <Typography variant="bodySRegular" sx={{ fontWeight: t => t.typography.fontWeightMedium }}>
            {legacyContent?.description ?? t`You have an active position in this market.`}
          </Typography>
        )
      }
    />
  )
}
