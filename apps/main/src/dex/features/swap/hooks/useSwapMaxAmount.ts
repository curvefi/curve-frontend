import { ethAddress, isAddressEqual } from 'viem'
import { useSwapEstimateGas } from '@/dex/queries/swap/swap-estimate-gas.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/units.util'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalMax, decimalMinus, decimalMultiply, decimalRound } from '@ui/lib/decimal'
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
  // Estimate at the wallet balance so clicking Max does not depend on an entered amount.
  const gas = useSwapEstimateGas({ ...params, inputAmount: balance.data }, isNative)
  return isNative
    ? combineQueries([balance, mapQuery(gas, gas => gas.estGasCost)], (balance, gasCost) =>
        decimalRound(decimalMax('0', decimalMinus(balance, decimalMultiply(gasCost, '1.8')))!, DEFAULT_DECIMALS),
      )
    : balance
}
