import { asAddress } from '@/stellar/features/connect-wallet/address'
import { calculateExpectedBurn, calculateMaximumBurn, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { WithdrawFormQuery } from './types'
import { useWithdrawPriceImpact } from './useWithdrawPriceImpact'

export const WithdrawActionInfoList = ({
  onSlippageChange,
  ...params
}: WithdrawFormQuery & { onSlippageChange: (slippage: Decimal) => void }) => {
  const queryParams = { ...params, amounts: getPoolAmounts(params, params.tokenCount) }
  const quote = useExpectedLp({ ...queryParams, isDeposit: false })
  const expected = mapQuery(quote, calculateExpectedBurn)
  const maximum = mapQuery(expected, value => calculateMaximumBurn(value, params.slippage))
  const simulation = useWithdrawSimulation({ ...queryParams, quote: quote.data, maximumBurn: maximum.data })
  const lpBalance = useTokenBalance({ ...params, token: params.pool, decimals: LP_TOKEN_DECIMALS })

  return (
    <PoolActionInfoList
      expectedLp={expected}
      expectedLpLabel={t`Expected LP burned`}
      expectedLpTestId="pool-withdraw-expected-lp"
      maximumLp={maximum}
      currentLp={q(lpBalance)}
      currentLpTestId="pool-withdraw-current-lp"
      projectedLp={combineQueries([lpBalance, expected], decimalMinus)}
      projectedLpLabel={t`Expected remaining LP balance`}
      projectedLpTestId="pool-withdraw-projected-lp"
      priceImpact={useWithdrawPriceImpact(queryParams, expected)}
      gas={useGasEstimation(params, simulation)}
      slippage={params.slippage}
      onSlippageChange={onSlippageChange}
      userAddress={asAddress(params.account)}
    />
  )
}
