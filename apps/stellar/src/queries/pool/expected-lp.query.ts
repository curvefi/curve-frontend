import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  quoteValidationSuite,
  type QuoteParams,
  type QuoteQuery,
} from '@/stellar/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei, toWeiArray, toBigIntArray } from '@ui/lib/decimal'

type ExpectedLpParams = QuoteParams & { isDeposit: boolean }
type ExpectedLpQuery = QuoteQuery & { isDeposit: boolean }

export const {
  useQuery: useExpectedLp,
  fetchQuery: fetchExpectedLp,
  invalidate: invalidateExpectedLp,
} = queryFactory({
  queryKey: ({ network, pool, amounts, decimals, supply, isDeposit }: ExpectedLpParams) =>
    [
      ...rootKeys.pool({ network, pool }),
      'calc_token_amount',
      { amounts },
      { decimals },
      { supply },
      { isDeposit },
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
