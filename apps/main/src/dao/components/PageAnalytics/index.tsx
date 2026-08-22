import { useState } from 'react'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher, type TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { PAGE_SPACING } from '@evm-ui/widgets/DetailPageLayout/constants'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Stack from '@mui/material/Stack'
import { CrvStats } from './CrvStats'
import { DailyLocks } from './DailyLocksChart'
import { TopHoldersTable as HoldersTable } from './HoldersTable'
import { TopLockers as TopHolders } from './TopHoldersChart'
import { VeCrcFees as VeCrvFees } from './VeCrvFeesTable'

type Tab = 'fees' | 'holders' | 'locks'
const tabs: TabOption<Tab>[] = [
  { value: 'fees', label: t`veCRV Fees` },
  { value: 'holders', label: t`Holders` },
  { value: 'locks', label: t`Locks` },
]

export const Analytics = () => {
  const [tab, setTab] = useState<Tab>('fees')

  return (
    <DetailPageLayout formTabs={null} testId="analytics-page">
      <CrvStats />
      <Stack>
        <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />
        {tab === 'fees' && <VeCrvFees />}
        {tab === 'holders' && (
          <Stack sx={{ gap: PAGE_SPACING }}>
            <TopHolders />
            <HoldersTable />
          </Stack>
        )}
        {tab === 'locks' && <DailyLocks />}
      </Stack>
    </DetailPageLayout>
  )
}
