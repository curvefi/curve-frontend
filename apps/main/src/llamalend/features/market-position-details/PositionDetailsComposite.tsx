import { type UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { LlamaMonitorBotButton } from '@/llamalend/widgets/LlamaMonitorBotButton'
import Stack from '@mui/material/Stack'
import { findTab } from '@ui-kit/hooks/useTabs'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'

export const PositionDetailsComposite = ({
  hasPosition,
  market,
  params,
  events,
}: {
  hasPosition: boolean | undefined
  market: LlamaMarketTemplate | undefined
  params: UserMarketParams
  events: QueryProp<UserCollateralEvents>
}) => {
  const { tab, onTabChange, tabOptions } = usePositionDetailsTabs({
    events: mapQuery(events, e => e.events),
    hasPosition,
    market,
    params,
  })

  const activeTab = findTab(tabOptions, tab)

  return (
    <Stack>
      <Stack alignItems="end" direction="row" justifyContent="space-between" width="100%">
        <TabsSwitcher variant="contained" value={tab} onChange={onTabChange} options={tabOptions} />
        <LlamaMonitorBotButton />
      </Stack>
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{activeTab.render()}</Stack>
    </Stack>
  )
}
