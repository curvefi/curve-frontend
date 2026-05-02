import { useState, useEffect } from 'react'
import { useStore } from '@/dao/store/useStore'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
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
  const getVeCrvHolders = useStore(state => state.analytics.getVeCrvHolders)
  const veCrvHolders = useStore(state => state.analytics.veCrvHolders)
  const [tab, setTab] = useState<Tab>('fees')

  useEffect(() => {
    if (veCrvHolders.topHolders.length === 0 && veCrvHolders.fetchStatus !== 'ERROR') {
      void getVeCrvHolders()
    }
  }, [getVeCrvHolders, veCrvHolders.topHolders.length, veCrvHolders.fetchStatus])

  return (
    <DetailPageLayout formTabs={null} testId="gauges-page">
      <CrvStats />
      <Stack>
        <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />
        {tab === 'fees' && <VeCrvFees />}
        {tab === 'holders' && (
          <Stack gap={PAGE_SPACING}>
            <TopHolders />
            <HoldersTable />
          </Stack>
        )}
        {tab === 'locks' && <DailyLocks />}
      </Stack>
    </DetailPageLayout>
  )
}
