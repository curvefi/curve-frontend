import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useFuzzyFilterFn } from '@evm-ui/hooks/useFuzzySearch'
import type { DeepKeys } from '@tanstack/table-core'

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
export const useMarketsGlobalFilterFn = <T extends LlamaMarket>(data: readonly T[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, MARKET_KEYS)
