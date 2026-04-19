import { useEffect, useState } from 'react'
import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { useUserMarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { Typography } from '@mui/material'
import { UserPositionIndicator, type ColorState } from '@ui-kit/shared/ui/DataTable/UserPositionIndicator'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../../columns'

const { FontWeight } = SizesAndSpaces
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

const setInfo: ColorEffect = (set) => set(() => 'info')
const statusColorEffect: Record<UserPositionStatus, ColorEffect> = {
  healthy: setInfo,
  softLiquidation: flickerEffect,
  incompleteConversion: flickerEffect,
  fullyConverted: flickerEffect,
  hardLiquidation: flickerEffect,
}

export const UserMarketPositionIndicator = ({ market }: { market: LlamaMarket }) => {
  const { status = 'healthy' } = useUserMarketStats(market, LlamaMarketColumnId.UserHealth)?.data ?? {}
  const [colorState, setColorState] = useState<ColorState>('info')

  useEffect(() => statusColorEffect[status](setColorState), [status])

  const positionStatus = status
  const { title, description } = getPositionStatusContent(
    market.assets.collateral.symbol,
    market.assets.borrowed.symbol,
  )[positionStatus]

  return (
    <UserPositionIndicator
      colorState={colorState}
      tooltipTitle={title}
      tooltipBody={
        <Typography variant="bodySRegular" fontWeight={FontWeight.Medium}>
          {description}
        </Typography>
      }
    />
  )
}
