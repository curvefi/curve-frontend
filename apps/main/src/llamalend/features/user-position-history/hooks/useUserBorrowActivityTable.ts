import { getActivityToken } from '@/llamalend/llama.utils'
import { ACTIVITY_COLUMNS } from '@evm-ui/features/activity-table/columns/columns.definitions'
import { ActivityColumnId } from '@evm-ui/features/activity-table/columns/columns.enum'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import type { ActivityRow, ActivityTokenDelta } from '@evm-ui/features/activity-table/types'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { BlockchainIds } from '@evm-ui/utils/network'
import { notFalsy } from '@primitives/objects.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { ParsedUserBorrowEvent } from './useUserBorrowEvents'

const toActivityRow = ({
  chainId,
  txHash,
  timestamp,
  user: address,
  type,
  collateralToken,
  collateralChange,
  collateralChangeUsd,
  borrowToken,
  loanChange,
  loanChangeUsd,
}: ParsedUserBorrowEvent): ActivityRow | undefined => {
  const blockchainId = BlockchainIds[chainId]
  if (!blockchainId) return

  const deltas = notFalsy<ActivityTokenDelta>(
    !!collateralChange && {
      label: t`Collateral`,
      token: getActivityToken(blockchainId, collateralToken),
      amount: collateralChange,
      amountUsd: collateralChangeUsd ?? null,
    },
    !!loanChange && {
      label: t`Debt`,
      token: getActivityToken(blockchainId, borrowToken),
      amount: loanChange,
      amountUsd: loanChangeUsd ?? null,
      amountColor: loanChange > 0 ? 'error' : 'success',
    },
  )

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action: { label: type },
    valueUsd: deltas.length === 1 ? deltas[0]?.amountUsd : undefined,
    deltas,
  }
}

export const useUserBorrowActivityTable = (eventsQuery: QueryProp<ParsedUserBorrowEvent[]>) => {
  const query = mapQuery(eventsQuery, events =>
    events.flatMap(event => notFalsy(toActivityRow(event))).toSorted((a, b) => b.timestamp - a.timestamp),
  )
  const columnVisibility = useActivityVisibility(
    { hasValue: true },
    {
      desktop: { [ActivityColumnId.Address]: false },
      mobile: { [ActivityColumnId.Value]: false, [ActivityColumnId.Amount]: true },
    },
  )

  return {
    table: useCurveTable({
      query,
      columns: ACTIVITY_COLUMNS,
      state: { columnVisibility },
      initialState: { pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE } },
    }),
    emptyState: { title: t`No events found` },
    errorState: { title: t`Could not load events` },
  }
}
