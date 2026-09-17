import { useMemo } from 'react'
import { calculateExpectedBurn, calculateMaximumBurn } from '@/stellar/lib/amounts'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import type { NetworkQuery } from '@/stellar/queries/root-keys'
import type { WithdrawSimulationParams } from '@/stellar/queries/validation/withdraw.validation'
import { useWithdrawSimulation } from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts, type PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useWithdrawPriceImpact } from './useWithdrawPriceImpact'

export type WithdrawPreviewParams = Omit<WithdrawSimulationParams, 'amounts' | 'quote' | 'maximumBurn'> &
  NetworkQuery &
  PoolTokenFields & { tokenCount: number | undefined; slippage: Decimal }

export function useWithdrawPreview(params: WithdrawPreviewParams) {
  const queryParams = useMemo(() => ({ ...params, amounts: getPoolAmounts(params, params.tokenCount) }), [params])
  const quote = q(useExpectedLp({ ...queryParams, isDeposit: false }))
  const expected = mapQuery(quote, calculateExpectedBurn)
  const maximum = mapQuery(expected, amount => calculateMaximumBurn(amount, params.slippage))
  const priceImpact = useWithdrawPriceImpact(queryParams, expected)
  const simulation = useWithdrawSimulation({ ...queryParams, quote: quote.data, maximumBurn: maximum.data })
  return { quote, expected, maximum, priceImpact, gas: useGasEstimation(params, simulation) }
}

export type WithdrawPreview = ReturnType<typeof useWithdrawPreview>
