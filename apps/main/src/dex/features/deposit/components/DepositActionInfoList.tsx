import { getSlippageType } from '@/dex/components/PagePool/utils'
import { usePoolContext } from '@/dex/features/pool-context'
import { useDepositPriceImpact } from '@/dex/queries/deposit/deposit-bonus.query'
import { useDepositEstimateGas } from '@/dex/queries/deposit/deposit-estimate-gas.query'
import { useDepositExpectedLp } from '@/dex/queries/deposit/deposit-expected.query'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import type { DepositFormValues, UserDepositParams } from '../types'

type DepositActionInfoListProps = { form: UseFormReturn<DepositFormValues>; params: UserDepositParams }

export const DepositActionInfoList = ({ form, params }: DepositActionInfoListProps) => {
  const slippage = form.values.slippage
  const expectedLp = q(useDepositExpectedLp(params))
  const isSeed = mapQuery(usePoolCurrencyReserves(params), reserves => !Number(reserves.total))
  const priceImpact = useDepositPriceImpact(params, isSeed.data === false)
  return (
    <PoolActionInfoList
      expectedLp={expectedLp}
      expectedLpLabel="Expected LP received"
      expectedLpTestId="pool-deposit-expected-lp"
      minimumLp={mapQuery(expectedLp, value => calculateMinimumReceived(value, slippage, LP_TOKEN_DECIMALS))}
      priceImpact={priceImpact}
      gas={useDepositEstimateGas(params)}
      slippage={slippage}
      onSlippageChange={(slippage: Decimal) => form.update({ slippage })}
      userAddress={params.userAddress}
      slippageType={getSlippageType(usePoolContext().pool.data)}
    />
  )
}
