import { useConfig, useConnection } from 'wagmi'
import { invalidatePoolInfo, invalidateUserPoolInfo } from '@/dex/queries/invalidation'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { invalidateTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import type { PoolQuery } from '@evm-ui/queries/query-types'
import { type EvmMutationOptions, type TransactionContext, useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import type { Address } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'

type PoolContext = TransactionContext & { pool: PoolTemplate; userAddress: Address }

type PoolMutationOptions<TVariables extends object> = Omit<
  EvmMutationOptions<TVariables, PoolContext>,
  'buildContext' | 'validationParams'
> &
  PoolQuery

export function usePoolMutation<TVariables extends object>({
  chainId,
  poolAddress,
  onSuccess,
  ...options
}: PoolMutationOptions<TVariables>) {
  const { address: userAddress } = useConnection()
  const config = useConfig()

  return useEvmMutation<TVariables, PoolContext>({
    ...options,
    validationParams: { chainId, poolAddress, userAddress },
    buildContext: (_variables, baseContext) => ({
      ...baseContext,
      pool: requireLib('curveApi').getPool(poolAddress),
      userAddress: assert(userAddress, 'Missing userAddress'),
    }),
    onSuccess: async (data, receipt, variables, context) => {
      const { userAddress, pool } = context
      await Promise.allSettled([
        invalidatePoolInfo({ chainId, poolAddress }),
        invalidateUserPoolInfo({ chainId, poolAddress, userAddress }),
        invalidateTokenBalances(config, {
          chainId,
          userAddress,
          tokenAddresses: [pool.lpToken, ...pool.underlyingCoinAddresses, ...pool.wrappedCoinAddresses] as Address[],
        }),
      ])
      await onSuccess?.(data, receipt, variables, context)
    },
  })
}
