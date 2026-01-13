import { MouseEvent, useMemo } from 'react'
import Stack from '@mui/material/Stack'
import { useSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { pushSearchParams } from '@ui-kit/utils/urls'
import { TabPanel } from '@ui-kit/widgets/Legal/components/general/TabPanel'
import { NATIVE_BRIDGES, WEB3_BRIDGES } from './bridges'
import { BridgeOverview } from './components/BridgeOverview'
import { TABS, VALID_TABS, type Tab } from './constants'

const { Spacing } = SizesAndSpaces

export const PageBridges = () => {
  const tabParam = useSearchParams()?.get('tab')
  const tab: Tab = tabParam !== null && VALID_TABS.has(tabParam as Tab) ? (tabParam as Tab) : 'web3'

  const tabs = useMemo(
    () => [
      ...TABS.map(({ value, ...props }) => ({
        ...props,
        value,
        href: { query: { tab: value } },
        onClick: (e: MouseEvent<HTMLAnchorElement>) => pushSearchParams(e, { tab: value }),
      })),
    ],
    [],
  )

  return (
    <Stack
      data-testid="bridge-page"
      sx={{
        marginInline: 'auto',
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
      }}
    >
      <TabsSwitcher variant="contained" value={tab} options={tabs} muiVariant="scrollable" />
      <TabPanel sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md }}>
        {tab === 'web3' && <BridgeOverview bridges={WEB3_BRIDGES} title={t`Aggregators for the best routes`} />}

        {tab === 'native' && (
          <BridgeOverview bridges={NATIVE_BRIDGES} title={t`Trust & security with chain canonical bridges`} />
        )}
      </TabPanel>
    </Stack>
  )
}
