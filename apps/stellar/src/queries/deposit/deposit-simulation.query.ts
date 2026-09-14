import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  depositValidationSuite,
  type DepositQuery,
  type DepositParams,
} from '@/stellar/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { toWei, toWeiArray, toBigIntArray } from '@ui/lib/decimal'

export const {
  useQuery: useDepositSimulation,
  fetchQuery: fetchDepositSimulation,
  invalidate: invalidateDepositSimulation,
} = queryFactory({
  queryKey: ({ network, pool, amounts, decimals, account, minMint, supply, maxAmounts }: DepositParams) =>
    [
      ...rootKeys.pool({ network, pool }),
      'add_liquidity',
      { amounts },
      { decimals },
      { account },
      { minMint },
      { supply },
      { maxAmounts },
    ] as const,
  queryFn: ({ network, pool, account, amounts, decimals, minMint }: DepositQuery) =>
    simulateContractCall<bigint>(
      network,
      pool,
      'add_liquidity',
      [
        account,
        toBigIntArray(toWeiArray(amounts, decimals)).map(amount => amount ?? 0n),
        BigInt(toWei(minMint, LP_TOKEN_DECIMALS)),
        account,
      ],
      account,
    ),
  category: 'stellar.simulation',
  validationSuite: depositValidationSuite,
})
