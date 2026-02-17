import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { DeepKeys } from '@tanstack/table-core'
import { useFuzzyFilterFn } from '@ui-kit/shared/ui/DataTable/hooks/useFuzzyFilterFn'

const TEXT_KEYS: DeepKeys<LlamaMarket>[] = ['assets.borrowed.symbol', 'assets.collateral.symbol', 'type']
const ADDRESS_KEYS: DeepKeys<LlamaMarket>[] = [
  'assets.borrowed.address',
  'assets.collateral.address',
  'controllerAddress',
  'ammAddress',
  'vaultAddress',
]

/** Search filter for market lists */
export const useLlamaGlobalFilterFn = (data: readonly LlamaMarket[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, TEXT_KEYS, ADDRESS_KEYS)
