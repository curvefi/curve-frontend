import { useMemo } from 'react'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useDepositSimulation } from '@/stellar/queries/deposit/deposit-simulation.query'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import type { NetworkQuery, UserParams } from '@/stellar/queries/root-keys'
import { type DepositParams, type QuoteParams } from '@/stellar/queries/validation/deposit.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts, type PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useDepositPriceImpact } from './useDepositPriceImpact'

export type DepositPreviewParams = Omit<QuoteParams, 'amounts' | 'network'> &
  NetworkQuery &
  UserParams &
  Pick<DepositParams, 'maxAmounts'> &
  PoolTokenFields & { slippage: Decimal; tokenCount: number | undefined }

export function useDepositPreview(params: DepositPreviewParams) {
  const queryParams = useMemo(() => ({ ...params, amounts: getPoolAmounts(params, params.tokenCount) }), [params])
  const quote = q(useExpectedLp({ ...queryParams, isDeposit: true }))
  const priceImpact = useDepositPriceImpact(queryParams, quote)
  const minimum = mapQuery(quote, value => calculateMinimumMint(value, params.slippage))
  const simulation = useDepositSimulation({ ...queryParams, minMint: minimum.data })
  return { quote, minimum, priceImpact, gas: useGasEstimation(params, simulation) }
}

export type DepositPreview = ReturnType<typeof useDepositPreview>
