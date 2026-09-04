import type { TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { t } from '@ui/lib/i18n'

export type Tab = 'web3' | 'native'

export const TABS: TabOption<Tab>[] = [
  { value: 'web3', label: t`Web3 Bridges` },
  { value: 'native', label: t`Native Bridges` },
]

export const VALID_TABS = new Set(TABS.map(tab => tab.value))
