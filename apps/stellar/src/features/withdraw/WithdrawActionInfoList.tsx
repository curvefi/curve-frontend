import { calculateMaximumBurn } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import type { StellarNetwork } from '@/stellar/lib/networks'
import { STELLAR_SLIPPAGE_TYPE } from '@/stellar/lib/pool.constants'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import { getWithdrawMinimumAmounts } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { useAdvancedWithdrawForm } from './useAdvancedWithdrawForm'
import type { useOneCoinWithdrawForm } from './useOneCoinWithdrawForm'

export const WithdrawActionInfoList = ({
  params,
  tokens,
  network,
  userAddress,
  expectedLp,
  lpBalance,
  priceImpact,
  onSlippageChange,
}: {
  params: ReturnType<typeof useAdvancedWithdrawForm | typeof useOneCoinWithdrawForm>['params']
  tokens: QueryProp<PoolToken>[] | undefined
  network: StellarNetwork
  userAddress: Address | undefined
  expectedLp: QueryProp<Decimal>
  lpBalance: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  onSlippageChange: (slippage: Decimal) => void
}) => {
  const simulation = useWithdrawSimulation({ ...params, expectedLp })
  return (
    <PoolActionInfoList
      {...(params.mode === 'unbalanced' && {
        maximumLp: mapQuery(expectedLp, value => calculateMaximumBurn(value, params.slippage)), // Other modes burn a fixed LP amount.
      })}
      slippageType={STELLAR_SLIPPAGE_TYPE}
      currentLp={lpBalance}
      currentLpTestId="pool-withdraw-current-lp"
      projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
      priceImpact={priceImpact}
      gas={useGasEstimation({ network }, simulation)}
      slippage={params.slippage}
      onSlippageChange={onSlippageChange}
      userAddress={userAddress}
      minimumWithdrawAmounts={getWithdrawMinimumAmounts(params, tokens, expectedLp)}
    />
  )
}
