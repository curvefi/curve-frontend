import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TimestampCell } from '@evm-ui/shared/ui/DataTable/inline-cells/TimestampCell'
import { scanTxPath } from '@legacy-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { MinusCircleIcon } from '@ui/icons/MinusCircleIcon'
import { PlusCircleIcon } from '@ui/icons/PlusCircleIcon'
import { decimalCompare, ZERO } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { VaultChangeAmount } from '../cells/VaultChangeAmount'
import type { ParsedUserVaultEvent } from '../hooks/useUserVaultEvents'

const { Spacing } = SizesAndSpaces
const columnHelper = createAppColumnHelper<ParsedUserVaultEvent>()

const EVENT_CONFIG: Record<ParsedUserVaultEvent['type'], { label: string; Icon: typeof PlusCircleIcon }> = {
  Deposit: { label: t`Supply`, Icon: PlusCircleIcon },
  Withdraw: { label: t`Withdraw`, Icon: MinusCircleIcon },
  TransferIn: { label: t`Transfer in`, Icon: PlusCircleIcon },
  TransferOut: { label: t`Transfer out`, Icon: MinusCircleIcon },
}

export const USER_VAULT_HISTORY_COLUMNS = columnHelper.columns([
  columnHelper.accessor('type', {
    header: t`Type`,
    cell: ({ row: { original: event } }) => {
      const { label, Icon } = EVENT_CONFIG[event.type]
      return (
        <InlineTableCell>
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
            <Icon />
            <Typography variant="tableCellMBold">{label}</Typography>
          </Stack>
        </InlineTableCell>
      )
    },
  }),
  columnHelper.accessor('amount', {
    header: t`Amount`,
    sortFn: (a, b) => decimalCompare(a.original.amount ?? ZERO, b.original.amount ?? ZERO),
    sortUndefined: 'last',
    cell: ({ row: { original: event } }) => (
      <InlineTableCell>
        <VaultChangeAmount value={event.amount} symbol={event.symbol} />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('shareChange', {
    header: t`Shares`,
    sortFn: (a, b) => decimalCompare(a.original.shareChange, b.original.shareChange),
    cell: ({ getValue }) => (
      <InlineTableCell>
        <VaultChangeAmount value={getValue()} />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    header: t`Time`,
    cell: ({ row: { original: event } }) => (
      <TimestampCell
        timestamp={new Date(event.timestamp)}
        txUrl={scanTxPath(event.chainId, event.txHash)}
        align="end"
      />
    ),
    meta: { type: 'numeric' },
  }),
])
