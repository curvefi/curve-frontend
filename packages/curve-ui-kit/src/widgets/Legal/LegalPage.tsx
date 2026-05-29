import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { getSearchString, useSearchParams } from '@ui-kit/hooks/router'
import type { AppName } from '@ui-kit/shared/routes'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CrvUsd } from './components/disclaimer-tabs/CrvUsd'
import { Dex } from './components/disclaimer-tabs/Dex'
import { LlamaLend } from './components/disclaimer-tabs/LlamaLend'
import { SCrvUsd } from './components/disclaimer-tabs/SCrvUsd'
import { Footer } from './components/general/Footer'
import { LastUpdated } from './components/general/LastUpdated'
import { TabPanel } from './components/general/TabPanel'
import { Privacy } from './components/tabs/Privacy'
import { Terms } from './components/tabs/Terms'
import { TABS, DISCLAIMER_TABS, VALID_TABS, VALID_DISCLAIMER_TABS, DEFAULT_DISCLAIMERS_TABS } from './constants'
import type { Tab, DisclaimerTab } from './types/tabs'

const { MaxWidth, Spacing } = SizesAndSpaces

interface LegalPageProps {
  currentApp: AppName
}

function useAfterHydration(result: string) {
  const [value, setValue] = useState<string>()
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setValue(result), [result]) // only after hydration, otherwise test may click too fast
  return value
}

export const LegalPage = ({ currentApp }: LegalPageProps) => {
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab')
  const tab: Tab = tabParam !== null && VALID_TABS.has(tabParam as Tab) ? (tabParam as Tab) : 'terms'
  const subtabParam = searchParams?.get('subtab')
  const disclaimerTab: DisclaimerTab =
    subtabParam !== null && VALID_DISCLAIMER_TABS.has(subtabParam as DisclaimerTab)
      ? (subtabParam as DisclaimerTab)
      : DEFAULT_DISCLAIMERS_TABS[currentApp]

  const tabs = useMemo(
    () => [
      ...TABS.map(({ value, ...props }) => ({ ...props, value, href: getSearchString({ tab: value }, searchParams) })),
    ],
    [searchParams],
  )

  const disclaimerTabs = useMemo(
    () => [
      ...DISCLAIMER_TABS.map(({ value, ...props }) => ({
        ...props,
        value,
        href: getSearchString({ tab: 'disclaimers', subtab: value }, searchParams),
      })),
    ],
    [searchParams],
  )

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
          <TabsSwitcher variant="contained" value={tab} options={tabs} testIdPrefix="legal-tab" />
        </Stack>

        {tab === 'disclaimers' ? (
          <>
            <Stack
              direction={'row'}
              sx={{ justifyContent: 'space-between', backgroundColor: t => t.design.Layer[1].Fill }}
            >
              <TabsSwitcher
                variant="underlined"
                value={disclaimerTab}
                options={disclaimerTabs}
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
            <TabPanel>
              {{ dex: <Dex />, lend: <LlamaLend />, crvusd: <CrvUsd />, scrvusd: <SCrvUsd /> }[disclaimerTab]}
              <Footer />
            </TabPanel>
          </>
        ) : (
          <TabPanel>{{ terms: <Terms />, privacy: <Privacy /> }[tab]}</TabPanel>
        )}
      </Stack>
    </Stack>
  )
}
