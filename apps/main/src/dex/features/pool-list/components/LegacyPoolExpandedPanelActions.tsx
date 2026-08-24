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
    {
      id: 'deposit',
      label: t`Deposit`,
      href: path + ROUTE.PAGE_POOL_DEPOSIT,
      testId: 'pool-link-deposit',
    },
    { id: 'withdraw', label: t`Withdraw`, href: path + ROUTE.PAGE_POOL_WITHDRAW },
    { id: 'swap', label: t`Swap`, href: path + ROUTE.PAGE_SWAP },
  ]

  return <ExpandedPanelActions actions={actions} />
}
