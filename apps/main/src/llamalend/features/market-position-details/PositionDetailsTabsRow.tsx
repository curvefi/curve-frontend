import Stack from '@mui/material/Stack'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import type { PositionDetailsTab } from './hooks/usePositionDetailsTabs'
import { LlamaMonitorBotLinkButton } from './LlamaMonitorBotLinkButton'

type PositionDetailsTabsRowProps = {
  value: PositionDetailsTab
  onChange: (value: PositionDetailsTab) => void
  options: readonly TabOption<PositionDetailsTab>[]
}

export const PositionDetailsTabsRow = ({ value, onChange, options }: PositionDetailsTabsRowProps) => (
  <Stack alignItems="end" direction="row" justifyContent="space-between" width="100%">
    <TabsSwitcher variant="contained" value={value} onChange={onChange} options={options} />
    <LlamaMonitorBotLinkButton />
  </Stack>
)
