import { useMemo } from 'react'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { Badge } from '@ui/components/Badge'
import { TokenInfo } from '@ui/components/TokenInfo'
import { TooltipDescription } from '@ui/components/TooltipComponents'
import type { QueryProp } from '@ui/features/queries/util'
import { createAppColumnHelper, useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { isInRange } from '../api/uniswap.api'
import type { UniswapPositionRow } from '../hooks/useUniswapPositionRows'
import { formatFeeTier, UNISWAP_FEE_APR_DESCRIPTION } from '../migration.utils'
import { MigrationPoolCell } from './MigrationPoolCell'
import { MigrationTableTitle } from './MigrationTableTitle'

const columnHelper = createAppColumnHelper<UniswapPositionRow>()

const createColumns = (blockchainId: string) =>
  columnHelper.columns([
    columnHelper.accessor('name', {
      header: t`Pool`,
      cell: ({ row: { original: position } }) => (
        <MigrationPoolCell
          protocol="uniswap"
          blockchainId={blockchainId}
          tokens={position.tokens}
          name={position.name}
          badges={
            <>
              <Badge size="extraSmall" label={t`v3 · ${formatFeeTier(position.fee)}`} />
              {isInRange(position) ? (
                <Badge size="extraSmall" color="active" label={t`In range`} />
              ) : (
                <Badge size="extraSmall" color="warning" label={t`Out of range`} />
              )}
            </>
          }
        />
      ),
    }),
    // Unclaimed fees are collected by the migration, so they count towards the value.
    columnHelper.accessor('totalUsd', {
      header: t`Value`,
      cell: ({ row: { original: position } }) => (
        <TokenInfo
          icon={null}
          iconPosition="right"
          primary={formatNumber(position.totalUsd, 'usd.notional')}
          secondary={`#${position.tokenId}`}
          boldPrimary
          sx={{ justifyContent: 'end' }}
        />
      ),
      meta: { type: 'numeric' },
    }),
    columnHelper.accessor('feeApr', {
      header: t`Fee APR`,
      cell: ({ getValue }) => formatNumber(getValue(), 'percent.rate'),
      meta: {
        type: 'numeric',
        variant: 'tableCellValueStrong',
        tooltip: { title: t`Estimated fee APR`, body: <TooltipDescription text={UNISWAP_FEE_APR_DESCRIPTION} /> },
      },
    }),
  ])

export const UniswapPositionsTable = ({
  blockchainId,
  query,
  selectedId,
  onSelect,
  onReload,
}: {
  blockchainId: string
  query: QueryProp<UniswapPositionRow[]>
  selectedId: string | undefined
  onSelect: (position: UniswapPositionRow) => void
  onReload: () => Promise<unknown>
}) => {
  const table = useCurveTable({
    columns: useMemo(() => createColumns(blockchainId), [blockchainId]),
    query,
    meta: { onRowClick: onSelect, isRowSelected: ({ id }) => id === selectedId },
    getRowId: ({ id }) => id,
    enableSorting: false,
  })
  return (
    <Stack data-testid="uniswap-migration-positions">
      <MigrationTableTitle title={t`Uniswap position to migrate from`} protocol="uniswap" />
      <EvmDataTable
        category="detail"
        table={table}
        emptyState={{
          title: t`No Uniswap v3 positions`,
          description: t`This wallet has no open Uniswap v3 positions on this network.`,
        }}
        errorState={{ title: t`Couldn't load Uniswap positions`, onReload }}
      />
    </Stack>
  )
}
