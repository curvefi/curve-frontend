import { MouseEvent, useEffect, useMemo, useState } from 'react'
import type { INetworkName as CurveNetworkId } from '@curvefi/api/lib/interfaces'
import type { INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { Grid, Box } from '@mui/material'
import Stack from '@mui/material/Stack'
import { useSearchParams, useParams } from '@ui-kit/hooks/router'
import type { AppName } from '@ui-kit/shared/routes'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { pushSearchParams } from '@ui-kit/utils/urls'
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

export type LegalPageProps = {
  currentApp: AppName
}

function useAfterHydration(result: string) {
  const [value, setValue] = useState<string>()
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setValue(result), [result]) // only after hydration, otherwise test may click too fast
  return value
}

export const LegalPage = ({ currentApp }: LegalPageProps) => {
  const { network } = useParams() as { network: CurveNetworkId | LlamaNetworkId }
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
      ...TABS.map(({ value, ...props }) => ({
        ...props,
        value,
        href: { query: { tab: value } },
        onClick: (e: MouseEvent<HTMLAnchorElement>) => pushSearchParams(e, { tab: value }),
      })),
    ],
    [],
  )

  const disclaimerTabs = useMemo(
    () => [
      ...DISCLAIMER_TABS.map(({ value, ...props }) => ({
        ...props,
        value,
        href: { query: { tab: 'disclaimers', subtab: value } },
        onClick: (e: MouseEvent<HTMLAnchorElement>) => pushSearchParams(e, { subtab: value }),
      })),
    ],
    [],
  )

  return (
    <Stack
      alignItems="center"
      gap={Spacing.xl}
      sx={{
        marginInline: 'auto',
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
      }}
    >
      <Stack
        sx={{
          maxWidth: MaxWidth.disclaimer,
          width: '100%',
        }}
        data-testid={useAfterHydration('legal-page')}
      >
        <Grid container direction="column" spacing={Spacing.md}>
          <Grid size={12} justifyContent="flex-start">
            <LastUpdated />
          </Grid>
          <Grid size={12}>
            <TabsSwitcher variant="contained" value={tab} options={tabs} />
          </Grid>
        </Grid>

        {tab === 'disclaimers' ? (
          <>
            <Stack
              direction={'row'}
              justifyContent="space-between"
              sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
            >
              <TabsSwitcher variant="underlined" value={disclaimerTab} options={disclaimerTabs} />
              {/* Box with bottom border for consistent underline of the TabsSwitcher */}
              <Box
                sx={{
                  flexGrow: 1,
                  borderBottom: '1px solid',
                  borderColor: (t) => t.design.Color.Neutral[200],
                  display: 'block',
                }}
              />
            </Stack>
            <TabPanel>
              {disclaimerTab === 'dex' && <Dex currentApp={currentApp} network={network} />}
              {disclaimerTab === 'lend' && <LlamaLend currentApp={currentApp} network={network} />}
              {disclaimerTab === 'crvusd' && <CrvUsd currentApp={currentApp} network={network} />}
              {disclaimerTab === 'scrvusd' && <SCrvUsd currentApp={currentApp} network={network} />}
              <Footer />
            </TabPanel>
          </>
        ) : (
          <TabPanel>
            {tab === 'terms' && <Terms currentApp={currentApp} network={network} />}
            {tab === 'privacy' && <Privacy />}
          </TabPanel>
        )}
      </Stack>
    </Stack>
  )
}
