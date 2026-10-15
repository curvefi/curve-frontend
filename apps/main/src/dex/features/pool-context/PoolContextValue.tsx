import type { Dispatch, SetStateAction } from 'react'
import { getAddress } from 'viem'
import { getTokens } from '@/dex/pool.utils'
import type { CurveApi } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from '@primitives/address.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'

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
  pool: QueryProp<PoolTemplate>
  api: CurveApi | null
  isWrapped: boolean
  setIsWrapped: Dispatch<SetStateAction<boolean>>
}) => {
  const tokensQuery = mapQuery(pool, pool => getTokens(pool, { wrapped: isWrapped }))

  return {
    chainId,
    blockchainId,
    userAddress,
    pool,
    poolAddress: mapQuery(pool, pool => getAddress(pool.address)),
    // A generic query helper function that turns QueryProp<T> into { [K in keyof T]: QueryProp<T[K]> } isn't worth it (we'd still have to enumerate all props for typing to work)
    // Might actually replace these 3 different queries with just tokenQuery in a future commit?
    tokens: mapQuery(tokensQuery, data => data.tokens),
    tokenAddresses: mapQuery(tokensQuery, data => data.tokenAddresses),
    tokenAddressesAll: mapQuery(tokensQuery, data => data.tokenAddressesAll),
    api,
    isWrapped,
    setIsWrapped,
  }
}

export type PoolContextValue = ReturnType<typeof createPoolContextValue>
