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

const IS_DEPOSIT = true

export const {
  useQuery: useExpectedLp,
  fetchQuery: fetchExpectedLp,
  invalidate: invalidateExpectedLp,
} = queryFactory({
  queryKey: ({ network, pool, amounts, decimals, supply }: QuoteParams) =>
    [...rootKeys.pool({ network, pool }), 'calc_token_amount', { amounts }, { decimals }, { supply }] as const,
  queryFn: async ({ network, pool, amounts, decimals }: QuoteQuery) =>
    fromWei(
      (
        await readContract<bigint>(network, pool, 'calc_token_amount', [
          toBigIntArray(toWeiArray(amounts, decimals)).map(amount => amount ?? 0n),
          IS_DEPOSIT,
        ])
      ).toString(),
      LP_TOKEN_DECIMALS,
    ),
  category: 'dex.deposit',
  validationSuite: quoteValidationSuite,
})
