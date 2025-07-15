'use client'
import { MouseEvent, useEffect, useMemo, useState } from 'react'
import type { INetworkName as CurveNetworkId } from '@curvefi/api/lib/interfaces'
import type { INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { useLocation, useSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import type { AppName } from '@ui-kit/shared/routes'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { pushSearchParams } from '@ui-kit/utils/urls'
import { Footer } from './Footer'
import { LastUpdated } from './LastUpdated'
import { TabPanel } from './TabPanel'
import { CrvUsd } from './Tabs/CrvUsd'
import { Dex } from './Tabs/Dex'
import { LlamaLend } from './Tabs/LlamaLend'
import { SCrvUsd } from './Tabs/SCrvUsd'

const { MaxWidth, Spacing } = SizesAndSpaces

const TABS = [
  { value: 'dex', label: t`Dex` },
  { value: 'lend', label: t`LlamaLend` },
  { value: 'crvusd', label: t`crvUSD` },
  { value: 'scrvusd', label: t`Savings crvUSD` },
] as const

type DisclaimerTab = (typeof TABS)[number]['value']

const defaultTab: Record<AppName, DisclaimerTab> = {
  dao: 'dex',
  crvusd: 'crvusd',
  lend: 'lend',
  llamalend: 'lend',
  dex: 'dex',
}

export type DisclaimerProps = {
  network: CurveNetworkId | LlamaNetworkId
  currentApp: AppName
}

function useAfterHydration(result: string) {
  const [value, setValue] = useState<string>()
  useEffect(() => setValue(result), [result]) // only after hydration, otherwise test may click too fast
  return value
}

export const Disclaimer = ({ network, currentApp }: DisclaimerProps) => {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const [tab] = params?.get('tab') ?? defaultTab[currentApp]
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
          paddingInline: Spacing.md,
        }}
        data-testid={useAfterHydration('disclaimer')}
      >
        <Stack
          direction={{
            mobile: 'column-reverse',
            tablet: 'row',
          }}
          justifyContent="space-between"
          spacing={Spacing.md}
        >
          <TabsSwitcher variant="contained" value={tab} options={tabs} />
          <LastUpdated />
        </Stack>

        <TabPanel>
          {tab === 'dex' && <Dex />}
          {tab === 'lend' && <LlamaLend currentApp={currentApp} network={network} />}
          {tab === 'crvusd' && <CrvUsd />}
          {tab === 'scrvusd' && <SCrvUsd />}
          <Footer />
        </TabPanel>
      </Stack>
    </Stack>
  )
}
