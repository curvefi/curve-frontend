import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Column } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { amount, formatNumber } from '@ui-kit/utils'
import type { PoolCompositionRow } from './columns/columns.definitions'
import { PoolCompositionColumnId } from './columns/columns.enum'

const { Spacing } = SizesAndSpaces

type FooterRowProps = {
  visibleColumns: Column<PoolCompositionRow, unknown>[]
  isLoading: boolean
  totalUsd: string
}

type FooterCellProps = FooterRowProps & { columnId: PoolCompositionColumnId }

const footerCellByColumnId: Record<PoolCompositionColumnId, (props: FooterCellProps) => ReactNode> = {
  [PoolCompositionColumnId.Asset]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ padding: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`USD Total`}</Typography>
    </TableCell>
  ),
  [PoolCompositionColumnId.Price]: ({ columnId }: FooterCellProps) => <TableCell key={columnId} />,
  [PoolCompositionColumnId.MarketShare]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.sm, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <Typography variant="tableCellMBold">100%</Typography>
    </TableCell>
  ),
  [PoolCompositionColumnId.TokenAmount]: ({ columnId, isLoading, totalUsd }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <WithSkeleton loading={isLoading} sx={{ justifySelf: 'end' }}>
        <Typography variant="tableCellMBold">{formatNumber(amount(totalUsd), 'usd.notional')}</Typography>
      </WithSkeleton>
    </TableCell>
  ),
}

export const FooterRow = (props: FooterRowProps) =>
  props.visibleColumns.map(({ id }) =>
    footerCellByColumnId[id as PoolCompositionColumnId]({ columnId: id as PoolCompositionColumnId, ...props }),
  )
