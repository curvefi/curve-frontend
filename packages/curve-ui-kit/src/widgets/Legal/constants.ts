import { t } from '@ui-kit/lib/i18n'
import type { AppName } from '@ui-kit/shared/routes'
import type { TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
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

export const VALID_TABS = new Set(TABS.map((tab) => tab.value))
export const VALID_DISCLAIMER_TABS = new Set(DISCLAIMER_TABS.map((tab) => tab.value))

export const DEFAULT_DISCLAIMERS_TABS: Record<AppName, DisclaimerTab> = {
  dao: 'dex',
  crvusd: 'crvusd',
  lend: 'lend',
  llamalend: 'lend',
  dex: 'dex',
  bridge: 'dex',
  analytics: 'dex',
}
