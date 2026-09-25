import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  quoteValidationSuite,
  type ExpectedLpParams,
  type ExpectedLpQuery,
} from '@/stellar/queries/validation/liquidity.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei, toWeiArray, toBigIntArray } from '@ui/lib/decimal'

export const {
  useQuery: useExpectedLp,
  invalidate: invalidateExpectedLp,
  fetchQuery: fetchExpectedLp,
} = queryFactory({
  queryKey: ({ network, pool, amounts, decimals, supply, isDeposit, maxAmounts }: ExpectedLpParams) =>
    [
      rootKeys.pool({ network, pool }),
      {
        name: 'calc_token_amount',
        amounts,
        decimals,
        supply,
        isDeposit,
        maxAmounts: isDeposit ? undefined : maxAmounts,
      },
    ] as const,
  queryFn: async ({ network, pool, amounts, decimals, isDeposit }: ExpectedLpQuery) =>
    fromWei(
      await readContract<bigint>(network, pool, 'calc_token_amount', [
        toBigIntArray(toWeiArray(amounts, decimals)).map(amount => amount ?? 0n),
        isDeposit,
      ]),
      LP_TOKEN_DECIMALS,
    ),
  category: 'dex.deposit',
  validationSuite: quoteValidationSuite,
})
