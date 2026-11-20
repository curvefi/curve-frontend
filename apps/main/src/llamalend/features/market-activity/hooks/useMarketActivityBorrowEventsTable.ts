import { sumBy } from 'lodash'
import { getActivityToken } from '@/llamalend/llama.utils'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import type { Chain } from '@curvefi/prices-api'
import type { LlammaEvent } from '@curvefi/prices-api/llamma'
import { ACTIVITY_COLUMNS } from '@evm-ui/features/activity-table/columns/columns.definitions'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import type { ActivityRow, ActivityToken, ActivityTokenDelta } from '@evm-ui/features/activity-table/types'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { getPageCount } from '@evm-ui/utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { loadingQ } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { MarketBorrowActivityProps } from '../types'

export type MarketBorrowEventRow = LlammaEvent & {
  chainId: number
  blockchainId: Chain
  collateralToken: ActivityToken | undefined
  borrowToken: ActivityToken | undefined
}

const getDeltas = (event: MarketBorrowEventRow): ActivityTokenDelta[] => {
  if (event.type === 'deposit') {
    const { amount, amountUsd } = event.deposit
    return notFalsy(!!amount && { label: t`Collateral`, token: event.collateralToken, amount, amountUsd })
  }

  const { amountCollateral, amountCollateralUsd, amountBorrowed, amountBorrowedUsd } = event.withdrawal
  return notFalsy(
    !!amountCollateral && {
      label: t`Collateral`,
      token: event.collateralToken,
      amount: -amountCollateral,
      amountUsd: maybe(amountCollateralUsd, x => -x) ?? null,
    },
    !!amountBorrowed && {
      label: t`Borrowed`,
      token: event.borrowToken,
      amount: -amountBorrowed,
      amountUsd: maybe(amountBorrowedUsd, x => -x) ?? null,
    },
  )
}

export const toActivityRow = (event: MarketBorrowEventRow): ActivityRow => {
  const { chainId, blockchainId, txHash, timestamp, provider: address, type } = event
  const deltas = getDeltas(event)
  const valueUsd =
    deltas.length && deltas.every(({ amountUsd }) => amountUsd != null)
      ? sumBy(deltas, ({ amountUsd }) => Math.abs(amountUsd ?? 0))
      : null

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action: type === 'deposit' ? { label: t`Deposit`, color: 'success' } : { label: t`Withdraw`, color: 'error' },
    valueUsd: type === 'deposit' ? valueUsd : (maybe(valueUsd, x => -x) ?? null),
    deltas,
  }
}

export const useMarketActivityBorrowEventsTable = ({
  chainId,
  blockchainId,
  collateralToken,
  borrowToken,
  ammAddress: llamma,
  endpoint,
}: MarketBorrowActivityProps) => {
  const columnVisibility = useActivityVisibility({ hasValue: true })
  const { pagination, onPaginationChange, apiPage: page } = useManualPagination()

  const eventsQuery = useLlammaEvents({ blockchainId, llamma, endpoint, page, perPage: DEFAULT_PAGE_SIZE })

  const query = combineQueries([eventsQuery, loadingQ(llamma)], ({ events }) =>
    events.map(event =>
      toActivityRow({
        ...event,
        chainId,
        blockchainId,
        collateralToken: getActivityToken(blockchainId, collateralToken),
        borrowToken: getActivityToken(blockchainId, borrowToken),
      }),
    ),
  )

  return {
    table: useCurveTable({
      query,
      columns: ACTIVITY_COLUMNS,
      state: { columnVisibility, pagination },
      manualPagination: true,
      pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
      onPaginationChange,
    }),
    emptyState: { title: t`No activity data found.` },
    errorState: { title: t`Could not load activity data.` },
  }
}
