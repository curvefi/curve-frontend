import { asAddress } from '@/stellar/features/connect-wallet/address'
import { calculateMaximumBurn } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawQuoteParams } from './types'

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
}) => {
  const simulation = useWithdrawSimulation({ ...params, expectedLp })
  return (
    <PoolActionInfoList
      {...(params.mode === 'unbalanced' && {
        maximumLp: mapQuery(expectedLp, value => calculateMaximumBurn(value, params.slippage)), // Other modes burn a fixed LP amount.
      })}
      slippageType="stable"
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
      gas={useGasEstimation(params, simulation)}
      slippage={params.slippage}
      onSlippageChange={onSlippageChange}
      userAddress={asAddress(params.account)}
    />
  )
}
