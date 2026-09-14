import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  type DepositParams,
  type DepositQuery,
  depositValidationSuite,
} from '@/stellar/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { toBigIntArray, toWei, toWeiArray } from '@ui/lib/decimal'

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
  category: 'global.no-persist', // todo: the values returned by the SDK lose the built transaction, so disable persistance for now
  validationSuite: depositValidationSuite,
})
