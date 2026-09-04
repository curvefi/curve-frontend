import { type ReactNode, useMemo } from 'react'
import { getSearchString, useSearchParams } from '@evm-ui/hooks/router'
import { useTabFromSearchParam } from '@evm-ui/hooks/useTabs'
import { Tabs } from '@evm-ui/shared/ui/Tabs/Tabs'
import { TabPanel } from '@evm-ui/widgets/Legal/components/general/TabPanel'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { NATIVE_BRIDGES, WEB3_BRIDGES } from './bridges'
import { BridgeOverview } from './components/BridgeOverview'

const { Spacing } = SizesAndSpaces

const Web3BridgesTab = () => <BridgeOverview bridges={WEB3_BRIDGES} title={t`Aggregators for the best routes`} />
const NativeBridgesTab = () => (
  <BridgeOverview bridges={NATIVE_BRIDGES} title={t`Trust & security with chain canonical bridges`} />
)
const BridgeTabPanel = ({ children }: { children: ReactNode }) => (
  <TabPanel sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md }}>{children}</TabPanel>
)

type BridgeTabsParams = { searchParams: URLSearchParams }

const menu = [
  {
    value: 'web3',
    label: t`Web3 Bridges`,
    href: ({ searchParams }: BridgeTabsParams) => getSearchString({ tab: 'web3' }, searchParams),
    component: Web3BridgesTab,
  },
  {
    value: 'native',
    label: t`Native Bridges`,
    href: ({ searchParams }: BridgeTabsParams) => getSearchString({ tab: 'native' }, searchParams),
    component: NativeBridgesTab,
  },
]

export const Bridges = () => {
  const searchParams = useSearchParams()
  const tabValue = useTabFromSearchParam(menu)

  return (
    <Stack data-testid="bridges">
      <Tabs
        menu={menu}
        params={useMemo(() => ({ searchParams }), [searchParams])}
        value={tabValue}
        variant="contained"
        ContentWrapper={BridgeTabPanel}
      />
    </Stack>
  )
}
