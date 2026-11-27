import { ethAddress, isAddressEqual } from 'viem'
import { GAS_BUFFER } from '@/dex/constants'
import { useSwapEstimateGas } from '@/dex/queries/swap/swap-estimate-gas.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/units.util'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalMax, decimalMinus, decimalMultiply, decimalRound, ZERO } from '@ui/lib/decimal'
import type { UserSwapParams } from '../types'

export const useSwapMaxAmount = ({
  params,
  tokenAddress,
  balance,
}: {
  params: UserSwapParams
  tokenAddress: Address | undefined
  balance: QueryProp<Decimal>
}) => {
  const isNative = !!tokenAddress && isAddressEqual(tokenAddress, ethAddress)
  // Estimate at the wallet balance, so clicking Max does not depend on an entered amount.
  // If estimation or USD pricing is unavailable, keep balance usable
  const estGasCost = useSwapEstimateGas({ ...params, inputAmount: balance.data }, isNative).data?.estGasCost ?? ZERO
  return isNative
    ? mapQuery(balance, balance =>
        decimalRound(
          decimalMax('0', decimalMinus(balance, decimalMultiply(estGasCost, GAS_BUFFER)))!,
          DEFAULT_DECIMALS,
        ),
      )
    : balance
}
