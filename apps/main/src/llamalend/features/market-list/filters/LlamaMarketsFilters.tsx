import { noop, type Dictionary } from 'lodash'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TableFilterButtonGroup } from '@ui-kit/shared/ui/DataTable/TableFilterButtonGroup'
import { TableFilterItem } from '@ui-kit/shared/ui/DataTable/TableFilterItem'
import { TableRangeFilter } from '@ui-kit/shared/ui/DataTable/TableRangeFilter'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type AssetDetails } from '../../../queries/market-list/llama-markets'
import { LlamaChainFilterChips } from '../chips/LlamaChainFilterChips'
import { LLAMA_MARKET_TITLES, LlamaMarketColumnId } from '../columns'
import { type LlamaMarketsFiltersProps, useLlamaMarketsFilters } from './hooks/useLlamaMarketsFilters'
import { MultiSelectFilter } from './MultiSelectFilter'
import { RangeSliderRowFilter } from './RangeSliderRowFilter'

const { Spacing } = SizesAndSpaces

/**
 * Displays a token with its icon and symbol.
 * This is used in the lending markets filters to display collateral and debt tokens.
 */
const Token = ({ symbol, tokens }: { symbol: string; tokens: Dictionary<AssetDetails> }) => {
  const { chain, address = null } = tokens[symbol] ?? {}
  return <TokenLabel blockchainId={chain} tooltip={symbol} address={address} label={symbol} size="xl" />
}

/**
 * Displays a selected token, used in the lending markets filters to display selected collateral and debt tokens.
 * SelectableChip is not being used as real Chip but required to match the design, that's why the interactions are
 * disabled and it's always selected
 */
const SelectedToken = ({ symbol }: { symbol: string }) => (
  <SelectableChip label={symbol} selected toggle={noop} sx={{ pointerEvents: 'none' }} />
)

/**
 * Filters for the LlamaLend markets table, including chain, token, APR, and range-based filters.
 */
export const LlamaMarketsFilters = (props: LlamaMarketsFiltersProps) => {
  const {
    filterProps,
    tokens,
    collateralTokenOptions,
    borrowedTokenOptions,
    borrowRateRange,
    tvlRange,
    liquidityRange,
    utilizationRange,
    maxLtvRange,
    marketTypeValue,
    marketVersionValue,
    onMarketTypeChange,
    onMarketVersionChange,
    marketTypeOptions,
    marketVersionOptions,
  } = useLlamaMarketsFilters(props)

  return (
    <Stack spacing={Spacing.sm} sx={{ padding: Spacing.sm }}>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.Chain]}>
        <LlamaChainFilterChips marketsQuery={props.marketsQuery} {...filterProps} />
      </TableFilterItem>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.CollateralSymbol]}>
        <MultiSelectFilter
          id={LlamaMarketColumnId.CollateralSymbol}
          options={collateralTokenOptions}
          renderItem={symbol => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={symbol => <SelectedToken symbol={symbol} />}
          defaultTextMobile={t`All Collateral Tokens`}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.BorrowedSymbol]}>
        <MultiSelectFilter
          id={LlamaMarketColumnId.BorrowedSymbol}
          options={borrowedTokenOptions}
          renderItem={symbol => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={symbol => <SelectedToken symbol={symbol} />}
          defaultTextMobile={t`All Debt Tokens`}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.BorrowRate]}>
        <TableRangeFilter
          id={LlamaMarketColumnId.BorrowRate}
          min={borrowRateRange.min}
          max={borrowRateRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="percentage"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.Tvl]}>
        <TableRangeFilter
          id={LlamaMarketColumnId.Tvl}
          min={tvlRange.min}
          max={tvlRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="dollar"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.LiquidityUsd]}>
        <TableRangeFilter
          id={LlamaMarketColumnId.LiquidityUsd}
          min={liquidityRange.min}
          max={liquidityRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="dollar"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.UtilizationPercent]}>
        <TableRangeFilter
          id={LlamaMarketColumnId.UtilizationPercent}
          min={utilizationRange.min}
          max={utilizationRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="percentage"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.MaxLtv]}>
        <RangeSliderRowFilter
          id={LlamaMarketColumnId.MaxLtv}
          min={maxLtvRange.min}
          max={maxLtvRange.max}
          step={maxLtvRange.step}
          adornment="percentage"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterButtonGroup
        title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.Type]}
        value={marketTypeValue}
        onChange={onMarketTypeChange}
        ariaLabel={t`Market type filter`}
        options={marketTypeOptions}
        testIdSuffix="market-type"
      />
      <TableFilterButtonGroup
        title={LLAMA_MARKET_TITLES[LlamaMarketColumnId.Version]}
        value={marketVersionValue}
        onChange={onMarketVersionChange}
        ariaLabel={t`Market version filter`}
        options={marketVersionOptions}
        testIdSuffix="market-version"
      />
    </Stack>
  )
}
