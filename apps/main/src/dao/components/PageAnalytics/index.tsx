import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { PAGE_SPACING } from '@evm-ui/widgets/DetailPageLayout/constants'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Stack from '@mui/material/Stack'
import { CrvStats } from './CrvStats'
import { DailyLocks } from './DailyLocksChart'
import { TopHoldersTable as HoldersTable } from './HoldersTable'
import { TopLockers as TopHolders } from './TopHoldersChart'
import { VeCrcFees as VeCrvFees } from './VeCrvFeesTable'

type Tab = 'fees' | 'holders' | 'locks'
const Holders = () => (
  <Stack sx={{ gap: PAGE_SPACING }}>
    <TopHolders />
    <HoldersTable />
  </Stack>
)

const menu: TabItem<Tab>[] = [
  { value: 'fees', label: t`veCRV Fees`, component: VeCrvFees },
  { value: 'holders', label: t`Holders`, component: Holders },
  { value: 'locks', label: t`Locks`, component: DailyLocks },
]

export const Analytics = () => {
  const { tab, tabs, content, onChange } = useTabs({ menu })

  return (
    <DetailPageLayout formTabs={null} testId="analytics-page">
      <CrvStats />
      <Stack>
        <TabsSwitcher variant="contained" value={tab.value} onChange={onChange} options={tabs} />
        {content}
      </Stack>
    </DetailPageLayout>
  )
}
