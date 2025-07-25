import lodash from 'lodash'
import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import { MultiSelectFilter } from '@/llamalend/PageLlamaMarkets/filters/MultiSelectFilter'
import { RangeSliderFilter } from '@/llamalend/PageLlamaMarkets/filters/RangeSliderFilter'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Displays a token with its icon and symbol.
 * This is used in the lending markets filters to display collateral and debt tokens.
 */
const Token = ({ symbol, data, field }: { symbol: string; data: LlamaMarket[]; field: 'collateral' | 'borrowed' }) => {
  const { chain, address } = useMemo(
    () => data.find((d) => d.assets[field].symbol === symbol)!.assets[field],
    [data, field, symbol],
  )

  return <TokenLabel blockchainId={chain} tooltip={symbol} address={address} label={symbol} size="lg" />
}

const formatUsd = (value: number) => formatNumber(value, { currency: 'USD' })
const formatPercent = (value: number) => value.toFixed(2) + '%'

/**
 * Filters for the lending markets table. Includes filters for chain, collateral token, debt token, liquidity, and utilization.
 */
export const LendingMarketsFilters = ({
  minLiquidity,
  ...props
}: {
  columnFilters: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
  data: LlamaMarket[]
  minLiquidity: number
}) => (
  <Grid container spacing={Spacing.sm} paddingBlockStart={Spacing.sm} paddingInline={Spacing.md}>
    <Grid size={{ mobile: 12, tablet: 4 }}>
      <MultiSelectFilter
        id={LlamaMarketColumnId.Chain}
        field={LlamaMarketColumnId.Chain}
        renderItem={(chain) => (
          <>
            <ChainIcon blockchainId={chain} size="md" />
            <Typography component="span" variant="bodyMBold">
              {lodash.capitalize(chain)}
            </Typography>
          </>
        )}
        defaultText={t`All Chains`}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 4 }}>
      <MultiSelectFilter
        id={LlamaMarketColumnId.CollateralSymbol}
        field="assets.collateral.symbol"
        renderItem={(symbol) => <Token symbol={symbol} data={props.data} field="collateral" />}
        defaultText={t`All Collateral Tokens`}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 4 }}>
      <MultiSelectFilter
        id={LlamaMarketColumnId.BorrowedSymbol}
        field="assets.borrowed.symbol"
        renderItem={(symbol) => <Token symbol={symbol} data={props.data} field="borrowed" />}
        defaultText={t`All Debt Tokens`}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 6 }}>
      <RangeSliderFilter
        id={LlamaMarketColumnId.LiquidityUsd}
        field={LlamaMarketColumnId.LiquidityUsd}
        defaultMinimum={minLiquidity}
        title={t`Liquidity`}
        format={formatUsd}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 6 }}>
      <RangeSliderFilter
        id={LlamaMarketColumnId.UtilizationPercent}
        field={LlamaMarketColumnId.UtilizationPercent}
        title={t`Utilization`}
        format={formatPercent}
        {...props}
      />
    </Grid>
  </Grid>
)
