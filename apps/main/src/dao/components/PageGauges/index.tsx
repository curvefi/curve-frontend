import { useState } from 'react'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher, type TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Stack from '@mui/material/Stack'
import { GaugesList } from './GaugeList'
import { GaugeVoting } from './GaugeVoting'
import { GaugeWeightDistribution } from './GaugeWeightDistribution'

type Tab = 'gaugeList' | 'gaugeVoting'
const tabs: TabOption<Tab>[] = [
  { value: 'gaugeList', label: t`Gauges` },
  { value: 'gaugeVoting', label: t`Voting` },
]

export const Gauges = () => {
  const [tab, setTab] = useState<Tab>('gaugeList')

  return (
    <DetailPageLayout formTabs={null} testId="gauges-page">
      <GaugeWeightDistribution isUserVotes={tab === 'gaugeVoting'} />
      <Stack>
        <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />
        {tab === 'gaugeList' && <GaugesList />}
        {tab === 'gaugeVoting' && <GaugeVoting />}
      </Stack>
    </DetailPageLayout>
  )
}
