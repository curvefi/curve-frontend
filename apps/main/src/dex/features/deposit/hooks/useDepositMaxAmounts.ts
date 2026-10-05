import { useMemo } from 'react'
import { type Address, ethAddress, isAddressEqual } from 'viem'
import { useDepositEstimateGas } from '@/dex/queries/deposit/deposit-estimate-gas.query'
import type { INetworkConstants } from '@curvefi/api/lib/interfaces'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { combineQueries } from '@ui/features/queries/combine'
import { decimalMax, decimalMinus, decimalMultiply, ZERO } from '@ui/lib/decimal'
import type { DepositParams } from '../types'

const GAS_BUFFER_MULTIPLIER = '1.8'

export const useDepositMaxAmounts = ({
  params,
  tokenAddresses,
  balances,
  nativeToken,
}: {
  params: DepositParams
  tokenAddresses: Address[]
  balances: ReturnType<typeof useTokenBalances>
  nativeToken: INetworkConstants['NATIVE_TOKEN'] | undefined
}) => {
  const nativeTokenAddress = (nativeToken?.address ?? ethAddress) as Address
  const nativeIndex = tokenAddresses.findIndex(address => isAddressEqual(address, nativeTokenAddress))
  const maxParams = useMemo(
    () => ({
      ...params,
      amounts: params.amounts?.map((amount, index) =>
        index === nativeIndex ? (balances.data?.[tokenAddresses[index]] ?? amount) : amount,
      ),
    }),
    [balances.data, nativeIndex, params, tokenAddresses],
  )
  const gas = useDepositEstimateGas(maxParams)

  return combineQueries([balances, gas], (balances, { estGasCost = ZERO }) =>
    tokenAddresses.map((address, index) =>
      index === nativeIndex
        ? // native-token deposits need to reserve part of the balance for gas.
          decimalMax('0', decimalMinus(balances[address], decimalMultiply(estGasCost, GAS_BUFFER_MULTIPLIER)))
        : balances[address],
    ),
  )
}
