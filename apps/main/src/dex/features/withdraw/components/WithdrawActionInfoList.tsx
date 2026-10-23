import { useWithdrawPriceImpact } from '@/dex/queries/withdraw/withdraw-bonus.query'
import { useWithdrawEstimateGas } from '@/dex/queries/withdraw/withdraw-estimate-gas.query'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import type { SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { UserWithdrawParams } from '../types'

export const WithdrawActionInfoList = ({
  form,
  params,
  expectedLp,
  maximumLp,
  lpBalance,
  slippageType,
}: {
  form: UseFormReturn<WithdrawFormValues>
  params: UserWithdrawParams
  expectedLp: QueryProp<Decimal>
  maximumLp: QueryProp<Decimal>
  lpBalance: QueryProp<Decimal>
  slippageType: SlippageType | undefined
}) => (
  <PoolActionInfoList
    expectedLp={expectedLp}
    expectedLpLabel={t`Expected LP burned`}
    expectedLpTestId="pool-withdraw-expected-lp"
    maximumLp={maximumLp}
    currentLp={lpBalance}
    currentLpTestId="pool-withdraw-current-lp"
    projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
    projectedLpLabel={t`Expected remaining LP balance`}
    projectedLpTestId="pool-withdraw-projected-lp"
    priceImpact={useWithdrawPriceImpact(params)}
    gas={useWithdrawEstimateGas(params)}
    slippage={form.values.slippage}
    onSlippageChange={(slippage: Decimal) => form.update({ slippage })}
    userAddress={params.userAddress ?? undefined}
    slippageType={slippageType}
  />
)
