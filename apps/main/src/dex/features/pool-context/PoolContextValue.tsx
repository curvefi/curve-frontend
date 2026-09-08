import type { CurveApi, PoolData } from '@/dex/types/main.types'
import type { Address } from '@primitives/address.utils'

export const createPoolContextValue = ({
  chainId,
  blockchainId,
  userAddress,
  poolData,
  api,
}: {
  chainId: number
  blockchainId: string
  userAddress: Address | undefined
  poolData: PoolData
  api: CurveApi | null
}) => ({
  chainId,
  blockchainId,
  userAddress,
  poolData,
  poolId: poolData.pool.id,
  poolAddress: poolData.pool.address as Address, // not checksummed!
  api,
})

export type PoolContextValue = ReturnType<typeof createPoolContextValue>
