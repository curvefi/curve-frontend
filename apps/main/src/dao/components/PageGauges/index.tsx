import { useState } from 'react'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { LegacyDetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/LegacyDetailPageLayout'
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
    <LegacyDetailPageLayout formTabs={null} testId="gauges-page">
      <GaugeWeightDistribution isUserVotes={tab === 'gaugeVoting'} />
      <Stack>
        <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />
        {tab === 'gaugeList' && <GaugesList />}
        {tab === 'gaugeVoting' && <GaugeVoting />}
      </Stack>
    </LegacyDetailPageLayout>
  )
}
