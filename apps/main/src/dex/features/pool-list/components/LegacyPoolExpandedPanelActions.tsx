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

  const actions = [
    // todo: URLs to specific actions don't exist anymore, do we really need these links?
    { id: 'deposit', label: t`Deposit`, href: path, testId: 'pool-link-deposit' },
    { id: 'withdraw', label: t`Withdraw`, href: path },
    { id: 'swap', label: t`Swap`, href: path },
  ]

  return <ExpandedPanelActions actions={actions} />
}
