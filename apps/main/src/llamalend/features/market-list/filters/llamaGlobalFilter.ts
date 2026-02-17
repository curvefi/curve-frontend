import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { filterByText } from '@ui-kit/shared/ui/DataTable/filters'

/** Search filter for market lists */
export const llamaGlobalFilterFn = filterByText<LlamaMarket>(
  'controllerAddress',
  'ammAddress',
  'vaultAddress',
  'assets.borrowed.address',
  'assets.borrowed.symbol',
  'assets.collateral.address',
  'assets.collateral.symbol',
  'type',
)
