import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { WithdrawSimulationParams, WithdrawSimulationQuery } from '@/stellar/features/withdraw/types'
import { withdrawSimulationValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { getSingleCoinWithdrawIndex } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { toBigIntArray, toWei, toWeiArray } from '@ui/lib/decimal'

export const {
  useQuery: useWithdrawSimulation,
  invalidate: invalidateWithdrawSimulation,
  fetchQuery: fetchWithdrawSimulation,
} = queryFactory({
  queryKey: ({
    network,
    pool,
    amounts,
    decimals,
    account,
    isBalanced,
    maximumBurn,
    supply,
    maxAmounts,
    lpAmount,
    maxLpAmount,
    maxWithdrawIndex,
    seedLock,
    expected,
    slippage,
  }: WithdrawSimulationParams) =>
    ({
      name: 'remove_liquidity',
      network,
      pool,
      amounts,
      decimals,
      account,
      isBalanced,
      maximumBurn,
      supply,
      maxAmounts,
      lpAmount,
      maxLpAmount,
      maxWithdrawIndex,
      seedLock,
      expected,
      slippage,
    }) as const,
  queryFn: async ({
    network,
    pool,
    account,
    isBalanced,
    amounts,
    decimals,
    maximumBurn,
    lpAmount,
    maxLpAmount,
    maxWithdrawIndex,
    slippage,
  }: WithdrawSimulationQuery) => {
    if (isBalanced) {
      return simulateContractCall<bigint[]>(
        network,
        pool,
        'remove_liquidity',
        [
          account,
          BigInt(toWei(lpAmount, LP_TOKEN_DECIMALS)),
          amounts.map((amount, index) =>
            BigInt(toWei(calculateMinimumReceived(amount!, slippage, decimals[index]), decimals[index])),
          ),
          account,
          false, // Do not sweep admin fees as part of the user's withdrawal.
        ],
        account,
      )
    }
    const index = getSingleCoinWithdrawIndex({ maxWithdrawIndex, lpAmount, maxLpAmount })
    if (index == null) {
      return simulateContractCall<bigint>(
        network,
        pool,
        'remove_liquidity_imbalance',
        [
          account,
          toBigIntArray(toWeiArray(amounts, decimals)).map(amount => amount ?? 0n),
          BigInt(toWei(maximumBurn, LP_TOKEN_DECIMALS)),
          account,
        ],
        account,
      )
    }
    return simulateContractCall<bigint>(
      network,
      pool,
      'remove_liquidity_one_coin',
      [
        account,
        BigInt(toWei(lpAmount, LP_TOKEN_DECIMALS)),
        index,
        BigInt(toWei(calculateMinimumReceived(amounts[index]!, slippage, decimals[index]), decimals[index])),
        account,
      ],
      account,
    )
  },
  category: 'global.no-persist', // values returned by the SDK lose the built transaction, disable persistence for now
  validationSuite: withdrawSimulationValidationSuite,
})
