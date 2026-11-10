import { useEffect, useState } from 'react'
import type { UserPositionStatusKey } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { Typography } from '@mui/material'
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

export const UserMarketPositionIndicator = ({ market }: { market: LlamaMarketRow }) => {
  // No status while the stats load or after they failed, and supply positions have no stats
  const { legacyStatus: status } = market.positionQueries.stats.data ?? {}
  const [colorState, setColorState] = useState<ColorState>('info')

  useEffect(() => (status ? statusColorEffect[status](setColorState) : setInfo(setColorState)), [status])

  const content =
    status && getPositionStatusContent(market.assets.collateral.symbol, market.assets.borrowed.symbol)[status]

  return (
    <UserPositionIndicator
      colorState={colorState}
      tooltipTitle={content?.title ?? t`Position active`}
      tooltipBody={
        <Typography variant="bodySRegular" sx={{ fontWeight: t => t.typography.fontWeightMedium }}>
          {content?.description ?? t`You have an active position in this market.`}
        </Typography>
      }
    />
  )
}
