import type { AppName } from '@evm-ui/shared/routes'
import type { TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { t } from '@ui/lib/i18n'
import type { Tab, DisclaimerTab } from './types/tabs'

export const TABS: TabOption<Tab>[] = [
  { value: 'terms', label: t`Terms & Conditions` },
  { value: 'privacy', label: t`Privacy Notice` },
  { value: 'disclaimers', label: t`Risk Disclaimers` },
]

export const DISCLAIMER_TABS: TabOption<DisclaimerTab>[] = [
  { value: 'dex', label: t`Dex` },
  { value: 'lend', label: t`LlamaLend` },
  { value: 'crvusd', label: t`crvUSD` },
  { value: 'scrvusd', label: t`Savings crvUSD` },
]

export const DEFAULT_DISCLAIMERS_TABS: Record<AppName, DisclaimerTab> = {
  dao: 'dex',
  crvusd: 'crvusd',
  lend: 'lend',
  llamalend: 'lend',
  dex: 'dex',
  bridge: 'dex',
  analytics: 'dex',
}
