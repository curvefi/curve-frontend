import { LlamaMonitorBotButton } from '@/llamalend/widgets/LlamaMonitorBotButton'
import Stack from '@mui/material/Stack'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import type { PositionDetailsTab } from './hooks'

interface PositionDetailsTabsRowProps {
  tab: PositionDetailsTab
  onChange: (value: PositionDetailsTab) => void
  options: readonly TabOption<PositionDetailsTab>[]
}

export const PositionDetailsTabsRow = ({ tab, onChange, options }: PositionDetailsTabsRowProps) => (
  <Stack direction="row" sx={{ alignItems: 'end', justifyContent: 'space-between', width: '100%' }}>
    <TabsSwitcher variant="contained" value={tab} onChange={onChange} options={options} />
    <LlamaMonitorBotButton />
  </Stack>
)
