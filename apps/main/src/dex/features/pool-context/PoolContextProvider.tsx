import { type ReactNode, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { useLitePool } from '@/dex/queries/lite-pool.query'
import { usePoolPricesApi } from '@/dex/queries/pool-prices-api.query'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { Address } from '@primitives/address.utils'
import { q, type QueryProp } from '@ui/features/queries/util'
import { PoolContext } from './PoolContext'
import { createPoolContextValue } from './PoolContextValue'

export const PoolContextProvider = ({
  children,
  network: { chainId, blockchainId },
  pool,
  poolAddress,
}: {
  children: ReactNode
  network: { chainId: number; blockchainId: string }
  pool: QueryProp<PoolTemplate>
  /** Should come from the URL, so is not an async query depending on pool data */
  poolAddress: Address
}) => {
  const { address: userAddress } = useConnection()
  const { curveApi: api = null } = useCurve()
  const {
    data: apiPoolData,
    isLoading: isApiPoolLoading,
    error: apiPoolError,
  } = usePoolPricesApi({ chainId, poolAddress }, !isLiteChain(chainId))
  const {
    data: litePoolData,
    isLoading: isLitePoolLoading,
    error: litePoolError,
  } = useLitePool({ chainId, poolAddress })

  // This is a global pool page toggle that changes many things on the pool page itself, whose toggle sits inside the forms.
  // Alternatives would be prop drilling or yet another zustand store, neither sound pleasant.
  const [isWrapped, setIsWrapped] = useState(false)

  return (
    <PoolContext
      value={useMemo(
        () =>
          createPoolContextValue({
            chainId,
            blockchainId,
            userAddress,
            pool,
            apiPool: q({ data: apiPoolData, isLoading: isApiPoolLoading, error: apiPoolError }),
            litePool: q({ data: litePoolData, isLoading: isLitePoolLoading, error: litePoolError }),
            poolAddress,
            api,
            isWrapped,
            setIsWrapped,
          }),
        [
          chainId,
          blockchainId,
          pool,
          apiPoolData,
          isApiPoolLoading,
          litePoolData,
          isLitePoolLoading,
          litePoolError,
          apiPoolError,
          poolAddress,
          userAddress,
          api,
          isWrapped,
          setIsWrapped,
        ],
      )}
    >
      {children}
    </PoolContext>
  )
}
