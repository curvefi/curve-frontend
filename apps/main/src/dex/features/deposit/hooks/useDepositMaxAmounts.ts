import { type Address, ethAddress, isAddressEqual } from 'viem'
import { useDepositEstimateGas } from '@/dex/queries/deposit/deposit-estimate-gas.query'
import type { INetworkConstants } from '@curvefi/api/lib/interfaces'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { mapQuery } from '@ui/features/queries/util'
import { decimalMax, decimalMinus, decimalMultiply, ZERO } from '@ui/lib/decimal'
import type { DepositParams } from '../types'

const GAS_BUFFER = '1.8'

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
  const estGasCost =
    useDepositEstimateGas(
      {
        ...params,
        amounts: params.amounts?.map((amount, index) =>
          // replace the native-token amount with the wallet balance for gas estimation
          index === nativeIndex ? (balances.data?.[tokenAddresses[index]] ?? amount) : amount,
        ),
      },
      nativeIndex >= 0,
    ).data?.estGasCost ?? ZERO

  return mapQuery(balances, balances =>
    tokenAddresses.map((address, index) =>
      index === nativeIndex
        ? // native-token deposits need to reserve part of the balance for gas.
          decimalMax('0', decimalMinus(balances[address], decimalMultiply(estGasCost, GAS_BUFFER)))
        : balances[address],
    ),
  )
}
