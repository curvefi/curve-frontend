import { type UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { LlamaMonitorBotButton } from '@/llamalend/widgets/LlamaMonitorBotButton'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import Stack from '@mui/material/Stack'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'

export const PositionDetailsComposite = ({
  hasPosition,
  events,
}: {
  hasPosition: boolean | undefined
  events: QueryProp<UserCollateralEvents>
}) => {
  const { tab, tabs, onChange, content } = usePositionDetailsTabs({
    events: mapQuery(events, e => e.events),
    hasPosition,
  })

  return (
    <Stack>
      <Stack direction="row" sx={{ alignItems: 'end', justifyContent: 'space-between', width: '100%' }}>
        <TabsSwitcher variant="contained" value={tab.value} onChange={onChange} options={tabs} />
        <LlamaMonitorBotButton />
      </Stack>
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{content}</Stack>
    </Stack>
  )
}
