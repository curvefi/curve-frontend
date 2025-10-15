import { useMemo } from 'react'
import { LlamaMarket, LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { TableFilterColumn } from '@ui-kit/shared/ui/DataTable/TableFilterColumn'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatPercent, formatUsd } from '@ui-kit/utils'
import { LlamaMarketColumnId } from './columns.enum'
import { MultiSelectFilter } from './filters/MultiSelectFilter'
import { RangeSliderFilter } from './filters/RangeSliderFilter'

const { Spacing } = SizesAndSpaces
const TABLE_FILTER_COLUMN_SIZE = { mobile: 12, tablet: 3, desktop: 2.4 } as const

/**
 * Displays a token with its icon and symbol.
 * This is used in the lending markets filters to display collateral and debt tokens.
 */
const Token = ({
  symbol,
  data,
  field,
}: {
  symbol: string
  data: LlamaMarket[] | undefined
  field: 'collateral' | 'borrowed'
}) => {
  const { chain, address } = useMemo(
    () => data?.find((d) => d.assets[field].symbol === symbol)?.assets[field] ?? { chain: '', address: '' },
    [data, field, symbol],
  )

  return <TokenLabel blockchainId={chain} tooltip={symbol} address={address} label={symbol} size="xl" />
}

/**
 * Filters for the lending markets table. Includes filters for chain, collateral token, debt token, liquidity, and utilization.
 */
export const LendingMarketsFilters = ({
  minLiquidity = 0,
  data,
  ...filterProps
}: {
  data?: LlamaMarket[]
  minLiquidity?: number
  columnFilters: Record<LlamaMarketKey, unknown>
  setColumnFilter: (id: string, value: unknown) => void
}) => {
  const isMobile = useIsMobile()

  return (
    <Grid container spacing={Spacing.sm} paddingBlockStart={Spacing.sm} paddingInline={Spacing.md}>
      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={!isMobile ? t`Collateral Tokens` : undefined}>
        <MultiSelectFilter
          id={LlamaMarketColumnId.CollateralSymbol}
          field="assets.collateral.symbol"
          renderItem={(symbol) => <Token symbol={symbol} data={data} field="collateral" />}
          defaultText={t`All`}
          defaultTextMobile={t`All Collateral Tokens`}
          data={data}
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={!isMobile ? t`Debt Tokens` : undefined}>
        <MultiSelectFilter
          id={LlamaMarketColumnId.BorrowedSymbol}
          field="assets.borrowed.symbol"
          renderItem={(symbol) => <Token symbol={symbol} data={data} field="borrowed" />}
          defaultText={t`All`}
          defaultTextMobile={t`All Debt Tokens`}
          data={data}
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={!isMobile ? t`TVL` : undefined}>
        <RangeSliderFilter
          id={LlamaMarketColumnId.Tvl}
          field={LlamaMarketColumnId.Tvl}
          title={t`TVL`}
          format={formatUsd}
          data={data}
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={!isMobile ? t`Available liquidity` : undefined}>
        <RangeSliderFilter
          id={LlamaMarketColumnId.LiquidityUsd}
          field={LlamaMarketColumnId.LiquidityUsd}
          title={t`Liquidity`}
          format={formatUsd}
          data={data}
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={!isMobile ? t`Utilization` : undefined}>
        <RangeSliderFilter
          id={LlamaMarketColumnId.UtilizationPercent}
          field={LlamaMarketColumnId.UtilizationPercent}
          title={t`Utilization`}
          format={formatPercent}
          data={data}
          {...filterProps}
        />
      </TableFilterColumn>
    </Grid>
  )
}
