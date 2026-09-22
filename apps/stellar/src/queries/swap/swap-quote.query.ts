import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { SwapQuoteParams, SwapQuoteQuery } from '@/stellar/features/swap/types'
import { rootKeys } from '@/stellar/queries/root-keys'
import { swapQuoteValidationSuite } from '@/stellar/queries/validation/swap.validation'
import { SWAP_FIELDS } from '@ui/features/pool-forms/swap/swap-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei, toWei } from '@ui/lib/decimal'

const QUOTE_METHODS = { pay: 'get_dy', receive: 'get_dx' } as const

/** Get the amount and decimals for the edited side of the swap. */
function getAmountAndDecimals({
  editedSide,
  inputAmount,
  outputAmount,
  fromIndex,
  toIndex,
  decimals,
}: Omit<SwapQuoteQuery, 'network' | 'pool' | 'maxOutput'>) {
  const { amountField, amountIndexField, calculatedIndexField } = SWAP_FIELDS[editedSide]
  const [amountDecimals, calculatedDecimals] = [amountIndexField, calculatedIndexField].map(
    index => decimals[{ fromIndex, toIndex }[index]],
  )
  return { amount: { inputAmount, outputAmount }[amountField], amountDecimals, calculatedDecimals }
}

export const {
  useQuery: useSwapQuote,
  fetchQuery: fetchSwapQuote,
  getQueryOptions: getSwapQuoteQueryOptions,
} = queryFactory({
  queryKey: ({
    network,
    pool,
    fromIndex,
    toIndex,
    inputAmount,
    outputAmount,
    decimals,
    editedSide,
    maxOutput,
  }: SwapQuoteParams) =>
    [
      ...rootKeys.pool({ network, pool }),
      'swap-quote',
      { editedSide },
      { fromIndex },
      { toIndex },
      { decimals },
      // use only the key fields relevant to the side being quoted
      { inputAmount: editedSide === 'pay' ? inputAmount : undefined },
      { outputAmount: editedSide === 'receive' ? outputAmount : undefined },
      { maxOutput: editedSide === 'receive' ? maxOutput : undefined },
    ] as const,
  queryFn: async ({
    network,
    pool,
    fromIndex,
    toIndex,
    inputAmount,
    outputAmount,
    decimals,
    editedSide,
  }: SwapQuoteQuery) => {
    const { amount, amountDecimals, calculatedDecimals } = getAmountAndDecimals({
      editedSide,
      inputAmount,
      outputAmount,
      fromIndex,
      toIndex,
      decimals,
    })
    return fromWei(
      await readContract<bigint>(network, pool, QUOTE_METHODS[editedSide], [
        fromIndex,
        toIndex,
        BigInt(toWei(amount, amountDecimals)),
      ]),
      calculatedDecimals,
    )
  },
  category: 'dex.swap',
  validationSuite: swapQuoteValidationSuite,
})
