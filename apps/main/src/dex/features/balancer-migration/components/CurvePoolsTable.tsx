import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { evmAddressDisplay, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
import { Badge } from '@ui/components/Badge'
import { PoolBadges } from '@ui/features/pool-list/cells/PoolTitleCell/PoolBadges'
import { POOL_COLUMNS, PoolColumnId } from '@ui/features/pool-list/columns'
import { createPoolTableMeta, getPoolTableMeta } from '@ui/features/pool-list/table-meta'
import type { PoolAlerts, PoolRow } from '@ui/features/pool-list/types'
import type { QueryProp } from '@ui/features/queries/util'
import { createAppColumnHelper, useCurveTable } from '@ui/features/tables/data-table.utils'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { t } from '@ui/lib/i18n'
import { MigrationPoolCell } from './MigrationPoolCell'
import { MigrationTableDescription } from './MigrationTableDescription'

const columnHelper = createAppColumnHelper<PoolRow>()
const getPoolColumn = (id: PoolColumnId) =>
  assert(
    POOL_COLUMNS.find(column => column.id === id),
    id,
  )

const COLUMNS = columnHelper.columns([
  columnHelper.accessor('name', {
    header: t`Pool`,
    // Rows keep the ranking order (sorting is disabled), so the first row is the recommendation.
    cell: ({ row: { original: pool, index }, table }) => (
      <MigrationPoolCell
        blockchainId={pool.blockchainId}
        tokens={pool.tradeableCoins}
        name={pool.name}
        badges={
          <>
            {index === 0 && <Badge size="extraSmall" color="highlight" label={t`Recommended`} />}
            <PoolBadges pool={pool} alerts={getPoolTableMeta(table).alerts} />
          </>
        }
      />
    ),
  }),
  { ...getPoolColumn(PoolColumnId.Tvl), header: t`Total liquidity` },
  getPoolColumn(PoolColumnId.NetRate),
])

export const CurvePoolsTable = ({
  query,
  alerts,
  selectedAddress,
  onSelect,
  onReload,
  isFetching,
}: {
  query: QueryProp<PoolRow[]>
  alerts: PoolAlerts
  selectedAddress: Address | undefined
  onSelect: (pool: PoolRow) => void
  onReload: () => Promise<unknown>
  isFetching: boolean
}) => {
  const table = useCurveTable({
    columns: COLUMNS,
    query,
    meta: createPoolTableMeta({
      variant: 'full',
      alerts,
      addressDisplay: evmAddressDisplay,
      crvToken: { address: MAINNET_CRV.address, blockchainId: MAINNET_CRV.chain },
      onRowClick: onSelect,
      isRowSelected: ({ address }) => address === selectedAddress,
    }),
    getRowId: ({ address }) => address,
    enableSorting: false,
  })
  return (
    <Stack data-testid="balancer-migration-targets">
      <TableHeader title={t`Matching Curve pools`} onReload={onReload} isLoading={isFetching} />
      <EvmDataTable
        category="detail"
        table={table}
        emptyState={{ title: t`No matching Curve pool`, description: t`No Curve pool holds these tokens yet.` }}
        errorState={{ title: t`Couldn't load Curve pools`, onReload }}
      >
        <MigrationTableDescription>{t`Select a target Curve pool to migrate to`}</MigrationTableDescription>
      </EvmDataTable>
    </Stack>
  )
}
