import type { ComponentType } from 'react'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { ParsedUserVaultEvent } from '@/llamalend/features/user-position-history/hooks/useUserVaultEvents'
import { UserVaultEventsTable } from '@/llamalend/features/user-position-history/UserVaultEventsTable'
import { LlamaMonitorBotButton } from '@/llamalend/widgets/LlamaMonitorBotButton'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { MarketRateType } from '@evm-ui/types/market'
import Stack from '@mui/material/Stack'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { type TabItem, useTabs } from '@ui/hooks/useTabs'
import { t } from '@ui/lib/i18n'
import { BorrowPositionDetails } from './BorrowPositionDetails'
import { MarketEmptyPosition } from './MarketEmptyPosition'
import { PositionDetailsToggle } from './PositionDetailsToggle'
import { SupplyPositionDetails } from './SupplyPositionDetails'

type PositionEvents = {
  [MarketRateType.Borrow]: ParsedUserCollateralEvent[]
  [MarketRateType.Supply]: ParsedUserVaultEvent[]
}

type PositionDetailsCompositeProps = {
  [T in MarketRateType]: { type: T; hasPosition: boolean | undefined; events: QueryProp<PositionEvents[T]> }
}[MarketRateType]

const { Spacing } = SizesAndSpaces

const BorrowActivity = ({ eventsQuery }: { eventsQuery: QueryProp<ParsedUserCollateralEvent[]> }) => (
  <UserPositionHistory variant="flat" eventsQuery={eventsQuery} />
)

const POSITION_CONFIG: {
  [T in MarketRateType]: {
    Details: ComponentType
    Activity: ComponentType<{ eventsQuery: QueryProp<PositionEvents[T]> }>
  }
} = {
  [MarketRateType.Borrow]: { Details: BorrowPositionDetails, Activity: BorrowActivity },
  [MarketRateType.Supply]: { Details: SupplyPositionDetails, Activity: UserVaultEventsTable },
}

const PositionTab = ({ type, hasPosition }: PositionDetailsCompositeProps) => {
  const { Details } = POSITION_CONFIG[type]
  return hasPosition ? <Details /> : <MarketEmptyPosition type={type} />
}

const ActivityTab = <T extends MarketRateType>({ type, events }: { type: T; events: QueryProp<PositionEvents[T]> }) => {
  const { Activity } = POSITION_CONFIG[type]
  return <Activity eventsQuery={events} />
}

const POSITION_TABS: TabItem<string, PositionDetailsCompositeProps>[] = [
  {
    value: 'position',
    label: t`Your position`,
    visible: ({ hasPosition, events }) => hasPosition !== false || !events.data?.length,
    component: PositionTab,
  },
  { value: 'activity', label: t`Activity`, visible: ({ events }) => !!events.data?.length, component: ActivityTab },
]

export const PositionDetailsComposite = (props: PositionDetailsCompositeProps) => {
  const isNewLlamalendHealth = useNewLlamalendHealth()
  const { tab, tabs, onChange, content } = useTabs({ menu: POSITION_TABS, params: props })

  return (
    <Stack>
      <Stack direction="row" sx={{ alignItems: 'end', justifyContent: 'space-between', width: '100%' }}>
        <TabsSwitcher variant="contained" value={tab.value} onChange={onChange} options={tabs} />
        {props.type === MarketRateType.Borrow && (
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <LlamaMonitorBotButton />
            {isNewLlamalendHealth && props.hasPosition && <PositionDetailsToggle />}
          </Stack>
        )}
      </Stack>
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{content}</Stack>
    </Stack>
  )
}
