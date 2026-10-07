import { useDepositBonus } from '@/dex/queries/deposit/deposit-bonus.query'
import { useDepositEstimateGas } from '@/dex/queries/deposit/deposit-estimate-gas.query'
import { useDepositExpected } from '@/dex/queries/deposit/deposit-expected.query'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import type { SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import type { QueryProp } from '@ui/features/queries/util'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimalMinus, decimalMultiply, decimalNegate } from '@ui/lib/decimal'
import type { DepositFormValues, UserDepositParams } from '../types'

type DepositActionInfoListProps = {
  form: UseFormReturn<DepositFormValues>
  params: UserDepositParams
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
        decimalMultiply(expected, decimalMinus('1', decimalMultiply(slippage, '0.01'))),
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
