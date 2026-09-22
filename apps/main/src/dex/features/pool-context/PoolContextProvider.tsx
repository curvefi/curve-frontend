import { type ReactNode, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { isWrappedOnly } from '@/dex/pool.utils'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { PoolContext } from './PoolContext'
import { createPoolContextValue } from './PoolContextValue'

export const PoolContextProvider = ({
  children,
  network: { chainId, blockchainId },
  pool,
}: {
  children: ReactNode
  network: { chainId: number; blockchainId: string }
  pool: PoolTemplate
}) => {
  const { address: userAddress } = useConnection()
  const { curveApi: api = null } = useCurve()
  const [isWrapped, setIsWrapped] = useState(() => isWrappedOnly(pool))

  return (
    <PoolContext
      value={useMemo(
        () => createPoolContextValue({ chainId, blockchainId, userAddress, pool, api, isWrapped, setIsWrapped }),
        [chainId, blockchainId, pool, userAddress, api, isWrapped, setIsWrapped],
      )}
    >
      {children}
    </PoolContext>
  )
}
