import { useMemo } from 'react'
import { LLAMA_MONITOR_BOT_URL } from '@/llamalend/constants'
import {
  useUserCollateralEvents,
  type UserCollateralEventsProps,
} from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Stack from '@mui/material/Stack'
import { findTab } from '@ui-kit/hooks/useTabs'
import { t } from '@ui-kit/lib/i18n'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import type { BorrowPositionDetailsProps } from './BorrowPositionDetails'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'

export const PositionDetailsComposite = ({
  hasPosition,
  borrowPositionDetails,
  activityQueryParams,
}: {
  hasPosition: boolean | undefined
  borrowPositionDetails: BorrowPositionDetailsProps
  activityQueryParams: UserCollateralEventsProps
}) => {
  const {
    data: userCollateralEvents,
    isLoading: activityIsLoading,
    isError: activityIsError,
  } = useUserCollateralEvents(activityQueryParams)
  const activityEvents = useMemo(() => userCollateralEvents?.events ?? [], [userCollateralEvents?.events])

  const { tab, onTabChange, tabOptions } = usePositionDetailsTabs({
    events: activityEvents,
    hasPosition,
    borrowPositionDetails,
    activityIsLoading,
    activityIsError,
  })
  const activeTab = findTab(tabOptions, tab)

  return (
    <Stack>
      <Stack alignItems="end" direction="row" justifyContent="space-between" width="100%">
        <TabsSwitcher variant="contained" value={tab} onChange={onTabChange} options={tabOptions} />
        <ExternalLink
          href={LLAMA_MONITOR_BOT_URL}
          label={t`Get alerts`}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          startIcon={<NotificationsIcon />}
        />
      </Stack>
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>{activeTab.render()}</Stack>
    </Stack>
  )
}
