import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Decimal } from '@primitives/decimal.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawQuoteParams } from './types'

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
}) => {
  const simulation = useWithdrawSimulation({ ...params, expected: expectedLp.data, maximumBurn: maximumLp.data })

  return (
    <PoolActionInfoList
      slippageType="stable"
      currentLp={lpBalance}
      currentLpTestId="pool-withdraw-current-lp"
      projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
      priceImpact={priceImpact}
      gas={useGasEstimation(params, simulation)}
      slippage={params.slippage}
      onSlippageChange={onSlippageChange}
      userAddress={asAddress(params.account)}
    />
  )
}
