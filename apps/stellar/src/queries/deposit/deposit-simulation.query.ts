import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import type { DepositParams, DepositQuery } from '@/stellar/features/deposit/types'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { depositValidationSuite } from '@/stellar/queries/validation/deposit.validation'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { toBigIntArray, toWei, toWeiArray } from '@ui/lib/decimal'

export const {
  useQuery: useDepositSimulation,
  invalidate: invalidateDepositSimulation,
  fetchQuery: fetchDepositSimulation,
} = queryFactory({
  queryKey: ({ network, pool, amounts, decimals, account, quote, slippage, supply, maxAmounts }: DepositParams) =>
    ({
      name: 'add_liquidity',
      network,
      pool,
      amounts,
      decimals,
      account,
      quote,
      slippage,
      supply,
      maxAmounts,
    }) as const,
  queryFn: ({ network, pool, account, amounts, decimals, quote, slippage }: DepositQuery) =>
    simulateContractCall<bigint>(
      network,
      pool,
      'add_liquidity',
      [
        account,
        toBigIntArray(toWeiArray(amounts, decimals)).map(amount => amount ?? 0n),
        BigInt(toWei(calculateMinimumMint(quote, slippage), LP_TOKEN_DECIMALS)),
        account,
      ],
      account,
    ),
  category: 'stellar.transaction',
  validationSuite: depositValidationSuite,
})
