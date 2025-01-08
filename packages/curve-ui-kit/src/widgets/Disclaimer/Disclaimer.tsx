import { t } from '@lingui/macro'

import Stack from '@mui/material/Stack'

import { TabsSwitcher } from 'curve-ui-kit/src/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { useTabFromQueryString } from 'curve-ui-kit/src/hooks/useTabFromQueryString'

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

type Props = {
  className?: string
}

export const Disclaimer = ({ className }: Props) => {
  const { tab, setTab } = useTabFromQueryString(TABS, 'dex')

  return (
    <Stack
      className={className}
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
        <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={[...TABS]} />
        <LastUpdated />
      </Stack>

      <TabPanel>
        {tab === 'dex' && <Dex />}
        {tab === 'lend' && <LlamaLend />}
        {tab === 'crvusd' && <CrvUsd />}
        {tab === 'scrvusd' && <SCrvUsd />}
        <Footer />
      </TabPanel>
    </Stack>
  )
}
