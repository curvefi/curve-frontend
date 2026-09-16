import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  type WithdrawSimulationParams,
  type WithdrawSimulationQuery,
  withdrawSimulationValidationSuite,
} from '@/stellar/queries/validation/withdraw.validation'
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
    maximumBurn,
    supply,
    maxAmounts,
    lpAmount,
    maxLpAmount,
    seedLock,
    quote,
    slippage,
  }: WithdrawSimulationParams) =>
    [
      ...rootKeys.pool({ network, pool }),
      'remove_liquidity_imbalance',
      { amounts },
      { decimals },
      { account },
      { maximumBurn },
      { supply },
      { maxAmounts },
      { lpAmount },
      { maxLpAmount },
      { seedLock },
      { quote },
      { slippage },
    ] as const,
  queryFn: ({ network, pool, account, amounts, decimals, maximumBurn }: WithdrawSimulationQuery) =>
    simulateContractCall<bigint>(
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
    ),
  category: 'global.no-persist', // the values returned by the SDK lose the built transaction, disable persistence for now
  validationSuite: withdrawSimulationValidationSuite,
})
