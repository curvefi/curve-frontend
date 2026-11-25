import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { useWithdrawEstimateGas } from '@/dex/queries/withdraw/withdraw-estimate-gas.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import { getWithdrawMinimumAmounts } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { useAdvancedWithdrawForm } from '../hooks/useAdvancedWithdrawForm'
import type { useOneCoinWithdrawForm } from '../hooks/useOneCoinWithdrawForm'
import { getMaximumWithdrawBurn } from '../withdraw.utils'

export const WithdrawActionInfoList = ({
  params,
  tokens,
  userAddress,
  expectedLp,
  lpBalance,
  priceImpact,
  onSlippageChange,
}: {
  params: ReturnType<typeof useAdvancedWithdrawForm | typeof useOneCoinWithdrawForm>['params']
  tokens: QueryProp<PoolToken>[] | undefined
  userAddress: Address | undefined
  expectedLp: QueryProp<Decimal>
  lpBalance: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  onSlippageChange: (slippage: Decimal) => void
}) => {
  const { data: pool } = usePoolContext().pool

  return (
    <PoolActionInfoList
      {...(params.mode === 'unbalanced' && {
        maximumLp: mapQuery(expectedLp, value => getMaximumWithdrawBurn(value, params)), // Other modes burn a fixed LP amount.
      })}
      currentLp={lpBalance}
      currentLpTestId="pool-withdraw-current-lp"
      projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
      priceImpact={priceImpact}
      gas={useWithdrawEstimateGas(params)}
      slippage={params.slippage}
      onSlippageChange={onSlippageChange}
      userAddress={userAddress}
      slippageType={getSlippageType(pool)}
      minimumReceived={getWithdrawMinimumAmounts({ ...params, isApproximate: true }, tokens, expectedLp)}
    />
  )
}
