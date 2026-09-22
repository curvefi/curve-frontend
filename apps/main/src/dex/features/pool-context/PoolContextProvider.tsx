import { type ReactNode, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { isWrappedOnly } from '@/dex/pool.utils'
import { useStore } from '@/dex/store/useStore'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { PoolContext } from './PoolContext'
import { createPoolContextValue } from './PoolContextValue'

export const PoolContextProvider = ({
  children,
  network: { chainId, blockchainId },
  poolIdOrAddress,
}: {
  children: ReactNode
  network: { chainId: number; blockchainId: string }
  poolIdOrAddress: string
}) => {
  const { address: userAddress } = useConnection()
  const { curveApi: api = null } = useCurve()
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const poolData = useStore(state => state.pools.poolsMapper[chainId]?.[poolId ?? ''])
  const [isWrapped, setIsWrapped] = useState(() => isWrappedOnly(poolData.pool))

  return (
    <PoolContext
      value={useMemo(
        () => createPoolContextValue({ chainId, blockchainId, userAddress, poolData, api, isWrapped, setIsWrapped }),
        [chainId, blockchainId, poolData, userAddress, api, isWrapped, setIsWrapped],
      )}
    >
      {children}
    </PoolContext>
  )
}
