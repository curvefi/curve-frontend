import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Column } from '@tanstack/react-table'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PoolCompositionRow } from './columns/columns.definitions'
import { PoolCompositionColumnId } from './columns/columns.enum'

const { Spacing } = SizesAndSpaces

type FooterRowProps = {
  visibleColumns: Column<CurveTableFeatures, PoolCompositionRow>[]
  totalUsd: QueryProp<Decimal>
  hasBalance: QueryProp<boolean>
}

type FooterCellProps = FooterRowProps & { columnId: PoolCompositionColumnId }

const footerCellByColumnId: Record<PoolCompositionColumnId, (props: FooterCellProps) => ReactNode> = {
  [PoolCompositionColumnId.Asset]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ padding: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`USD Total`}</Typography>
    </TableCell>
  ),
  [PoolCompositionColumnId.Price]: ({ columnId }: FooterCellProps) => <TableCell key={columnId} />,
  [PoolCompositionColumnId.Balance]: ({ columnId, hasBalance }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.sm, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <Typography variant="tableCellMBold">{hasBalance.data ? '100%' : '-'}</Typography>
    </TableCell>
  ),
  [PoolCompositionColumnId.TokenAmount]: ({ columnId, totalUsd }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <WithSkeleton loading={totalUsd.isLoading} sx={{ justifySelf: 'end' }}>
        <Typography variant="tableCellMBold">{formatNumber(totalUsd.data, 'usd.notional')}</Typography>
      </WithSkeleton>
    </TableCell>
  ),
}

export const FooterRow = (props: FooterRowProps) =>
  props.visibleColumns.map(({ id }) =>
    footerCellByColumnId[id as PoolCompositionColumnId]({ columnId: id as PoolCompositionColumnId, ...props }),
  )
