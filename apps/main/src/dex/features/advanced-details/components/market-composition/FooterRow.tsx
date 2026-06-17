import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Column } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { amount, formatNumber } from '@ui-kit/utils'
import type { MarketCompositionRow } from './columns/columns.definitions'
import { MarketCompositionColumnId } from './columns/columns.enum'

const { Spacing } = SizesAndSpaces

type FooterRowProps = {
  visibleColumns: Column<MarketCompositionRow, unknown>[]
  isLoading: boolean
  totalUsd: string
}

type FooterCellProps = FooterRowProps & { columnId: MarketCompositionColumnId }

const footerCellByColumnId: Record<MarketCompositionColumnId, (props: FooterCellProps) => ReactNode> = {
  [MarketCompositionColumnId.Asset]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ padding: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`USD Total`}</Typography>
    </TableCell>
  ),
  [MarketCompositionColumnId.Price]: ({ columnId }: FooterCellProps) => <TableCell key={columnId} />,
  [MarketCompositionColumnId.MarketShare]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.sm, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <Typography variant="tableCellMBold">100%</Typography>
    </TableCell>
  ),
  [MarketCompositionColumnId.TokenAmount]: ({ columnId, isLoading, totalUsd }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <WithSkeleton loading={isLoading} sx={{ justifySelf: 'end' }}>
        <Typography variant="tableCellMBold">{formatNumber(amount(totalUsd), 'usd.notional')}</Typography>
      </WithSkeleton>
    </TableCell>
  ),
}

export const FooterRow = (props: FooterRowProps) =>
  props.visibleColumns.map(({ id }) =>
    footerCellByColumnId[id as MarketCompositionColumnId]({ columnId: id as MarketCompositionColumnId, ...props }),
  )
