import type { ComponentType } from 'react'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { ParsedUserVaultEvent } from '@/llamalend/features/user-position-history/hooks/useUserVaultEvents'
import { UserEventsTable } from '@/llamalend/features/user-position-history/UserEventsTable'
import { UserPositionLiquidationNote } from '@/llamalend/features/user-position-history/UserPositionLiquidationNote'
import { UserVaultEventsTable } from '@/llamalend/features/user-position-history/UserVaultEventsTable'
import { LlamaMonitorBotButton } from '@/llamalend/widgets/LlamaMonitorBotButton'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { EvmErrorMessage } from '@evm-ui/shared/ui/EvmErrorMessage'
import { MarketRateType } from '@evm-ui/types/market'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { WithSkeleton } from '@ui/components/WithSkeleton'
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
  [T in MarketRateType]: { type: T; position: QueryProp<boolean>; events: QueryProp<PositionEvents[T]> }
}[MarketRateType]

const { Spacing } = SizesAndSpaces

const BorrowActivity = ({ eventsQuery }: { eventsQuery: QueryProp<ParsedUserCollateralEvent[]> }) => (
  <>
    <UserEventsTable eventsQuery={eventsQuery} />
    <CardContent>
      <UserPositionLiquidationNote />
    </CardContent>
  </>
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

const PositionTab = ({ type, position: { data: hasPosition, isLoading, error } }: PositionDetailsCompositeProps) => {
  const { Details } = POSITION_CONFIG[type]
  return (
    <Card size="small">
      <CardContent>
        {hasPosition ? (
          <Details />
        ) : error && hasPosition === undefined ? (
          <EvmErrorMessage title={t`Could not load your position`} subtitle={error.message} error={error} size="sm" />
        ) : (
          <WithSkeleton loading={isLoading} variant="rectangular" sx={{ width: '100%', maxWidth: 'none' }}>
            <MarketEmptyPosition type={type} />
          </WithSkeleton>
        )}
      </CardContent>
    </Card>
  )
}

const ActivityTab = <T extends MarketRateType>({ type, events }: { type: T; events: QueryProp<PositionEvents[T]> }) => {
  const { Activity } = POSITION_CONFIG[type]
  return (
    <Card size="small">
      <Activity eventsQuery={events} />
    </Card>
  )
}

const POSITION_TABS: TabItem<string, PositionDetailsCompositeProps>[] = [
  {
    value: 'position',
    label: t`Your position`,
    visible: ({ position, events }) => position.data !== false || !events.data?.length,
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
            {isNewLlamalendHealth && props.position.data && (
              <PositionDetailsToggle disabled={tab.value !== 'position'} />
            )}
          </Stack>
        )}
      </Stack>
      {content}
    </Stack>
  )
}
