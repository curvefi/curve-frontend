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
import { MarketsChainFilterChips } from '../chips/MarketsChainFilterChips'
import { MARKET_TITLES, MarketColumnId } from '../columns'
import { type MarketsFiltersProps, useMarketsFilters } from './hooks/useMarketsFilters'
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

/** Filters for the LlamaLend markets table, including chain, token, APR, and range-based filters. */
export const MarketsFilters = (props: MarketsFiltersProps) => {
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
  } = useMarketsFilters(props)

  return (
    <Stack spacing={Spacing.sm} sx={{ padding: Spacing.sm }}>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.Chain]}>
        <MarketsChainFilterChips marketsQuery={props.marketsQuery} {...filterProps} />
      </TableFilterItem>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.CollateralSymbol]}>
        <MultiSelectFilter
          id={MarketColumnId.CollateralSymbol}
          options={collateralTokenOptions}
          renderItem={symbol => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={symbol => <SelectedToken symbol={symbol} />}
          defaultTextMobile={t`All Collateral Tokens`}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.BorrowedSymbol]}>
        <MultiSelectFilter
          id={MarketColumnId.BorrowedSymbol}
          options={borrowedTokenOptions}
          renderItem={symbol => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={symbol => <SelectedToken symbol={symbol} />}
          defaultTextMobile={t`All Debt Tokens`}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.BorrowRate]}>
        <TableRangeFilter
          id={MarketColumnId.BorrowRate}
          min={borrowRateRange.min}
          max={borrowRateRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="percentage"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.Tvl]}>
        <TableRangeFilter
          id={MarketColumnId.Tvl}
          min={tvlRange.min}
          max={tvlRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="dollar"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.LiquidityUsd]}>
        <TableRangeFilter
          id={MarketColumnId.LiquidityUsd}
          min={liquidityRange.min}
          max={liquidityRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="dollar"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.UtilizationPercent]}>
        <TableRangeFilter
          id={MarketColumnId.UtilizationPercent}
          min={utilizationRange.min}
          max={utilizationRange.max}
          isLoading={props.marketsQuery.isLoading}
          adornment="percentage"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={MARKET_TITLES[MarketColumnId.MaxLtv]}>
        <RangeSliderRowFilter
          id={MarketColumnId.MaxLtv}
          min={maxLtvRange.min}
          max={maxLtvRange.max}
          step={maxLtvRange.step}
          adornment="percentage"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterButtonGroup
        title={MARKET_TITLES[MarketColumnId.Type]}
        value={marketTypeValue}
        onChange={onMarketTypeChange}
        ariaLabel={t`Market type filter`}
        options={marketTypeOptions}
        testIdSuffix="market-type"
      />
      <TableFilterButtonGroup
        title={MARKET_TITLES[MarketColumnId.Version]}
        value={marketVersionValue}
        onChange={onMarketVersionChange}
        ariaLabel={t`Market version filter`}
        options={marketVersionOptions}
        testIdSuffix="market-version"
      />
    </Stack>
  )
}
