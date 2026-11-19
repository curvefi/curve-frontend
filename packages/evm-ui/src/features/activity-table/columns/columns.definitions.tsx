import { getAddress } from 'viem'
import { AddressCell } from '@evm-ui/shared/ui/DataTable/inline-cells/AddressCell'
import { RelativeTimeCell } from '@evm-ui/shared/ui/DataTable/inline-cells/RelativeTimeCell'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { TokenDeltaAmountCell } from '../cells/TokenDeltaAmountCell'
import type { ActivityRow } from '../types'
import { ActivityColumnId } from './columns.enum'
import { ACTIVITY_TITLES } from './columns.titles'

const columnHelper = createAppColumnHelper<ActivityRow>()

export const ACTIVITY_COLUMNS = columnHelper.columns([
  columnHelper.display({
    id: ActivityColumnId.Time,
    header: ACTIVITY_TITLES[ActivityColumnId.Time],
    cell: ({
      row: {
        original: { timestamp, chainId, txHash },
      },
    }) => <RelativeTimeCell timestamp={new Date(timestamp)} txUrl={txHash ? scanTxPath(chainId, txHash) : null} />,
  }),
  columnHelper.display({
    id: ActivityColumnId.Action,
    header: ACTIVITY_TITLES[ActivityColumnId.Action],
    cell: ({
      row: {
        original: { action },
      },
    }) => (
      <Typography variant="tableCellValue" color={action.color}>
        {action.label}
      </Typography>
    ),
  }),
  columnHelper.display({
    id: ActivityColumnId.Value,
    header: ACTIVITY_TITLES[ActivityColumnId.Value],
    cell: ({ row }) => formatNumber(row.original.valueUsd, 'usd.amount'),
    meta: { type: 'numeric' },
  }),
  columnHelper.display({
    id: ActivityColumnId.Amount,
    header: ACTIVITY_TITLES[ActivityColumnId.Amount],
    cell: ({
      row: {
        original: { blockchainId, deltas, breakdownCutoff },
      },
    }) => <TokenDeltaAmountCell blockchainId={blockchainId} deltas={deltas} breakdownCutoff={breakdownCutoff} />,
    meta: { type: 'numeric' },
  }),
  columnHelper.display({
    id: ActivityColumnId.Address,
    header: ACTIVITY_TITLES[ActivityColumnId.Address],
    cell: ({
      row: {
        original: { address, chainId },
      },
    }) => (
      <AddressCell
        formatAddress={getAddress}
        address={address}
        explorerUrl={scanAddressPath(chainId, address)}
        align="end"
      />
    ),
    meta: { type: 'numeric' },
  }),
])
