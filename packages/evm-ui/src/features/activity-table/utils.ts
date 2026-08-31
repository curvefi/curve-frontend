import { t } from '@evm-ui/lib/i18n'
import { notFalsy } from '@primitives/objects.utils'

export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE_START_INDEX = 1

export const getTransactionActions = (url?: string | null) =>
  notFalsy(
    url &&
      ({ id: 'view-transaction', label: t`View Transaction`, href: url, size: 'extraSmall', color: 'ghost' } as const),
  )
