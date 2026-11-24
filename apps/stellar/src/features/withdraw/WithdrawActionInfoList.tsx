import { calculateMaximumBurn } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import type { StellarNetwork } from '@/stellar/lib/networks'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { useAdvancedWithdrawForm } from './useAdvancedWithdrawForm'
import type { useOneCoinWithdrawForm } from './useOneCoinWithdrawForm'

export const WithdrawActionInfoList = ({
  params,
  network,
  userAddress,
  minimumReceived,
  expectedLp,
  lpBalance,
  priceImpact,
  toSymbol,
  onSlippageChange,
}: {
  params: ReturnType<typeof useAdvancedWithdrawForm | typeof useOneCoinWithdrawForm>['params']
  network: StellarNetwork
  userAddress: Address | undefined
  minimumReceived?: QueryProp<Decimal>
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
      minimumReceived={minimumReceived}
      toSymbol={toSymbol}
      gas={useGasEstimation({ network }, simulation)}
      slippage={params.slippage}
      onSlippageChange={onSlippageChange}
      userAddress={userAddress}
    />
  )
}
