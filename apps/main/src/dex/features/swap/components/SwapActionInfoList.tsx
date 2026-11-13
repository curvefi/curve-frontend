import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { useSwapEstimateGas } from '@/dex/queries/swap/swap-estimate-gas.query'
import { useSwapPriceImpact } from '@/dex/queries/swap/swap-price-impact.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimalDiv } from '@ui/lib/decimal'
import type { UserSwapParams } from '../types'

export const SwapActionInfoList = ({
  form,
  params,
  inputAmount,
  expectedOutput,
  fromSymbol,
  toSymbol,
}: {
  form: UseFormReturn<SwapFormValues>
  params: UserSwapParams
  inputAmount: QueryProp<Decimal>
  expectedOutput: QueryProp<Decimal>
  fromSymbol: string | undefined
  toSymbol: string | undefined
}) => {
  const { slippage, decimals, toIndex } = form.values
  return (
    <PoolActionInfoList
      exchangeRate={combineQueries([inputAmount, expectedOutput], (input, output) => decimalDiv(output, input))}
      minimumReceived={mapQuery(expectedOutput, output =>
        maybe(decimals?.[toIndex], precision => calculateMinimumReceived(output, slippage, precision)),
      )}
      priceImpact={q(useSwapPriceImpact(params))}
      gas={useSwapEstimateGas(params)}
      slippage={slippage}
      onSlippageChange={(slippage: Decimal) => form.update({ slippage })}
      slippageType={getSlippageType(usePoolContext().pool.data)}
      userAddress={params.userAddress ?? undefined}
      fromSymbol={fromSymbol}
      toSymbol={toSymbol}
    />
  )
}
