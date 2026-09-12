import { minimumMint } from '@/lib/amounts'
import { STELLAR_NETWORKS } from '@/lib/networks'
import { useExpectedLp } from '@/queries/deposit/deposit-expected-lp.query'
import { useDepositSimulation } from '@/queries/deposit/deposit-simulation.query'
import type { UserParams } from '@/queries/root-keys'
import { type DepositParams, type QuoteParams } from '@/queries/validation/deposit.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { fromWei } from '@ui/lib/decimal'
import { useDepositPriceImpact } from './useDepositPriceImpact'

export type DepositPreviewParams = QuoteParams & UserParams & Pick<DepositParams, 'maxAmounts'> & { slippage: Decimal }

export function useDepositPreview(params: DepositPreviewParams) {
  const quote = q(useExpectedLp(params))
  const priceImpact = useDepositPriceImpact(params, quote)
  const minimum = mapQuery(quote, value => minimumMint(value, params.slippage))
  const simulation = useDepositSimulation({ ...params, minMint: minimum.data })
  const fee = mapQuery(simulation, transaction => {
    const { decimals, symbol } = STELLAR_NETWORKS[params.network!].nativeCurrency
    return { nativeCost: { amount: fromWei(transaction.built!.fee, decimals), symbol } }
  })
  return { quote, minimum, priceImpact, fee }
}

export type DepositPreview = ReturnType<typeof useDepositPreview>
