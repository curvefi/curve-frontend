import { getActivityToken } from '@/llamalend/llama.utils'
import { ActivityColumnId } from '@evm-ui/features/activity-table/columns/columns.enum'
import { useActivityTable } from '@evm-ui/features/activity-table/hooks/useActivityTable'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import type { ActivityRow } from '@evm-ui/features/activity-table/types'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { BlockchainIds } from '@evm-ui/utils/network'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { ParsedUserSupplyEvent } from './useUserSupplyEvents'

const actions = {
  Deposit: { label: t`Supply` },
  Withdraw: { label: t`Withdraw` },
  TransferIn: { label: t`Transfer in` },
  TransferOut: { label: t`Transfer out` },
} satisfies Record<ParsedUserSupplyEvent['type'], ActivityRow['action']>

const toActivityRow = ({
  chainId,
  txHash,
  timestamp,
  user: address,
  type,
  amount,
  shareChange,
  borrowToken,
  vaultToken,
}: ParsedUserSupplyEvent): ActivityRow | undefined => {
  const blockchainId = BlockchainIds[chainId]
  if (!blockchainId) return undefined

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action: actions[type],
    valueUsd: undefined,
    deltas: notFalsy(
      maybe(amount, amount => ({
        label: t`Amount`,
        token: getActivityToken(blockchainId, borrowToken),
        amount: Number(amount),
      })),
      { label: t`Shares`, token: getActivityToken(blockchainId, vaultToken), amount: Number(shareChange) },
    ),
  }
}

export const useUserSupplyActivityTable = (eventsQuery: QueryProp<ParsedUserSupplyEvent[]>) => {
  const query = mapQuery(eventsQuery, events =>
    events.flatMap(event => notFalsy(toActivityRow(event))).toSorted((a, b) => b.timestamp - a.timestamp),
  )
  const columnVisibility = useActivityVisibility({ hasValue: false }, { [ActivityColumnId.Address]: false })

  return {
    table: useActivityTable({
      query,
      state: { columnVisibility },
      initialState: { pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE } },
    }),
    emptyState: { title: t`No events found` },
    errorState: { title: t`Could not load events` },
  }
}
