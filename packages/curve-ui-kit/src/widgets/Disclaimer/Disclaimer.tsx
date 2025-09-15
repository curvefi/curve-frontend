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
import { Footer } from './Footer'
import { LastUpdated } from './LastUpdated'
import { TabPanel } from './TabPanel'
import { CrvUsd } from './Tabs/CrvUsd'
import { Dex } from './Tabs/Dex'
import { LlamaLend } from './Tabs/LlamaLend'
import { SCrvUsd } from './Tabs/SCrvUsd'

const { MaxWidth, Spacing } = SizesAndSpaces

type Tab = 'dex' | 'lend' | 'crvusd' | 'scrvusd'
const TABS: TabOption<Tab>[] = [
  { value: 'dex', label: t`Dex` },
  { value: 'lend', label: t`LlamaLend` },
  { value: 'crvusd', label: t`crvUSD` },
  { value: 'scrvusd', label: t`Savings crvUSD` },
]

const defaultTab: Record<AppName, Tab> = {
  dao: 'dex',
  crvusd: 'crvusd',
  lend: 'lend',
  llamalend: 'lend',
  dex: 'dex',
}

export type DisclaimerProps = {
  currentApp: AppName
}

function useAfterHydration(result: string) {
  const [value, setValue] = useState<string>()
  useEffect(() => setValue(result), [result]) // only after hydration, otherwise test may click too fast
  return value
}

export const Disclaimer = ({ currentApp }: DisclaimerProps) => {
  const { network } = useParams() as { network: CurveNetworkId | LlamaNetworkId }
  const pathname = usePathname()
  const tab = useSearchParams()?.get('tab') ?? defaultTab[currentApp]
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
