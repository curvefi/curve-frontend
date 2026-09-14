import { useMemo } from 'react'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { useExpectedLp } from '@/stellar/queries/deposit/deposit-expected-lp.query'
import { useDepositSimulation } from '@/stellar/queries/deposit/deposit-simulation.query'
import type { UserParams } from '@/stellar/queries/root-keys'
import { type DepositParams, type QuoteParams } from '@/stellar/queries/validation/deposit.validation'
import type { Decimal } from '@primitives/decimal.utils'
import type { TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { getDepositAmounts, type DepositFormValues } from '@ui/features/forms/deposit/deposit-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { fromWei } from '@ui/lib/decimal'
import { useDepositPriceImpact } from './useDepositPriceImpact'

export type DepositPreviewParams = Omit<QuoteParams, 'amounts'> &
  UserParams &
  Pick<DepositParams, 'maxAmounts'> &
  DepositFormValues & { slippage: Decimal; tokenCount: number | undefined }

export function useDepositPreview(params: DepositPreviewParams) {
  const queryParams = useMemo(() => ({ ...params, amounts: getDepositAmounts(params, params.tokenCount) }), [params])
  const quote = q(useExpectedLp(queryParams))
  const priceImpact = useDepositPriceImpact(queryParams, quote)
  const minimum = mapQuery(quote, value => calculateMinimumMint(value, params.slippage))
  const simulation = useDepositSimulation({ ...queryParams, minMint: minimum.data })
  const fee = mapQuery(simulation, ({ built }): TxGasInfo => {
    const { decimals, symbol } = STELLAR_NETWORKS[params.network!].nativeCurrency
    return { estGasCost: fromWei(built!.fee, decimals), nativeSymbol: symbol }
  })
  return { quote, minimum, priceImpact, fee }
}

export type DepositPreview = ReturnType<typeof useDepositPreview>
