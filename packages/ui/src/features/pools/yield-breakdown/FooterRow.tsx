import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Column } from '@tanstack/react-table'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { YieldBreakdownColumnId } from './columns/columns.enum'
import type { YieldBreakdownRow } from './types'

const { Spacing } = SizesAndSpaces

type FooterRowProps = {
  visibleColumns: Column<CurveTableFeatures, YieldBreakdownRow>[]
  maxBoostTotal: QueryProp<number | undefined>
  total: QueryProp<Amount | undefined>
  totalTooltip?: ReactNode
}

type FooterCellProps = FooterRowProps & { columnId: YieldBreakdownColumnId }

const footerCellByColumnId: Record<YieldBreakdownColumnId, (props: FooterCellProps) => ReactNode> = {
  [YieldBreakdownColumnId.Source]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md }}>
      <Typography variant="tableCellValueStrong">{t`Total APR`}</Typography>
    </TableCell>
  ),
  [YieldBreakdownColumnId.Price]: ({ columnId }: FooterCellProps) => <TableCell key={columnId} />,
  [YieldBreakdownColumnId.Rate]: ({
    columnId,
    maxBoostTotal: { data: maxBoostTotal },
    total,
    totalTooltip,
  }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <WithSkeleton loading={total.isLoading}>
        {total.error ? (
          <ErrorIconButton error={total.error} size="small" />
        ) : (
          <Tooltip
            title={totalTooltip ? t`Total APR` : undefined}
            body={totalTooltip}
            placement="top"
            clickable
            mobileDrawer
          >
            <Stack>
              <Typography variant="tableCellValueStrong">{formatNumber(total.data, 'percent.rate')}</Typography>
              {!!maxBoostTotal && maxBoostTotal != total.data && (
                <Typography variant="tableCellSupport" color="textSecondary">
                  {t`Max boost ${formatNumber(maxBoostTotal, 'percent.rate')}`}
                </Typography>
              )}
            </Stack>
          </Tooltip>
        )}
      </WithSkeleton>
    </TableCell>
  ),
}

export const FooterRow = (props: FooterRowProps) =>
  props.visibleColumns.map(({ id }) =>
    footerCellByColumnId[id as YieldBreakdownColumnId]({ columnId: id as YieldBreakdownColumnId, ...props }),
  )
