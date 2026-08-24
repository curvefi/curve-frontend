import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Stack from '@mui/material/Stack'
import { GaugesList } from './GaugeList'
import { GaugeVoting } from './GaugeVoting'
import { GaugeWeightDistribution } from './GaugeWeightDistribution'

type Tab = 'gaugeList' | 'gaugeVoting'
const menu: TabItem<Tab>[] = [
  { value: 'gaugeList', label: t`Gauges`, component: GaugesList },
  { value: 'gaugeVoting', label: t`Voting`, component: GaugeVoting },
]

export const Gauges = () => {
  const { tab, tabs, content, onChange } = useTabs({ menu })

  return (
    <DetailPageLayout formTabs={null} testId="gauges-page">
      <GaugeWeightDistribution isUserVotes={tab.value === 'gaugeVoting'} />
      <Stack>
        <TabsSwitcher variant="contained" value={tab.value} onChange={onChange} options={tabs} />
        {content}
      </Stack>
    </DetailPageLayout>
  )
}
