import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { useWithdrawEstimateGas } from '@/dex/queries/withdraw/withdraw-estimate-gas.query'
import type { Decimal } from '@primitives/decimal.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawQuoteParams } from '../types'

export const WithdrawActionInfoList = ({
  params,
  expectedLp,
  maximumLp,
  lpBalance,
  priceImpact,
  onSlippageChange,
}: {
  params: WithdrawQuoteParams
  expectedLp: QueryProp<Decimal>
  maximumLp: QueryProp<Decimal>
  lpBalance: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  onSlippageChange: (slippage: Decimal) => void
}) => (
  <PoolActionInfoList
    maximumLp={params.mode === 'unbalanced' ? maximumLp : undefined}
    currentLp={lpBalance}
    currentLpTestId="pool-withdraw-current-lp"
    projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
    priceImpact={priceImpact}
    gas={useWithdrawEstimateGas(params)}
    slippage={params.slippage}
    onSlippageChange={onSlippageChange}
    userAddress={params.userAddress ?? undefined}
    slippageType={getSlippageType(usePoolContext().pool.data)}
  />
)
