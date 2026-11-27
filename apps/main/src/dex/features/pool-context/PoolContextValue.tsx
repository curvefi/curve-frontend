import type { Dispatch, SetStateAction } from 'react'
import { getTokens } from '@/dex/pool.utils'
import type { CurveApi } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { LitePool, V2PoolDetails } from '@curvefi/prices-api/pools'
import { shortenAddress } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { fallbackQ, mapQuery, type QueryProp } from '@ui/features/queries/util'

export const createPoolContextValue = ({
  chainId,
  blockchainId,
  userAddress,
  pool,
  apiPool,
  litePool,
  poolAddress,
  api,
  isWrapped,
  setIsWrapped,
}: {
  chainId: number
  blockchainId: string
  userAddress: Address | undefined
  pool: QueryProp<PoolTemplate>
  apiPool: QueryProp<V2PoolDetails>
  litePool: QueryProp<LitePool | null>
  poolAddress: Address
  api: CurveApi | null
  isWrapped: boolean
  setIsWrapped: Dispatch<SetStateAction<boolean>>
}) => {
  const tokensQuery = fallbackQ(
    mapQuery(pool, pool => getTokens(pool, { wrapped: isWrapped })),
    mapQuery(apiPool, ({ coins }) => {
      const orderedCoins = coins.toSorted((a, b) => a.poolIndex - b.poolIndex)
      const tokenAddresses = orderedCoins.map(({ address }) => address)
      return {
        tokens: orderedCoins.map(({ symbol, address }) => symbol || shortenAddress(address)),
        tokenAddresses,
        tokenAddressesAll: tokenAddresses,
      }
    }),
    mapQuery(
      litePool,
      pool =>
        pool?.coins && {
          tokens: pool.coins.map(({ symbol, address }) => symbol || shortenAddress(address)),
          tokenAddresses: pool.coins.map(({ address }) => address),
          tokenAddressesAll: pool.coins.map(({ address }) => address),
        },
    ),
  )

  return {
    chainId,
    blockchainId,
    userAddress,
    pool,
    apiPool,
    litePool,
    poolAddress,
    name: fallbackQ(
      mapQuery(pool, pool => pool.name),
      mapQuery(apiPool, pool => pool.name),
      mapQuery(litePool, pool => pool?.name ?? pool?.symbol ?? undefined),
    ),
    lpTokenAddress: fallbackQ(
      mapQuery(pool, pool => pool.lpToken),
      mapQuery(apiPool, pool => pool.lpTokenAddress),
      mapQuery(litePool, pool => pool?.lpTokenAddress ?? undefined),
    ),
    gaugeAddress: fallbackQ(
      mapQuery(pool, pool => pool.gauge.address),
      mapQuery(apiPool, pool => pool.gauges[0]),
      mapQuery(litePool, pool => pool?.gaugeAddress ?? undefined),
    ),
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
