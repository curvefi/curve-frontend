import type { ComponentType, ReactNode } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { ParsedUserVaultEvent } from '@/llamalend/features/user-position-history/hooks/useUserVaultEvents'
import { UserVaultEventsTable } from '@/llamalend/features/user-position-history/UserVaultEventsTable'
import { LlamaMonitorBotButton } from '@/llamalend/widgets/LlamaMonitorBotButton'
import { MarketRateType } from '@evm-ui/types/market'
import type { QueryProp } from '@ui/features/queries/util'
import { BorrowPositionDetails } from './BorrowPositionDetails'
import { MarketEmptyPosition } from './MarketEmptyPosition'
import { PositionDetailsCard } from './PositionDetailsCard'
import { SupplyPositionDetails } from './SupplyPositionDetails'

type PositionEvents = {
  [MarketRateType.Borrow]: ParsedUserCollateralEvent[]
  [MarketRateType.Supply]: ParsedUserVaultEvent[]
}

type PositionDetailsCompositeProps<T extends MarketRateType> = {
  type: T
  hasPosition: boolean | undefined
  events: QueryProp<PositionEvents[NoInfer<T>]>
}

const POSITION_CONFIG: {
  [T in MarketRateType]: { Details: ComponentType; renderActivity: (events: QueryProp<PositionEvents[T]>) => ReactNode }
} = {
  [MarketRateType.Borrow]: {
    Details: BorrowPositionDetails,
    renderActivity: events => <UserPositionHistory variant="flat" eventsQuery={events} />,
  },
  [MarketRateType.Supply]: {
    Details: SupplyPositionDetails,
    renderActivity: events => <UserVaultEventsTable eventsQuery={events} />,
  },
}

export const PositionDetailsComposite = <T extends MarketRateType>({
  type,
  hasPosition,
  events,
}: PositionDetailsCompositeProps<T>) => {
  const hasEvents = !!events.data?.length
  const { Details, renderActivity } = POSITION_CONFIG[type]

  return (
    <PositionDetailsCard
      type={type}
      hasPosition={hasPosition}
      hasEvents={hasEvents}
      headerAction={type === MarketRateType.Borrow && <LlamaMonitorBotButton />}
      activity={renderActivity(events)}
    >
      {hasPosition ? <Details /> : <MarketEmptyPosition type={type} />}
    </PositionDetailsCard>
  )
}
