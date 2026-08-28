import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import { copyToClipboardWithToast } from '@evm-ui/hooks/useCopyToClipboard'
import { t } from '@evm-ui/lib/i18n'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import type { PoolRow } from '../types'

export const PoolExpandedPanelActions: ExpandedPanelComponent<PoolRow> = ({ row }) => {
  const pool = row.original
  const path = getPath({ network: pool.network }, `${ROUTE.PAGE_POOLS}/${pool.address}`)

  const actions = [
    // todo: URLs to specific actions don't exist anymore, do we really need these links?
    { id: 'deposit', label: t`Deposit`, href: path, testId: 'pool-link-deposit' },
    { id: 'withdraw', label: t`Withdraw`, href: path },
    { id: 'swap', label: t`Swap`, href: path },
    {
      id: 'copy-pool-address',
      label: t`Copy pool address`,
      onClick: () =>
        void copyToClipboardWithToast({
          copyText: pool.address,
          confirmationText: t`Pool address copied`,
          failureText: t`Failed to copy pool address`,
        }),
      testId: `copy-pool-address-${pool.address}`,
      alwaysInKebabMenu: true,
    },
  ]

  return <ExpandedPanelActions actions={actions} />
}
