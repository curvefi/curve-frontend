import { BigNumber } from 'bignumber.js'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import {
  type ExpectedLpParams,
  type ExpectedLpQuery,
  quoteValidationSuite,
} from '@/stellar/queries/validation/liquidity.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { decimalRound, fromWei, toBigIntArray, toWeiArray } from '@ui/lib/decimal'

/** The imbalance quote excludes the smallest LP amount added by execution. */
const calculateExpectedLp = (quote: Decimal): Decimal =>
  new BigNumber(quote)
    .decimalPlaces(LP_TOKEN_DECIMALS, BigNumber.ROUND_DOWN)
    .plus(`1e-${LP_TOKEN_DECIMALS}`)
    .toFixed() as Decimal

export const { useQuery: useExpectedLp, invalidate: invalidateExpectedLp } = queryFactory({
  queryKey: ({
    network,
    pool,
    amounts,
    decimals,
    supply,
    isDeposit,
    isBalanced,
    maxAmounts,
    lpAmount,
    maxLpAmount,
    isExactBurn,
  }: ExpectedLpParams) =>
    ({
      name: 'calc_token_amount',
      network,
      pool,
      amounts,
      decimals,
      supply,
      isDeposit,
      isBalanced: isDeposit ? undefined : isBalanced,
      maxAmounts: isDeposit ? undefined : maxAmounts,
      lpAmount: isDeposit ? undefined : lpAmount,
      maxLpAmount: isDeposit ? undefined : maxLpAmount,
      isExactBurn: isDeposit ? undefined : isExactBurn,
    }) as const,
  queryFn: async ({
    network,
    pool,
    amounts,
    decimals,
    isDeposit,
    isBalanced,
    lpAmount,
    isExactBurn,
  }: ExpectedLpQuery): Promise<Decimal> => {
    if (!isDeposit && (isBalanced || isExactBurn)) {
      return decimalRound(lpAmount!, LP_TOKEN_DECIMALS)
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
