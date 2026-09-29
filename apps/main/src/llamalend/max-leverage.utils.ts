import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'

/** At Max LTV, initial collateral exposure divided by equity with no converted assets. */
export const getMaxPositionLeverage = ({
  leverage,
  maxLtv,
}: Pick<LlamaMarket, 'leverage' | 'maxLtv'>): number | undefined =>
  leverage != null &&
  Number.isFinite(leverage) &&
  leverage > 0 &&
  maxLtv != null &&
  Number.isFinite(maxLtv) &&
  maxLtv >= 0 &&
  maxLtv < 100
    ? 100 / (100 - maxLtv)
    : undefined
