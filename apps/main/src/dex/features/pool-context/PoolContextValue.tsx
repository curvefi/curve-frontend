import type { Dispatch, SetStateAction } from 'react'
import { getAddress } from 'viem'
import { getTokens } from '@/dex/pool.utils'
import type { CurveApi } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from '@primitives/address.utils'

export const createPoolContextValue = ({
  chainId,
  blockchainId,
  userAddress,
  pool,
  api,
  isWrapped,
  setIsWrapped,
}: {
  chainId: number
  blockchainId: string
  userAddress: Address | undefined
  pool: PoolTemplate
  api: CurveApi | null
  isWrapped: boolean
  setIsWrapped: Dispatch<SetStateAction<boolean>>
}) => ({
  chainId,
  blockchainId,
  userAddress,
  pool,
  poolAddress: getAddress(pool.address),
  api,
  isWrapped,
  setIsWrapped,
  ...getTokens(pool, { wrapped: isWrapped }),
})

export type PoolContextValue = ReturnType<typeof createPoolContextValue>
