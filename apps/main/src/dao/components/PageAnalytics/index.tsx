import Stack from '@mui/material/Stack'
import { Tabs } from '@ui/components/Tabs/Tabs'
import { PAGE_SPACING } from '@ui/features/layout/DetailPageLayout/constants'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { t } from '@ui/lib/i18n'
import { CrvStats } from './CrvStats'
import { DailyLocks } from './DailyLocksChart'
import { TopHoldersTable as HoldersTable } from './HoldersTable'
import { TopLockers as TopHolders } from './TopHoldersChart'
import { VeCrcFees as VeCrvFees } from './VeCrvFeesTable'

const Holders = () => (
  <Stack sx={{ gap: PAGE_SPACING }}>
    <TopHolders />
    <HoldersTable />
  </Stack>
)

const menu = [
  { value: 'fees', label: t`veCRV Fees`, component: VeCrvFees },
  { value: 'holders', label: t`Holders`, component: Holders },
  { value: 'locks', label: t`Locks`, component: DailyLocks },
]

export const Analytics = () => (
  <DetailPageLayout formTabs={null} testId="analytics-page">
    <CrvStats />
    <Stack>
      <Tabs menu={menu} variant="contained" />
    </Stack>
  </DetailPageLayout>
)
