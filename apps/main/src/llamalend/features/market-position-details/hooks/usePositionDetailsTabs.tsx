import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import type { ParsedUserCollateralEvent } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { MarketRateType } from '@evm-ui/types/market'
import type { QueryProp } from '@evm-ui/types/util'
import Stack from '@mui/material/Stack'
import { BorrowPositionDetails } from '../BorrowPositionDetails'
import { MarketEmptyPosition } from '../MarketEmptyPosition'

type PositionDetailsTabsParams = { events: QueryProp<ParsedUserCollateralEvent[]>; hasPosition: boolean | undefined }

const borrowDetailsTab = ({ hasPosition }: PositionDetailsTabsParams) =>
  hasPosition ? <BorrowPositionDetails /> : <MarketEmptyPosition type={MarketRateType.Borrow} />

const activityTab = ({ events }: PositionDetailsTabsParams) => (
  <Stack>
    <UserPositionHistory variant="flat" eventsQuery={events} />
  </Stack>
)

const menu: TabItem<'borrowDetails' | 'activity', PositionDetailsTabsParams>[] = [
  {
    value: 'borrowDetails',
    label: t`Your position`,
    visible: ({ events, hasPosition }: PositionDetailsTabsParams) => hasPosition !== false || !events.data?.length,
    component: borrowDetailsTab,
  },
  {
    value: 'activity',
    label: t`Activity`,
    visible: ({ events }: PositionDetailsTabsParams) => !!events.data?.length,
    component: activityTab,
  },
]

export const usePositionDetailsTabs = ({ events, hasPosition }: PositionDetailsTabsParams) =>
  useTabs({ menu, params: { events, hasPosition } })
