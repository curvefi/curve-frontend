import { MouseEvent, useEffect, useMemo, useState } from 'react'
import type { INetworkName as CurveNetworkId } from '@curvefi/api/lib/interfaces'
import type { INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { Grid } from '@mui/material'
import { usePathname, useSearchParams, useParams } from '@ui-kit/hooks/router'
import type { AppName } from '@ui-kit/shared/routes'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { pushSearchParams } from '@ui-kit/utils/urls'
import { LastUpdated } from './components/general/LastUpdated'
import { TabPanel } from './components/general/TabPanel'
import { Footer } from './components/general/Footer'
import { Dex } from './components/disclaimer-tabs/Dex'
import { LlamaLend } from './components/disclaimer-tabs/LlamaLend'
import { CrvUsd } from './components/disclaimer-tabs/CrvUsd'
import { SCrvUsd } from './components/disclaimer-tabs/SCrvUsd'
import { Terms } from './components/tabs/Terms'
import { Privacy } from './components/tabs/Privacy'
import { TABS, DISCLAIMER_TABS, VALID_TABS, VALID_DISCLAIMER_TABS, DEFAULT_DISCLAIMERS_TABS } from './constants'
import type { Tab, DisclaimerTab } from './types/tabs'

const { MaxWidth, Spacing } = SizesAndSpaces

export type LegalPageProps = {
  currentApp: AppName
}

function useAfterHydration(result: string) {
  const [value, setValue] = useState<string>()
  useEffect(() => setValue(result), [result]) // only after hydration, otherwise test may click too fast
  return value
}

export const LegalPage = ({ currentApp }: LegalPageProps) => {
  const { network } = useParams() as { network: CurveNetworkId | LlamaNetworkId }
  const pathname = usePathname()
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
        href: { query: { tab: value }, pathname },
        onClick: (e: MouseEvent<HTMLAnchorElement>) => pushSearchParams(e, { tab: value }),
      })),
    ],
    [pathname],
  )

  const disclaimerTabs = useMemo(
    () => [
      ...DISCLAIMER_TABS.map(({ value, ...props }) => ({
        ...props,
        value,
        href: { query: { tab: 'disclaimers', subtab: value }, pathname },
        onClick: (e: MouseEvent<HTMLAnchorElement>) => pushSearchParams(e, { subtab: value }),
      })),
    ],
    [pathname],
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
          paddingInline: Spacing.md,
        }}
        data-testid={useAfterHydration('legal-page')}
      >
        <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
          <Grid size={8}>
            <TabsSwitcher variant="contained" fullWidth value={tab} options={tabs} />
          </Grid>
          <Grid size={4} display="flex" justifyContent="flex-end">
            <LastUpdated />
          </Grid>
        </Grid>
        {tab === 'disclaimers' ? (
          <>
            <Stack
              direction={{
                mobile: 'column-reverse',
                tablet: 'row',
              }}
              justifyContent="space-between"
              spacing={Spacing.md}
              sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
            >
              <TabsSwitcher variant="underlined" value={disclaimerTab} options={disclaimerTabs} />
            </Stack>
            <TabPanel>
              {disclaimerTab === 'dex' && <Dex />}
              {disclaimerTab === 'lend' && <LlamaLend currentApp={currentApp} network={network} />}
              {disclaimerTab === 'crvusd' && <CrvUsd />}
              {disclaimerTab === 'scrvusd' && <SCrvUsd />}
              <Footer />
            </TabPanel>
          </>
        ) : (
          <TabPanel>
            {tab === 'terms' && <Terms currentApp={currentApp} network={network} />}
            {tab === 'privacy' && <Privacy currentApp={currentApp} network={network} />}
          </TabPanel>
        )}
      </Stack>
    </Stack>
  )
}
