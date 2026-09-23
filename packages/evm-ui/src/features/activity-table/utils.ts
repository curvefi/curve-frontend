import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import { scanTxPath } from '@legacy-ui/utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'

export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE_START_INDEX = 1

export const getVaultEventChange = ({ deposit, withdrawal }: VaultEvent) => {
  const sign = deposit ? 1 : -1
  return { amounts: deposit ?? withdrawal, sign, valueColor: sign > 0 ? 'success' : 'error' } as const
}
export const getTransactionActions = (chainId: number, txHash?: string | null) =>
  notFalsy(
    maybe(
      txHash,
      txHash =>
        ({
          id: 'view-transaction',
          label: t`View Transaction`,
          href: scanTxPath(chainId, txHash),
          size: 'extraSmall',
          color: 'ghost',
        }) as const,
    ),
  )
