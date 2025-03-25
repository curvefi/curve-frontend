import { LlamaMarketsServerSideCache } from '@/app/crvusd/server-side-data'
import type { CollateralUrlParams } from '@/loan/types/loan.types'

export const getCollateralName = async ({ network, collateralId }: CollateralUrlParams) =>
  LlamaMarketsServerSideCache.result.mintMarkets?.find(
    (m) => m.chain === network && m.collateralToken.symbol.toLowerCase() === collateralId,
  )?.name ?? collateralId
