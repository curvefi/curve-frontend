import { asAddress } from '@/stellar/features/connect-wallet/address'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { WithdrawFormQuery } from './types'
import { useWithdrawPriceImpact } from './useWithdrawPriceImpact'

export const WithdrawActionInfoList = ({
  params,
  expectedLp,
  maximumLp,
  onSlippageChange,
}: {
  params: WithdrawFormQuery
  expectedLp: QueryProp<Decimal>
  maximumLp: QueryProp<Decimal>
  onSlippageChange: (slippage: Decimal) => void
}) => {
  const queryParams = { ...params, amounts: getPoolAmounts(params, params.tokenCount) }
  const simulation = useWithdrawSimulation({ ...queryParams, expected: expectedLp.data, maximumBurn: maximumLp.data })
  const lpBalance = useTokenBalance({ ...params, token: params.pool, decimals: LP_TOKEN_DECIMALS })

  return (
    <PoolActionInfoList
      slippageType="stable"
      expectedLp={expectedLp}
      expectedLpLabel={t`Expected LP burned`}
      expectedLpTestId="pool-withdraw-expected-lp"
      maximumLp={maximumLp}
      currentLp={q(lpBalance)}
      currentLpTestId="pool-withdraw-current-lp"
      projectedLp={combineQueries([lpBalance, expectedLp], decimalMinus)}
      projectedLpLabel={t`Expected remaining LP balance`}
      projectedLpTestId="pool-withdraw-projected-lp"
      priceImpact={useWithdrawPriceImpact(queryParams, expectedLp)}
      gas={useGasEstimation(params, simulation)}
      slippage={params.slippage}
      onSlippageChange={onSlippageChange}
      userAddress={asAddress(params.account)}
    />
  )
}
