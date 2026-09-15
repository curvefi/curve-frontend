import { useMemo } from 'react'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { useDepositSimulation } from '@/stellar/queries/deposit/deposit-simulation.query'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import type { NetworkQuery, UserParams } from '@/stellar/queries/root-keys'
import { useTokenUsdRate } from '@/stellar/queries/token/token-usd-rate.query'
import { type DepositParams, type QuoteParams } from '@/stellar/queries/validation/deposit.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { assert, maybe, notFalsy } from '@primitives/objects.utils'
import type { TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { getPoolAmounts, type PoolTokensForm } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimalMultiply, fromWei } from '@ui/lib/decimal'
import { formatToken } from '@ui/lib/tokens'
import { useDepositPriceImpact } from './useDepositPriceImpact'

export type DepositPreviewParams = Omit<QuoteParams, 'amounts' | 'network'> &
  NetworkQuery &
  UserParams &
  Pick<DepositParams, 'maxAmounts'> &
  PoolTokensForm & { slippage: Decimal; tokenCount: number | undefined }

function useGasEstimation(params: DepositPreviewParams, minimum: QueryProp<Decimal>): QueryProp<TxGasInfo> {
  const simulation = useDepositSimulation({ ...params, minMint: minimum.data })
  const { nativeCurrency } = STELLAR_NETWORKS[params.network]
  const { decimals, symbol: nativeSymbol, address: token } = nativeCurrency
  const { data: usdPrice } = useTokenUsdRate({ ...params, token })
  return mapQuery(simulation, ({ built }) => {
    const { fee } = assert(built, 'Missing built transaction')
    const estGasCost = fromWei(fee, decimals)
    return {
      estGasCost,
      nativeSymbol,
      estGasCostUsd: maybe(usdPrice, usdPrice => decimalMultiply(estGasCost, usdPrice)),
      tooltip: notFalsy(
        `${formatToken(estGasCost, nativeSymbol, 'amount')}`,
        usdPrice && ` for ${formatNumber(usdPrice, 'usd.notional')}/${nativeSymbol}`,
      ).join(' '),
    }
  })
}

export function useDepositPreview(params: DepositPreviewParams) {
  const queryParams = useMemo(() => ({ ...params, amounts: getPoolAmounts(params, params.tokenCount) }), [params])
  const quote = q(useExpectedLp({ ...queryParams, isDeposit: true }))
  const priceImpact = useDepositPriceImpact(queryParams, quote)
  const minimum = mapQuery(quote, value => calculateMinimumMint(value, params.slippage))
  return { quote, minimum, priceImpact, gas: useGasEstimation(queryParams, minimum) }
}

export type DepositPreview = ReturnType<typeof useDepositPreview>
