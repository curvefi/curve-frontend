import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import { copyToClipboardWithToast } from '@ui-kit/hooks/useCopyToClipboard'
import { t } from '@ui-kit/lib/i18n'
import { ExpandedPanelActions } from '@ui-kit/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import type { PoolListItem } from '../poolList.types'

export const PoolListMobileExpandedPanelActions: ExpandedPanelComponent<PoolListItem> = ({ row }) => {
  const pool = row.original
  const path = getPath({ network: pool.network }, `${ROUTE.PAGE_POOLS}/${pool.address}`)

  const actions = [
    {
      id: 'deposit',
      label: t`Deposit`,
      href: path + ROUTE.PAGE_POOL_DEPOSIT,
      testId: 'pool-link-deposit',
    },
    { id: 'withdraw', label: t`Withdraw`, href: path + ROUTE.PAGE_POOL_WITHDRAW },
    { id: 'swap', label: t`Swap`, href: path + ROUTE.PAGE_SWAP },
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
