import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { useWithdrawEstimateGas } from '@/dex/queries/withdraw/withdraw-estimate-gas.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawQuoteParams } from '../types'
import { getMaximumWithdrawBurn } from '../withdraw.utils'

export const WithdrawActionInfoList = ({
  params,
  expectedLp,
  lpBalance,
  priceImpact,
  toSymbol,
  onSlippageChange,
}: {
  params: WithdrawQuoteParams
  expectedLp: QueryProp<Decimal>
  lpBalance: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  toSymbol?: string
  onSlippageChange: (slippage: Decimal) => void
}) => (
  <PoolActionInfoList
    {...(params.mode === 'unbalanced' && {
      maximumLp: mapQuery(expectedLp, expected => getMaximumWithdrawBurn(expected, params)),
    })}
    currentLp={lpBalance}
    currentLpTestId="pool-withdraw-current-lp"
    projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
    priceImpact={priceImpact}
    {...(params.mode === 'one-coin' && {
      minimumReceived: mapQuery(expectedLp, () =>
        maybes([params.amounts?.[params.tokenIndex!], params.decimals?.[params.tokenIndex!]], (amount, precision) =>
          calculateMinimumReceived(amount, params.slippage, precision),
        ),
      ),
    })}
    toSymbol={toSymbol}
    gas={useWithdrawEstimateGas(params)}
    slippage={params.slippage}
    onSlippageChange={onSlippageChange}
    userAddress={params.userAddress}
    slippageType={getSlippageType(usePoolContext().pool.data)}
  />
)
