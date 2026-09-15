import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { rootKeys } from '@/stellar/queries/root-keys'
import { type PoolParams, type PoolQuery, poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei } from '@ui/lib/decimal'

type PoolConfig = { tokens: StellarContract[]; n_coins: number; min_locked_liquidity: bigint }

export const { useQuery: usePoolConfig, fetchQuery: fetchPoolConfig } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => [...rootKeys.pool({ network, pool }), 'config'] as const,
  queryFn: async ({ network, pool }: PoolQuery) => {
    const { min_locked_liquidity, tokens } = await readContract<PoolConfig>(network, pool, 'config')
    return { tokens, seedLock: fromWei(min_locked_liquidity, LP_TOKEN_DECIMALS) }
  },
  category: 'dex.poolParams',
  validationSuite: poolValidationSuite,
})
