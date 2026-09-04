import { type ComponentType, useEffect, useMemo, useState } from 'react'
import { getSearchString, useParams, useSearchParams } from '@evm-ui/hooks/router'
import { findTabValue, type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import type { AppName } from '@evm-ui/shared/routes'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CrvUsd } from './components/disclaimer-tabs/CrvUsd'
import { Dex } from './components/disclaimer-tabs/Dex'
import { LlamaLend } from './components/disclaimer-tabs/LlamaLend'
import { SCrvUsd } from './components/disclaimer-tabs/SCrvUsd'
import { Footer } from './components/general/Footer'
import { LastUpdated } from './components/general/LastUpdated'
import { TabPanel } from './components/general/TabPanel'
import { Privacy } from './components/tabs/Privacy'
import { Terms } from './components/tabs/Terms'
import { DEFAULT_DISCLAIMERS_TABS } from './constants'
import type { DisclaimerTab, Tab } from './types/tabs'

const { MaxWidth, Spacing } = SizesAndSpaces

type LegalPageProps = {
  currentApp: AppName
}

type LegalTab = Tab | DisclaimerTab
type LegalTabsParams = { currentApp: AppName; network: string; searchParams: URLSearchParams }

const Disclaimer = ({ content: Content }: { content: ComponentType }) => (
  <>
    <Content />
    <Footer />
  </>
)

const menu: TabItem<LegalTab, LegalTabsParams>[] = [
  {
    value: 'terms',
    label: t`Terms & Conditions`,
    href: ({ searchParams }) => getSearchString({ tab: 'terms', subtab: null }, searchParams),
    component: ({ currentApp, network }) => <Terms currentApp={currentApp} network={network} />,
  },
  {
    value: 'privacy',
    label: t`Privacy Notice`,
    href: ({ searchParams }) => getSearchString({ tab: 'privacy', subtab: null }, searchParams),
    component: Privacy,
  },
  {
    value: 'disclaimers',
    label: t`Risk Disclaimers`,
    href: ({ searchParams }) => getSearchString({ tab: 'disclaimers' }, searchParams),
    subTabs: [
      {
        value: 'dex',
        label: t`Dex`,
        href: ({ searchParams }) => getSearchString({ tab: 'disclaimers', subtab: 'dex' }, searchParams),
        component: () => <Disclaimer content={Dex} />,
      },
      {
        value: 'lend',
        label: t`LlamaLend`,
        href: ({ searchParams }) => getSearchString({ tab: 'disclaimers', subtab: 'lend' }, searchParams),
        component: () => <Disclaimer content={LlamaLend} />,
      },
      {
        value: 'crvusd',
        label: t`crvUSD`,
        href: ({ searchParams }) => getSearchString({ tab: 'disclaimers', subtab: 'crvusd' }, searchParams),
        component: () => <Disclaimer content={CrvUsd} />,
      },
      {
        value: 'scrvusd',
        label: t`Savings crvUSD`,
        href: ({ searchParams }) => getSearchString({ tab: 'disclaimers', subtab: 'scrvusd' }, searchParams),
        component: () => <Disclaimer content={SCrvUsd} />,
      },
    ],
  },
]

function useAfterHydration(result: string) {
  const [value, setValue] = useState<string>()
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setValue(result), [result]) // only after hydration, otherwise test may click too fast
  return value
}

export const LegalPage = ({ currentApp }: LegalPageProps) => {
  const { network } = useParams<{ network: string }>()
  const searchParams = useSearchParams()
  const tabFromUrl = findTabValue(menu, searchParams.get('tab'))
  const subTabFromUrl = findTabValue(menu, searchParams.get('subtab'))
  const { content, subTab, subTabs, tab, tabs } = useTabs({
    menu,
    params: useMemo(() => ({ currentApp, network, searchParams }), [currentApp, network, searchParams]),
    value: subTabFromUrl ?? (tabFromUrl === 'disclaimers' ? DEFAULT_DISCLAIMERS_TABS[currentApp] : tabFromUrl),
  })

  return (
    <Stack
      sx={{
        alignItems: 'center',
        gap: Spacing.xl,
        marginInline: 'auto',
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
      }}
    >
      <Stack sx={{ maxWidth: MaxWidth.disclaimer, width: '100%' }} data-testid={useAfterHydration('legal-page')}>
        <Stack sx={{ gap: Spacing.md }}>
          <LastUpdated />
          <TabsSwitcher variant="contained" value={tab.value} options={tabs} testIdPrefix="legal-tab" />
        </Stack>

        {subTab && (
          <Stack direction="row" sx={{ justifyContent: 'space-between', backgroundColor: t => t.design.Layer[1].Fill }}>
            <TabsSwitcher
              variant="underlined"
              value={subTab.value}
              options={subTabs}
              testIdPrefix="legal-disclaimer-tab"
            />
            {/* Box with bottom border for consistent underline of the TabsSwitcher */}
            <Box
              sx={{
                flexGrow: 1,
                borderBottom: '1px solid',
                borderColor: t => t.design.Color.Neutral[200],
                display: 'block',
              }}
            />
          </Stack>
        )}
        <TabPanel>{content}</TabPanel>
      </Stack>
    </Stack>
  )
}
