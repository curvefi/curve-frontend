import { useMemo, useState } from 'react'
import { ActivityTable } from '@evm-ui/features/activity-table'
import type { SortingState } from '@tanstack/react-table'
import type { QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { USER_VAULT_HISTORY_COLUMNS } from './columns/vault-column.definitions'
import type { ParsedUserVaultEvent } from './hooks/useUserVaultEvents'
import { VaultRowExpandedPanel } from './VaultRowExpandedPanel'

const pagination = { pageIndex: 0, pageSize: 50 }
const defaultSort = [{ id: 'timestamp', desc: true }]

export const UserVaultEventsTable = ({ eventsQuery }: { eventsQuery: QueryProp<ParsedUserVaultEvent[]> }) => {
  const isMobile = useIsMobile()
  const columnVisibility = useMemo(() => (isMobile ? { amount: false, shareChange: false } : undefined), [isMobile])
  const [sorting, setSorting] = useState<SortingState>(defaultSort)
  const table = useCurveTable({
    query: eventsQuery,
    columns: USER_VAULT_HISTORY_COLUMNS,
    state: { columnVisibility, sorting },
    initialState: { pagination },
    onSortingChange: setSorting,
  })
  return (
    <ActivityTable
      table={table}
      emptyState={{ title: t`No events found` }}
      errorState={{ title: t`Could not load events` }}
      expandedPanel={{ Body: VaultRowExpandedPanel }}
    />
  )
}
