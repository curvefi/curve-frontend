import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { useWithdrawEstimateGas } from '@/dex/queries/withdraw/withdraw-estimate-gas.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import type { WithdrawMode } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type FieldsOrQueries, type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawQuoteParams } from '../types'
import { getMaximumWithdrawBurn } from '../withdraw.utils'

export const WithdrawActionInfoList = ({
  params,
  mode,
  slippage,
  userAddress,
  minimumReceived,
  expectedLp,
  lpBalance,
  priceImpact,
  toSymbol,
  onSlippageChange,
}: {
  params: FieldsOrQueries<WithdrawQuoteParams>
  mode: WithdrawMode
  slippage: Decimal
  userAddress: Address | undefined
  minimumReceived?: QueryProp<Decimal>
  expectedLp: QueryProp<Decimal>
  lpBalance: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  toSymbol?: string
  onSlippageChange: (slippage: Decimal) => void
}) => {
  const { data: pool } = usePoolContext().pool

  return (
    <PoolActionInfoList
      {...(mode === 'unbalanced' && {
        maximumLp: mapQuery(expectedLp, value => getMaximumWithdrawBurn(value, { mode, slippage })), // Other modes burn a fixed LP amount.
      })}
      currentLp={lpBalance}
      currentLpTestId="pool-withdraw-current-lp"
      projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
      priceImpact={priceImpact}
      minimumReceived={minimumReceived}
      toSymbol={toSymbol}
      gas={useWithdrawEstimateGas(params)}
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      userAddress={userAddress}
      slippageType={getSlippageType(pool)}
    />
  )
}
