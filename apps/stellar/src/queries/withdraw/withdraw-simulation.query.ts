import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { WithdrawSimulationParams, WithdrawSimulationQuery } from '@/stellar/features/withdraw/types'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { withdrawSimulationValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
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
    mode,
    maximumBurn,
    supply,
    maxAmounts,
    lpAmount,
    maxLpAmount,
    tokenIndex,
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
      mode,
      maximumBurn,
      supply,
      maxAmounts,
      lpAmount,
      maxLpAmount,
      tokenIndex,
      seedLock,
      expected,
      slippage,
    }) as const,
  queryFn: async ({
    network,
    pool,
    account,
    mode,
    amounts,
    decimals,
    maximumBurn,
    lpAmount,
    tokenIndex,
    slippage,
  }: WithdrawSimulationQuery) => {
    // todo: use switch
    if (mode === 'balanced') {
      return simulateContractCall<bigint[]>(
        network,
        pool,
        'remove_liquidity',
        [
          account,
          BigInt(toWei(lpAmount!, LP_TOKEN_DECIMALS)),
          amounts.map((amount, index) =>
            BigInt(toWei(calculateMinimumReceived(amount!, slippage, decimals[index]), decimals[index])),
          ),
          account,
          false, // Do not sweep admin fees as part of the user's withdrawal.
        ],
        account,
      )
    }
    if (mode === 'unbalanced') {
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
        BigInt(toWei(lpAmount!, LP_TOKEN_DECIMALS)),
        tokenIndex!,
        BigInt(
          toWei(
            calculateMinimumReceived(amounts[tokenIndex!]!, slippage, decimals[tokenIndex!]),
            decimals[tokenIndex!],
          ),
        ),
        account,
      ],
      account,
    )
  },
  category: 'global.no-persist', // values returned by the SDK lose the built transaction, disable persistence for now
  validationSuite: withdrawSimulationValidationSuite,
})
