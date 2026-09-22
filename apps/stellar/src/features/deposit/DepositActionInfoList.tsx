import { asAddress } from '@/stellar/features/connect-wallet/address'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useDepositSimulation } from '@/stellar/queries/deposit/deposit-simulation.query'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { useTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimalEqual, decimalSum } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { DepositFormQuery } from './types'
import { useDepositPriceImpact } from './useDepositPriceImpact'

export const DepositActionInfoList = ({
  onSlippageChange,
  ...params
}: DepositFormQuery & { onSlippageChange: (slippage: Decimal) => void }) => {
  const { account, pool, slippage, tokenCount } = params
  const queryParams = { ...params, amounts: getPoolAmounts(params, tokenCount) }
  const quote = useExpectedLp({ ...queryParams, isDeposit: true })
  const minimum = mapQuery(quote, value => calculateMinimumMint(value, slippage))
  const simulation = useDepositSimulation({ ...queryParams, minMint: minimum.data })
  const config = usePoolConfig(params)
  const supply = usePoolSupply(params)
  const lpDecimals = useTokenDecimals({ ...params, token: pool })
  const lpBalance = useTokenBalance({ ...params, token: pool, decimals: lpDecimals.data })
  const seedLock = combineQueries([config, supply], ({ seedLock }, value) =>
    decimalEqual(value, '0') ? seedLock : null,
  )

  return (
    <PoolActionInfoList
      expectedLp={q(quote)}
      expectedLpLabel={t`Expected LP received`}
      expectedLpTestId="pool-deposit-expected-lp"
      minimumLp={minimum}
      currentLp={q(lpBalance)}
      currentLpTestId="pool-deposit-current-lp"
      projectedLp={combineQueries([lpBalance, quote], decimalSum)}
      projectedLpLabel={t`Projected LP balance`}
      projectedLpTestId="pool-deposit-projected-lp"
      priceImpact={useDepositPriceImpact(queryParams, q(quote))}
      seedLock={seedLock}
      gas={useGasEstimation(params, simulation)}
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      userAddress={asAddress(account)}
    />
  )
}
