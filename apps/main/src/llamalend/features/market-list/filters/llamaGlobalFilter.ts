import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { DeepKeys } from '@tanstack/table-core'
import { useFuzzyFilterFn } from '@ui-kit/hooks/useFuzzySearch'
import { t } from '@ui-kit/lib/i18n'

const MARKET_KEYS: DeepKeys<LlamaMarket>[] = [
  'assets.borrowed.symbol',
  'assets.collateral.symbol',
  'assets.borrowed.address',
  'assets.collateral.address',
  'type',
  'controllerAddress',
  'ammAddress',
  'vaultAddress',
]

/** Search filter for market lists */
export const useLlamaGlobalFilterFn = (data: readonly LlamaMarket[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, MARKET_KEYS)

export const llamaFilterTooltip = `${t`You have active filters.`} (${t`small markets are hidden by default due to low TVL.`})`
