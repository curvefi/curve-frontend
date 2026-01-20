import { t } from '@ui-kit/lib/i18n'
import type { TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'

export type Tab = 'web3' | 'native'

export const TABS: TabOption<Tab>[] = [
  { value: 'web3', label: t`Web3 Bridges` },
  { value: 'native', label: t`Native Bridges` },
]

export const VALID_TABS = new Set(TABS.map((tab) => tab.value))
