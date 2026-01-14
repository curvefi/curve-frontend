import { ChartBandBalancesSettingsContent } from '@/lend/components/ChartBandBalances/ChartBandBalancesSettingsContent'
import { Icon } from '@ui/Icon'
import { Popover2Dialog, Popover2Trigger as Popover } from '@ui/Popover2'

export const ChartBandBalancesSettings = () => (
  <Popover
    placement="bottom end"
    offset={0}
    label={<Icon name="Settings" size={24} aria-label="chart settings" />}
    showExpandIcon
  >
    <Popover2Dialog>
      <ChartBandBalancesSettingsContent />
    </Popover2Dialog>
  </Popover>
)
