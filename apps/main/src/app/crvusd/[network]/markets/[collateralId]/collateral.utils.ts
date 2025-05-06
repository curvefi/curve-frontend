import { headers } from 'next/headers'
import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { getServerData } from '@/background'
import type { CollateralUrlParams } from '@/loan/types/loan.types'

export const getCollateralName = async ({ network, collateralId }: CollateralUrlParams) =>
  (await getServerData<CrvUsdServerData>('crvusd', await headers())).mintMarkets?.find(
    (m) => m.chain === network && m.collateralToken.symbol.toLowerCase() === collateralId.toLowerCase(),
  )?.name ?? collateralId
