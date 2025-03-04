'use client'
import { t } from '@ui-kit/lib/i18n'
import Stack from '@mui/material/Stack'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LastUpdated } from './LastUpdated'
import { Footer } from './Footer'
import { TabPanel } from './TabPanel'
import { Dex } from './Tabs/Dex'
import { LlamaLend } from './Tabs/LlamaLend'
import { CrvUsd } from './Tabs/CrvUsd'
import { SCrvUsd } from './Tabs/SCrvUsd'

const { MaxWidth, Spacing } = SizesAndSpaces

const TABS = [
  { value: 'dex', label: t`Dex` },
  { value: 'lend', label: t`LlamaLend` },
  { value: 'crvusd', label: t`crvUSD` },
  { value: 'scrvusd', label: t`Savings crvUSD` },
] as const

export type DisclaimerTabId = (typeof TABS)[number]['value']

export const Disclaimer = ({ tab, network }: { tab: DisclaimerTabId; network: string }) => (
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
      data-testid="disclaimer"
    >
      <Stack
        direction={{
          mobile: 'column-reverse',
          tablet: 'row',
        }}
        justifyContent="space-between"
        spacing={Spacing.md}
      >
        <TabsSwitcher variant="contained" value={tab} options={[...TABS]} />
        <LastUpdated />
      </Stack>

      <TabPanel>
        {tab === 'dex' && <Dex />}
        {tab === 'lend' && <LlamaLend network={network} />}
        {tab === 'crvusd' && <CrvUsd />}
        {tab === 'scrvusd' && <SCrvUsd />}
        <Footer />
      </TabPanel>
    </Stack>
  </Stack>
)
