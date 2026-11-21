import type { ComponentType, ReactNode } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserBorrowEvent } from '@/llamalend/features/user-position-history/hooks/useUserBorrowEvents'
import type { ParsedUserSupplyEvent } from '@/llamalend/features/user-position-history/hooks/useUserSupplyEvents'
import { UserSupplyEventsTable } from '@/llamalend/features/user-position-history/UserSupplyEventsTable'
import { LlamaMonitorBotButton } from '@/llamalend/widgets/LlamaMonitorBotButton'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { MarketRateType } from '@evm-ui/types/market'
import Stack from '@mui/material/Stack'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { BorrowPositionDetails } from './BorrowPositionDetails'
import { MarketEmptyPosition } from './MarketEmptyPosition'
import { PositionDetailsCard } from './PositionDetailsCard'
import { PositionDetailsToggle } from './PositionDetailsToggle'
import { SupplyPositionDetails } from './SupplyPositionDetails'

type PositionEvents = {
  [MarketRateType.Borrow]: ParsedUserBorrowEvent[]
  [MarketRateType.Supply]: ParsedUserSupplyEvent[]
}

type PositionDetailsCompositeProps<T extends MarketRateType> = {
  type: T
  hasPosition: boolean | undefined
  events: QueryProp<PositionEvents[NoInfer<T>]>
}

const { Spacing } = SizesAndSpaces

const POSITION_CONFIG: {
  [T in MarketRateType]: { Details: ComponentType; renderActivity: (events: QueryProp<PositionEvents[T]>) => ReactNode }
} = {
  [MarketRateType.Borrow]: {
    Details: BorrowPositionDetails,
    renderActivity: events => <UserPositionHistory variant="flat" eventsQuery={events} />,
  },
  [MarketRateType.Supply]: {
    Details: SupplyPositionDetails,
    renderActivity: events => <UserSupplyEventsTable eventsQuery={events} />,
  },
}

export const PositionDetailsComposite = <T extends MarketRateType>({
  type,
  hasPosition,
  events,
}: PositionDetailsCompositeProps<T>) => {
  const isNewLlamalendHealth = useNewLlamalendHealth()
  const hasEvents = !!events.data?.length
  const { Details, renderActivity } = POSITION_CONFIG[type]

  return (
    <PositionDetailsCard
      type={type}
      hasPosition={hasPosition}
      hasEvents={hasEvents}
      headerAction={
        type === MarketRateType.Borrow && (
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <LlamaMonitorBotButton />
            {isNewLlamalendHealth && hasPosition && <PositionDetailsToggle />}
          </Stack>
        )
      }
      activity={renderActivity(events)}
    >
      {hasPosition ? <Details /> : <MarketEmptyPosition type={type} />}
    </PositionDetailsCard>
  )
}
