import type { Address } from '@primitives/address.utils'
import { ExpandedPanelActions } from '@ui/features/tables/ExpandedPanelActions'
import { copyToClipboardWithToast } from '@ui/hooks/useCopyToClipboard'
import { t } from '@ui/lib/i18n'

export const PoolExpandedPanelActions = ({
  poolAddress,
  path,
  formatAddress,
}: {
  poolAddress: Address
  path: string
  formatAddress: (address: string) => string
}) => (
  <ExpandedPanelActions
    actions={[
      { id: 'deposit', label: t`Deposit`, href: path, state: { defaultTab: 'deposit' }, testId: 'pool-link-deposit' },
      { id: 'withdraw', label: t`Withdraw`, href: path, state: { defaultTab: 'withdraw' } },
      { id: 'swap', label: t`Swap`, href: path, state: { defaultTab: 'swap' } },
      {
        id: 'copy-pool-address',
        label: t`Copy pool address`,
        onClick: () =>
          void copyToClipboardWithToast({
            copyText: poolAddress,
            format: formatAddress,
            confirmationText: t`Pool address copied`,
            failureText: t`Failed to copy pool address`,
          }),
        testId: `copy-pool-address-${poolAddress}`,
        alwaysInKebabMenu: true,
      },
    ]}
  />
)
