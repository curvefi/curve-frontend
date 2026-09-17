import type { StellarTransaction } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { STELLAR_NETWORKS, type StellarNetwork } from '@/stellar/lib/networks'
import { assert } from '@primitives/objects.utils'
import type { TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

export const getTransactionFee = ({ built }: StellarTransaction, network: StellarNetwork): TxGasInfo => {
  const { decimals, symbol } = STELLAR_NETWORKS[network].nativeCurrency
  const { fee } = assert(built, 'Missing built transaction')
  return {
    estGasCost: fromWei(fee, decimals),
    nativeSymbol: symbol,
    tooltip: t`Estimated total network fee, including resource fees.`,
  }
}
