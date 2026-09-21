import type { StellarTransaction } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { NetworkQuery } from '@/stellar/queries/root-keys'
import { useTokenUsdRate } from '@/stellar/queries/token/token-usd-rate.query'
import { formatNumber } from '@primitives/number.utils'
import { assert, maybe, notFalsy } from '@primitives/objects.utils'
import type { TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { mapQuery, type Query } from '@ui/features/queries/util'
import { decimalMultiply, fromWei } from '@ui/lib/decimal'
import { formatToken } from '@ui/lib/tokens'

export function useGasEstimation(params: NetworkQuery, simulation: Query<StellarTransaction>) {
  const { nativeCurrency } = STELLAR_NETWORKS[params.network]
  const { decimals, symbol: nativeSymbol, address: token } = nativeCurrency
  const { data: usdPrice } = useTokenUsdRate({ ...params, token })
  return mapQuery(simulation, ({ built }): TxGasInfo => {
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
