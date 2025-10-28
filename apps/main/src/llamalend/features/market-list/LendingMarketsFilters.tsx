import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { TableFilterColumn } from '@ui-kit/shared/ui/DataTable/TableFilterColumn'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatPercent, formatUsd } from '@ui-kit/utils'
import { LlamaMarketColumnId } from './columns.enum'
import { MultiSelectFilter } from './filters/MultiSelectFilter'
import { RangeSliderFilter } from './filters/RangeSliderFilter'

const { Spacing } = SizesAndSpaces
const TABLE_FILTER_COLUMN_SIZE = { mobile: 12, tablet: 12 / 4, desktop: 12 / 5 } as const

/**
 * Displays a token with its icon and symbol.
 * This is used in the lending markets filters to display collateral and debt tokens.
 */
const Token = ({ symbol, data, field }: { symbol: string; data: LlamaMarket[]; field: 'collateral' | 'borrowed' }) => {
  const { chain, address } = useMemo(
    () => data.find((d) => d.assets[field].symbol === symbol)!.assets[field],
    [data, field, symbol],
  )

  return <TokenLabel blockchainId={chain} tooltip={symbol} address={address} label={symbol} size="xl" />
}

/**
 * Displays a selected token with its icon and symbol.
 * This is used in the lending markets filters to display selected collateral and debt tokens.
 */
const SelectedToken = ({
  symbol,
  data,
  field,
}: {
  symbol: string
  data: LlamaMarket[]
  field: 'collateral' | 'borrowed'
}) => {
  const { chain, address } = useMemo(
    () => data.find((d) => d.assets[field].symbol === symbol)!.assets[field],
    [data, field, symbol],
  )

  return <Chip label={symbol} size="small" icon={<TokenIcon blockchainId={chain} address={address} />} />
}

/**
 * Filters for the lending markets table. Includes filters for chain, collateral token, debt token, liquidity, and utilization.
 */
export const LendingMarketsFilters = ({
  minLiquidity = 0,
  data,
  ...filterProps
}: {
  columnFilters: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
  data: LlamaMarket[]
  minLiquidity?: number
}) => (
  <Grid
    container
    spacing={Spacing.sm}
    paddingBlockStart={Spacing.sm}
    paddingInline={{ mobile: 0, tablet: Spacing.md.tablet, desktop: Spacing.md.desktop }}
  >
    <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`Collateral Tokens`}>
      <MultiSelectFilter
        id={LlamaMarketColumnId.CollateralSymbol}
        field="assets.collateral.symbol"
        renderItem={(symbol) => <Token symbol={symbol} data={data} field="collateral" />}
        selectedItemRender={(symbol) => <SelectedToken symbol={symbol} data={data} field="collateral" />}
        defaultText={t`All`}
        defaultTextMobile={t`All Collateral Tokens`}
        data={data}
        {...filterProps}
      />
    </TableFilterColumn>

    <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`Debt Tokens`}>
      <MultiSelectFilter
        id={LlamaMarketColumnId.BorrowedSymbol}
        field="assets.borrowed.symbol"
        renderItem={(symbol) => <Token symbol={symbol} data={data} field="borrowed" />}
        selectedItemRender={(symbol) => <SelectedToken symbol={symbol} data={data} field="collateral" />}
        defaultText={t`All`}
        defaultTextMobile={t`All Debt Tokens`}
        data={data}
        {...filterProps}
      />
    </TableFilterColumn>

    <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`TVL`}>
      <RangeSliderFilter
        id={LlamaMarketColumnId.Tvl}
        field={LlamaMarketColumnId.Tvl}
        title={t`TVL`}
        format={formatUsd}
        data={data}
        inputStartAdornment={
          <Typography variant="bodySBold" color="textTertiary">
            $
          </Typography>
        }
        {...filterProps}
      />
    </TableFilterColumn>

    <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`Available liquidity`}>
      <RangeSliderFilter
        id={LlamaMarketColumnId.LiquidityUsd}
        field={LlamaMarketColumnId.LiquidityUsd}
        title={t`Liquidity`}
        format={formatUsd}
        data={data}
        inputStartAdornment={
          <Typography variant="bodySBold" color="textTertiary">
            $
          </Typography>
        }
        {...filterProps}
      />
    </TableFilterColumn>

    <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`Utilization`}>
      <RangeSliderFilter
        id={LlamaMarketColumnId.UtilizationPercent}
        field={LlamaMarketColumnId.UtilizationPercent}
        title={t`Utilization`}
        format={formatPercent}
        data={data}
        inputEndAdornment={
          <Typography variant="bodySBold" color="textTertiary">
            %
          </Typography>
        }
        {...filterProps}
      />
    </TableFilterColumn>
  </Grid>
)
