import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanelAction, ExpandedPanelContext, TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'

export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PAGE_START_INDEX = 1

export const getTransactionActions = (url?: string | null): readonly ExpandedPanelAction[] =>
  notFalsy(url && { id: 'view-transaction', label: t`View Transaction`, href: url, size: 'extraSmall', color: 'ghost' })

export const getTransactionExpandedPanelActions = <T extends TableItem & { txUrl?: string | null }>({
  row: {
    original: { txUrl },
  },
}: ExpandedPanelContext<T>) => getTransactionActions(txUrl)
