import { asAddress } from '@/stellar/features/connect-wallet/address'
import { calculateMaximumBurn } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { useWithdrawExpectedLp } from '@/stellar/queries/withdraw/withdraw-lp.query'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawQuoteParams } from './types'
import { useWithdrawPriceImpact } from './useWithdrawPriceImpact'

export const WithdrawActionInfoList = ({
  params,
  toSymbol,
  onSlippageChange,
}: {
  params: WithdrawQuoteParams
  toSymbol?: string
  onSlippageChange: (slippage: Decimal) => void
}) => {
  const expectedLp = useWithdrawExpectedLp(params)
  const lpBalance = q(useTokenBalance({ ...params, token: params.pool, decimals: LP_TOKEN_DECIMALS }))
  const simulation = useWithdrawSimulation({ ...params, expectedLp: expectedLp.data })

  return (
    <PoolActionInfoList
      {...(params.mode === 'unbalanced' && {
        maximumLp: mapQuery(expectedLp, value => calculateMaximumBurn(value, params.slippage)), // Other modes burn a fixed LP amount.
      })}
      slippageType="stable"
      currentLp={lpBalance}
      currentLpTestId="pool-withdraw-current-lp"
      projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
      priceImpact={useWithdrawPriceImpact(params, expectedLp)}
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
