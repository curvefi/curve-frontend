import { useMemo } from 'react'
import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo, type TokenInfoProps } from '@evm-ui/shared/ui/TokenInfo'
import { Tooltip, type TooltipProps } from '@evm-ui/shared/ui/Tooltip'
import { formatNumber } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { ColumnVisibilityState } from '@tanstack/react-table'
import { TokenCell } from '../../TokenCell'
import { YieldBreakdownColumnId } from './columns.enum'

export type YieldBreakdownRow = {
  source: TokenInfoProps
  address?: string
  explorerUrl?: string
  price?: number
  rate?: number | null
  maxBoostRate?: number | null
  rateTooltip?: Pick<TooltipProps, 'title' | 'body' | 'clickable'>
}

const columnHelper = createAppColumnHelper<YieldBreakdownRow>()

export const YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY = {
  [YieldBreakdownColumnId.Source]: true,
  [YieldBreakdownColumnId.Price]: false,
  [YieldBreakdownColumnId.Rate]: true,
} satisfies ColumnVisibilityState

export const useYieldBreakdownColumns = () => {
  const rateDisplay = useRateDisplay()

  return useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('source', {
          id: YieldBreakdownColumnId.Source,
          header: t`Source`,
          cell: ({ getValue, row }) => (
            <TokenCell source={getValue()} address={row.original.address} explorerUrl={row.original.explorerUrl} />
          ),
          enableSorting: false,
        }),
        columnHelper.accessor('price', {
          id: YieldBreakdownColumnId.Price,
          header: t`Price`,
          cell: ({ getValue }) => (
            <InlineTableCell>
              <Typography>{formatNumber(getValue(), 'usd.precise')}</Typography>
            </InlineTableCell>
          ),
          enableSorting: false,
          meta: { type: 'numeric' },
        }),
        columnHelper.accessor('rate', {
          id: YieldBreakdownColumnId.Rate,
          header: rateDisplay === 'apy' ? t`APY` : t`APR`,
          cell: ({ getValue, row }) => (
            <InlineTableCell sx={{ alignItems: 'end' }}>
              <Tooltip {...row.original.rateTooltip} title={row.original.rateTooltip?.title ?? null} placement="top">
                {/** Needed for tooltip to work for whatever reason */}
                <Box>
                  <TokenInfo
                    icon={null}
                    iconPosition="right"
                    primary={formatNumber(getValue(), 'percent.rate')}
                    secondary={maybe(row.original.maxBoostRate, value =>
                      t`Max boost ${formatNumber(value, 'percent.rate')}`,
                    )}
                  />
                </Box>
              </Tooltip>
            </InlineTableCell>
          ),
          enableSorting: false,
          meta: { type: 'numeric' },
        }),
      ]),
    [rateDisplay],
  )
}
