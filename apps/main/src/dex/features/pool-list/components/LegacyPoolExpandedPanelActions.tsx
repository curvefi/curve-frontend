import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import { t } from '@evm-ui/lib/i18n'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import type { LegacyPoolRow } from '../types'

export const LegacyPoolExpandedPanelActions: ExpandedPanelComponent<LegacyPoolRow> = ({ row }) => {
  const {
    pool: { id: poolId },
    network,
  } = row.original
  const path = getPath({ network }, `${ROUTE.PAGE_POOLS}/${poolId}`)

  /** Pool form paths were removed; mobile expanded rows still need direct links to a specific pool form. */
  const actions = [
    {
      id: 'deposit',
      label: t`Deposit`,
      href: path,
      state: { defaultTab: 'deposit' },
      testId: 'pool-link-deposit',
    },
    { id: 'withdraw', label: t`Withdraw`, href: path, state: { defaultTab: 'withdraw' } },
    { id: 'swap', label: t`Swap`, href: path, state: { defaultTab: 'swap' } },
  ]

  return <ExpandedPanelActions actions={actions} />
}
