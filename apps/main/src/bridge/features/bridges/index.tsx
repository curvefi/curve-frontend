import { getSearchString, useSearchParams } from '@evm-ui/hooks/router'
import { useTabFromSearchParam, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { TabPanel } from '@evm-ui/widgets/Legal/components/general/TabPanel'
import Stack from '@mui/material/Stack'
import { NATIVE_BRIDGES, WEB3_BRIDGES } from './bridges'
import { BridgeOverview } from './components/BridgeOverview'

const { Spacing } = SizesAndSpaces

const Web3BridgesTab = () => <BridgeOverview bridges={WEB3_BRIDGES} title={t`Aggregators for the best routes`} />
const NativeBridgesTab = () => (
  <BridgeOverview bridges={NATIVE_BRIDGES} title={t`Trust & security with chain canonical bridges`} />
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
  const { tab, tabs, content } = useTabs({ menu, params: { searchParams }, value: tabValue })

  return (
    <Stack data-testid="bridges">
      <TabsSwitcher variant="contained" value={tab.value} options={tabs} />
      <TabPanel sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md }}>{content}</TabPanel>
    </Stack>
  )
}
