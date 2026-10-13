import { BigNumber } from 'bignumber.js'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import {
  type ExpectedLpParams,
  type ExpectedLpQuery,
  quoteValidationSuite,
} from '@/stellar/queries/validation/liquidity.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { getSingleCoinWithdrawIndex } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei, toBigIntArray, toWeiArray } from '@ui/lib/decimal'

/** The imbalance quote excludes the smallest LP amount added by execution. */
const calculateExpectedLp = (quote: Decimal): Decimal =>
  new BigNumber(quote)
    .decimalPlaces(LP_TOKEN_DECIMALS, BigNumber.ROUND_DOWN)
    .plus(`1e-${LP_TOKEN_DECIMALS}`)
    .toFixed() as Decimal

export const {
  useQuery: useExpectedLp,
  invalidate: invalidateExpectedLp,
  fetchQuery: fetchExpectedLp,
} = queryFactory({
  queryKey: ({
    network,
    pool,
    amounts,
    decimals,
    supply,
    isDeposit,
    maxAmounts,
    lpAmount,
    maxLpAmount,
    maxWithdrawIndex,
  }: ExpectedLpParams) =>
    ({
      name: 'calc_token_amount',
      network,
      pool,
      amounts,
      decimals,
      supply,
      isDeposit,
      maxAmounts: isDeposit ? undefined : maxAmounts,
      lpAmount: isDeposit ? undefined : lpAmount,
      maxLpAmount: isDeposit ? undefined : maxLpAmount,
      maxWithdrawIndex: isDeposit ? undefined : maxWithdrawIndex,
    }) as const,
  queryFn: async ({
    network,
    pool,
    amounts,
    decimals,
    isDeposit,
    lpAmount,
    maxLpAmount,
    maxWithdrawIndex,
  }: ExpectedLpQuery): Promise<Decimal> => {
    if (!isDeposit && getSingleCoinWithdrawIndex({ maxWithdrawIndex, lpAmount, maxLpAmount }) != null) {
      return lpAmount!
    }
    const quote = fromWei(
      await readContract<bigint>(network, pool, 'calc_token_amount', [
        toBigIntArray(toWeiArray(amounts, decimals)).map(amount => amount ?? 0n),
        isDeposit,
      ]),
      LP_TOKEN_DECIMALS,
    )
    return isDeposit ? quote : calculateExpectedLp(quote)
  },
  category: 'dex.deposit',
  validationSuite: quoteValidationSuite,
})
