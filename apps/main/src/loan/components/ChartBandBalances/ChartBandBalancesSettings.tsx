import ChartBandBalancesSettingsContent from '@/loan/components/ChartBandBalances/ChartBandBalancesSettingsContent'
import Icon from '@ui/Icon'
import Popover, { Popover2Dialog } from '@ui/Popover2'

const ChartBandBalancesSettings = () => (
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

export default ChartBandBalancesSettings
