import { MouseEvent, useEffect, useMemo, useState } from 'react'
import type { INetworkName as CurveNetworkId } from '@curvefi/api/lib/interfaces'
import type { INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { usePathname, useSearchParams, useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import type { AppName } from '@ui-kit/shared/routes'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { pushSearchParams } from '@ui-kit/utils/urls'
import { LastUpdated } from '../Disclaimer/LastUpdated'
import { TabPanel } from '../Disclaimer/TabPanel'
import { Header } from '../Disclaimer/Section'
import { Footer } from '../Disclaimer/Footer'
import { Dex } from '../Disclaimer/Tabs/Dex'
import { LlamaLend } from '../Disclaimer/Tabs/LlamaLend'
import { CrvUsd } from '../Disclaimer/Tabs/CrvUsd'
import { SCrvUsd } from '../Disclaimer/Tabs/SCrvUsd'
import { Terms } from '../Disclaimer/Tabs/Terms'
import { Grid } from '@mui/material'

const { MaxWidth, Spacing } = SizesAndSpaces

type Tab = 'terms' | 'privacy' | 'disclaimers'
type DisclaimerTab = 'dex' | 'lend' | 'crvusd' | 'scrvusd'

const TABS: TabOption<Tab>[] = [
  { value: 'terms', label: t`Terms & Conditions` },
  { value: 'privacy', label: t`Privacy Policy` },
  { value: 'disclaimers', label: t`Risk Disclaimers` },
]

const DISCLAIMER_TABS: TabOption<DisclaimerTab>[] = [
  { value: 'dex', label: t`Dex` },
  { value: 'lend', label: t`LlamaLend` },
  { value: 'crvusd', label: t`crvUSD` },
  { value: 'scrvusd', label: t`Savings crvUSD` },
]

const defaultDisclaimerTab: Record<AppName, DisclaimerTab> = {
  dao: 'dex',
  crvusd: 'crvusd',
  lend: 'lend',
  llamalend: 'lend',
  dex: 'dex',
}

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
  const tab = searchParams?.get('tab') ?? 'terms'
  const disclaimerTab = searchParams?.get('subtab') ?? defaultDisclaimerTab[currentApp]

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
            {tab === 'terms' && <Terms />}
            {tab === 'privacy' && <Header>{t`Privacy Policy`}</Header>}
          </TabPanel>
        )}
      </Stack>
    </Stack>
  )
}
