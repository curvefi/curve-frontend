import type { Dictionary } from 'lodash'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TableFilterItem } from '@ui-kit/shared/ui/DataTable/TableFilterItem'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type AssetDetails } from '../../../queries/market-list/llama-markets'
import { LlamaChainFilterChips } from '../chips/LlamaChainFilterChips'
import { LlamaMarketColumnId } from '../columns'
import { type LlamaMarketsFiltersProps, useLlamaMarketsFilters } from './hooks/useLlamaMarketsFilters'
import { MultiSelectFilter } from './MultiSelectFilter'
import { RangeFilter } from './RangeFilter'
import { TableFilterButtonGroup } from './TableFilterButtonGroup'

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
  <SelectableChip label={symbol} selected toggle={() => {}} sx={{ pointerEvents: 'none' }} />
)

/**
 * Filters for the llamalend markets table. Includes filters for chain, collateral token, debt token, liquidity, and
 * utilization.
 */
export const LendingMarketsFilters = (props: LlamaMarketsFiltersProps) => {
  const {
    filterProps,
    markets,
    tokens,
    marketTypeValue,
    marketVersionValue,
    onMarketTypeChange,
    onMarketVersionChange,
    marketTypeOptions,
    marketVersionOptions,
  } = useLlamaMarketsFilters(props)

  return (
    <Stack padding={Spacing.sm} spacing={Spacing.sm}>
      <TableFilterItem title={t`Network`}>
        <LlamaChainFilterChips data={markets} {...filterProps} />
      </TableFilterItem>
      <TableFilterItem title={t`Collateral Tokens`}>
        <MultiSelectFilter
          id={LlamaMarketColumnId.CollateralSymbol}
          field="assets.collateral.symbol"
          renderItem={symbol => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={symbol => <SelectedToken symbol={symbol} />}
          defaultTextMobile={t`All Collateral Tokens`}
          data={markets}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={t`Debt Tokens`}>
        <MultiSelectFilter
          id={LlamaMarketColumnId.BorrowedSymbol}
          field="assets.borrowed.symbol"
          renderItem={symbol => <Token symbol={symbol} tokens={tokens} />}
          selectedItemRender={symbol => <SelectedToken symbol={symbol} />}
          defaultTextMobile={t`All Debt Tokens`}
          data={markets}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={t`TVL`}>
        <RangeFilter
          id={LlamaMarketColumnId.Tvl}
          field={LlamaMarketColumnId.Tvl}
          data={markets}
          adornment="dollar"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={t`Liquidity`}>
        <RangeFilter
          id={LlamaMarketColumnId.LiquidityUsd}
          field={LlamaMarketColumnId.LiquidityUsd}
          data={markets}
          adornment="dollar"
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={t`Utilization`}>
        <RangeFilter
          id={LlamaMarketColumnId.UtilizationPercent}
          field={LlamaMarketColumnId.UtilizationPercent}
          data={markets}
          adornment="percentage"
          max={100}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterButtonGroup
        title={t`Market type`}
        value={marketTypeValue}
        onChange={onMarketTypeChange}
        ariaLabel={t`Market type filter`}
        options={marketTypeOptions}
      />
      <TableFilterButtonGroup
        title={t`Market version`}
        value={marketVersionValue}
        onChange={onMarketVersionChange}
        ariaLabel={t`Market version filter`}
        options={marketVersionOptions}
      />
    </Stack>
  )
}
