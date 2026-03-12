import Stack from '@mui/material/Stack'
import { useSearchParams } from '@ui-kit/hooks/router'
import { useUpdateSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TabPanel } from '@ui-kit/widgets/Legal/components/general/TabPanel'
import { NATIVE_BRIDGES, WEB3_BRIDGES } from './bridges'
import { BridgeOverview } from './components/BridgeOverview'
import { TABS, VALID_TABS, type Tab } from './constants'

const { Spacing } = SizesAndSpaces

export const Bridges = () => {
  const updateSearchParams = useUpdateSearchParams()
  const tabParam = useSearchParams()?.get('tab')
  const tab: Tab = tabParam !== null && VALID_TABS.has(tabParam as Tab) ? (tabParam as Tab) : 'web3'

  return (
    <Stack data-testid="bridges">
      <TabsSwitcher
        variant="contained"
        value={tab}
        options={TABS}
        onChange={(value) => updateSearchParams({ tab: value })}
      />
      <TabPanel sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md }}>
        {tab === 'web3' && <BridgeOverview bridges={WEB3_BRIDGES} title={t`Aggregators for the best routes`} />}

        {tab === 'native' && (
          <BridgeOverview bridges={NATIVE_BRIDGES} title={t`Trust & security with chain canonical bridges`} />
        )}
      </TabPanel>
    </Stack>
  )
}
