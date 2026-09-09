import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import { tryChecksumAddress } from '@evm-ui/utils'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { copyToClipboardWithToast } from '@ui/hooks/useCopyToClipboard'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../types'

export const PoolExpandedPanelActions: ExpandedPanelComponent<PoolRow> = ({ row }) => {
  const pool = row.original
  const path = getPath({ network: pool.blockchainId }, `${ROUTE.PAGE_POOLS}/${pool.address}`)

  /** Pool form paths were removed; mobile expanded rows still need direct links to a specific pool form. */
  const actions = [
    { id: 'deposit', label: t`Deposit`, href: path, state: { defaultTab: 'deposit' }, testId: 'pool-link-deposit' },
    { id: 'withdraw', label: t`Withdraw`, href: path, state: { defaultTab: 'withdraw' } },
    { id: 'swap', label: t`Swap`, href: path, state: { defaultTab: 'swap' } },
    {
      id: 'copy-pool-address',
      label: t`Copy pool address`,
      onClick: () =>
        void copyToClipboardWithToast({
          copyText: pool.address,
          format: tryChecksumAddress,
          confirmationText: t`Pool address copied`,
          failureText: t`Failed to copy pool address`,
        }),
      testId: `copy-pool-address-${pool.address}`,
      alwaysInKebabMenu: true,
    },
  ]

  return <ExpandedPanelActions actions={actions} />
}
