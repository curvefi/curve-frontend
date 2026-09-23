import type { Dispatch, SetStateAction } from 'react'
import { getTokens } from '@/dex/pool.utils'
import type { CurveApi, PoolData } from '@/dex/types/main.types'
import type { Address } from '@primitives/address.utils'

export const createPoolContextValue = ({
  chainId,
  blockchainId,
  userAddress,
  poolData,
  api,
  isWrapped,
  setIsWrapped,
}: {
  chainId: number
  blockchainId: string
  userAddress: Address | undefined
  poolData: PoolData
  api: CurveApi | null
  isWrapped: boolean
  setIsWrapped: Dispatch<SetStateAction<boolean>>
}) => ({
  chainId,
  blockchainId,
  userAddress,
  poolData,
  poolId: poolData.pool.id,
  poolAddress: poolData.pool.address as Address, // not checksummed!
  api,
  isWrapped,
  setIsWrapped,
  ...getTokens(poolData.pool, { wrapped: isWrapped }),
})

export type PoolContextValue = ReturnType<typeof createPoolContextValue>
