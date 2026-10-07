import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { Badge } from '@ui/components/Badge'
import { TokenInfo } from '@ui/components/TokenInfo'
import type { QueryProp } from '@ui/features/queries/util'
import { createAppColumnHelper, useCurveTable } from '@ui/features/tables/data-table.utils'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { t } from '@ui/lib/i18n'
import type { BalancerPosition } from '../api/balancer.api'
import { MigrationPoolCell } from './MigrationPoolCell'
import { MigrationTableDescription } from './MigrationTableDescription'

const columnHelper = createAppColumnHelper<BalancerPosition>()

const getStakedUsd = ({ totalBalanceUsd, walletBalanceUsd }: BalancerPosition['userBalance']) =>
  totalBalanceUsd - walletBalanceUsd

const createColumns = (blockchainId: string) =>
  columnHelper.columns([
    columnHelper.accessor('name', {
      header: t`Pool`,
      cell: ({ row: { original: position } }) => (
        <MigrationPoolCell
          blockchainId={blockchainId}
          tokens={position.poolTokens.map(
            ({ underlyingToken, address, symbol }) => underlyingToken ?? { address, symbol },
          )}
          name={position.name}
          badges={
            <>
              <Badge size="extraSmall" label={t`Balancer v${position.protocolVersion}`} />
              <Badge size="extraSmall" label={position.type} />
              {getStakedUsd(position.userBalance) > 0.01 && (
                <Badge size="extraSmall" color="warning" label={t`Staked`} />
              )}
            </>
          }
        />
      ),
    }),
    columnHelper.accessor(({ userBalance }) => userBalance.totalBalanceUsd, {
      id: 'lpAmount',
      header: t`LP Amount`,
      cell: ({ row: { original: position } }) => (
        <TokenInfo
          icon={null}
          iconPosition="right"
          primary={formatNumber(Number(position.userBalance.totalBalance), 'token.balance')}
          secondary={formatNumber(position.userBalance.totalBalanceUsd, 'usd.notional')}
          boldPrimary
          sx={{ justifyContent: 'end' }}
        />
      ),
      meta: { type: 'numeric' },
    }),
  ])

export const BalancerPositionsTable = ({
  blockchainId,
  query,
  selectedId,
  onSelect,
  onReload,
  isFetching,
}: {
  blockchainId: string
  query: QueryProp<BalancerPosition[]>
  selectedId: string | undefined
  onSelect: (position: BalancerPosition) => void
  onReload: () => Promise<unknown>
  isFetching: boolean
}) => {
  const table = useCurveTable({
    columns: createColumns(blockchainId),
    query,
    meta: { onRowClick: onSelect, isRowSelected: ({ id }) => id === selectedId },
    getRowId: ({ id }) => id,
    enableSorting: false,
  })
  return (
    <Stack data-testid="balancer-migration-positions">
      <TableHeader title={t`Your Balancer positions`} onReload={onReload} isLoading={isFetching} />
      <EvmDataTable
        category="detail"
        table={table}
        emptyState={{
          title: t`No Balancer positions`,
          description: t`This wallet has no Balancer liquidity on this network.`,
        }}
        errorState={{ title: t`Couldn't load Balancer positions`, onReload }}
      >
        <MigrationTableDescription>{t`Select a Balancer pool to migrate from`}</MigrationTableDescription>
      </EvmDataTable>
    </Stack>
  )
}
