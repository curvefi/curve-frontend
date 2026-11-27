import { type ReactElement, useState } from 'react'
import { createPoolContextValue, PoolContext } from '@/dex/features/pool-context'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { CurveComponentTestWrapper } from '@cy/support/helpers/CurveComponentTestWrapper'
import type { CurveApi } from '@evm-ui/features/connect-wallet/lib/types'
import type { Address } from '@primitives/address.utils'
import { constQ } from '@ui/features/queries/util'

export const MockPoolTestWrapper = ({
  children,
  curve,
  pool,
}: {
  children: ReactElement
  curve: CurveApi
  pool: PoolTemplate
}) => {
  const [isWrapped, setIsWrapped] = useState(false)
  return (
    <CurveComponentTestWrapper curve={curve} connected={!!curve.signerAddress}>
      <PoolContext
        value={createPoolContextValue({
          chainId: curve.chainId,
          blockchainId: 'ethereum',
          userAddress: curve.signerAddress,
          pool: constQ(pool),
          apiPool: constQ(undefined),
          poolAddress: pool.address as Address,
          api: curve,
          isWrapped,
          setIsWrapped,
        })}
      >
        {children}
      </PoolContext>
    </CurveComponentTestWrapper>
  )
}
