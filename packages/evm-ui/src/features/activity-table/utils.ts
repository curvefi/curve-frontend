import { t } from '@evm-ui/lib/i18n'
import { scanTxPath } from '@legacy-ui/utils'
import { maybe, notFalsy } from '@primitives/objects.utils'

export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE_START_INDEX = 1

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
