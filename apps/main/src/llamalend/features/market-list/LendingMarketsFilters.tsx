import { keyBy, type Dictionary } from 'lodash'
import { useMemo } from 'react'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { TableFilterColumn } from '@ui-kit/shared/ui/DataTable/TableFilterColumn'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatPercent, formatUsd } from '@ui-kit/utils'
import { type AssetDetails, LlamaMarket } from '../../queries/market-list/llama-markets'
import { LlamaMarketColumnId } from './columns'
import { MultiSelectFilter } from './filters/MultiSelectFilter'
import { RangeSliderFilter } from './filters/RangeSliderFilter'

const { Spacing } = SizesAndSpaces
const TABLE_FILTER_COLUMN_SIZE = { mobile: 12, tablet: 12 / 4, desktop: 12 / 5 } as const

/**
 * Displays a token with its icon and symbol.
 * This is used in the lending markets filters to display collateral and debt tokens.
 */
const Token = ({ symbol, tokens }: { symbol: string; tokens: Dictionary<AssetDetails> }) => {
  const { chain, address = null } = tokens[symbol] ?? {}
  return <TokenLabel blockchainId={chain} tooltip={symbol} address={address} label={symbol} size="xl" />
}

/**
 * Displays a selected token with its icon and symbol.
 * This is used in the lending markets filters to display selected collateral and debt tokens.
 */
const SelectedToken = ({ symbol, tokens }: { symbol: string; tokens: Dictionary<AssetDetails> }) => {
  const { chain, address = null } = tokens[symbol] ?? {}
  return <Chip label={symbol} size="small" icon={<TokenIcon blockchainId={chain} address={address} />} />
}

/**
 * Filters for the lending markets table. Includes filters for chain, collateral token, debt token, liquidity, and utilization.
 */
export const LendingMarketsFilters = ({
  data,
  ...filterProps
}: FilterProps<LlamaMarketColumnId> & {
  data: LlamaMarket[]
}) => {
  // Filter options are scoped to selected chains to prevent cross-chain filter data pollution.
  // Example: When viewing Ethereum markets, Arbitrum market data should not influence filter options.
  const selectedChains = parseListFilter(filterProps.columnFiltersById[LlamaMarketColumnId.Chain])
  const markets = useMemo(
    () => (selectedChains?.length ? data.filter((market) => selectedChains.includes(market.chain)) : data),
    [data, selectedChains],
  )

  // Relies on data and not markets, because you might have a filter active for a token from a chain
  // before you filtered out that said chain. This would lead to token symbols not loading.
  const tokens = useMemo(
    () =>
      keyBy(
        data.flatMap((market) => [market.assets.collateral, market.assets.borrowed]),
        (i) => i.symbol,
      ),
    [data],
  )
  return (
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
          renderItem={(symbol) => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={(symbol) => <SelectedToken symbol={symbol} tokens={tokens} />}
          defaultText={t`All`}
          defaultTextMobile={t`All Collateral Tokens`}
          data={markets}
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`Debt Tokens`}>
        <MultiSelectFilter
          id={LlamaMarketColumnId.BorrowedSymbol}
          field="assets.borrowed.symbol"
          renderItem={(symbol) => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={(symbol) => <SelectedToken symbol={symbol} tokens={tokens} />}
          defaultText={t`All`}
          defaultTextMobile={t`All Debt Tokens`}
          data={markets}
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`TVL`}>
        <RangeSliderFilter
          id={LlamaMarketColumnId.Tvl}
          field={LlamaMarketColumnId.Tvl}
          title={t`TVL`}
          format={formatUsd}
          data={markets}
          adornment="dollar"
          scale="power"
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`Available liquidity`}>
        <RangeSliderFilter
          id={LlamaMarketColumnId.LiquidityUsd}
          field={LlamaMarketColumnId.LiquidityUsd}
          title={t`Liquidity`}
          format={formatUsd}
          data={markets}
          adornment="dollar"
          scale="power"
          {...filterProps}
        />
      </TableFilterColumn>

      <TableFilterColumn size={TABLE_FILTER_COLUMN_SIZE} title={t`Utilization`}>
        <RangeSliderFilter
          id={LlamaMarketColumnId.UtilizationPercent}
          field={LlamaMarketColumnId.UtilizationPercent}
          title={t`Utilization`}
          format={formatPercent}
          data={markets}
          adornment="percentage"
          max={100}
          {...filterProps}
        />
      </TableFilterColumn>
    </Grid>
  )
}
