import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import type { SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import type { QueryProp } from '@ui/features/queries/util'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimal, decimalMinus, decimalMultiply, decimalNegate } from '@ui/lib/decimal'
import { useDepositBonus, useDepositEstimateGas, useDepositExpected } from '../deposit.query'
import type { DepositFormState, DepositParams } from '../types'

type DepositActionInfoListProps = {
  form: UseFormReturn<DepositFormState>
  params: DepositParams
  isSeed: QueryProp<boolean>
  slippageType: SlippageType
}

export const DepositActionInfoList = ({ form, params, isSeed, slippageType }: DepositActionInfoListProps) => {
  const slippage = form.watchValue('slippage')
  const expected = useDepositExpected(params)
  return (
    <PoolActionInfoList
      expectedLp={q(expected)}
      expectedLpLabel="Expected LP received"
      expectedLpTestId="pool-deposit-expected-lp"
      minimumLp={mapQuery(expected, expected =>
        decimal(decimalMultiply(expected, decimalMinus('1', decimalMultiply(slippage, '0.01'))))!,
      )}
      priceImpact={mapQuery(useDepositBonus(params, isSeed.data === false), decimalNegate)}
      gas={useDepositEstimateGas(params)}
      slippage={slippage}
      onSlippageChange={(slippage: Decimal) => form.update({ slippage })}
      userAddress={params.userAddress ?? undefined}
      slippageType={slippageType}
    />
  )
}
