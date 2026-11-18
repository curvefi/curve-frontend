import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useWithdrawPriceImpact } from '@/dex/queries/withdraw/withdraw-bonus.query'
import { useWithdrawEstimateGas } from '@/dex/queries/withdraw/withdraw-estimate-gas.query'
import { useWithdrawExpectedLp } from '@/dex/queries/withdraw/withdraw-expected.query'
import type { Decimal } from '@primitives/decimal.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawQuoteParams } from '../types'
import { getMaximumWithdrawBurn } from '../withdraw.utils'

export const WithdrawActionInfoList = ({
  params,
  onSlippageChange,
}: {
  params: WithdrawQuoteParams
  onSlippageChange: (slippage: Decimal) => void
}) => {
  const expectedLp = q(useWithdrawExpectedLp(params))
  const { lpTokenBalance: lpBalance } = usePoolTokenDepositBalances(params)
  const priceImpact = useWithdrawPriceImpact(params)
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
      userAddress={params.userAddress}
      slippageType={getSlippageType(usePoolContext().pool.data)}
    />
  )
}
