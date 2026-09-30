import { useMemo } from 'react'
import { ethAddress, isAddressEqual, type Address } from 'viem'
import { useDepositEstimateGas } from '@/dex/queries/deposit/deposit-estimate-gas.query'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { getPoolAmounts, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { decimalMax, decimalMinus, decimalMultiply } from '@ui/lib/decimal'
import type { DepositParams } from '../types'

const GAS_BUFFER_MULTIPLIER = '1.8'

export const useDepositMaxAmounts = ({
  params,
  tokenAddresses,
  balances,
}: {
  params: DepositParams
  tokenAddresses: Address[]
  balances: ReturnType<typeof useTokenBalances>
}) => {
  const nativeIndex = tokenAddresses.findIndex(address => isAddressEqual(address, ethAddress))
  const maxParams = useMemo(
    () => ({
      ...params,
      ...(nativeIndex >= 0 && {
        [poolAmountField(nativeIndex)]:
          balances.data?.[tokenAddresses[nativeIndex]] ??
          getPoolAmounts(params, params.decimals?.length)?.[nativeIndex],
      }),
    }),
    [balances.data, nativeIndex, params, tokenAddresses],
  )
  const gas = useDepositEstimateGas(maxParams)

  // Only native-token deposits need to reserve part of the balance for gas.
  return nativeIndex < 0
    ? mapQuery(balances, balances => tokenAddresses.map(address => balances[address]))
    : combineQueries([balances, gas], (balances, { estGasCost }) =>
        tokenAddresses.map((address, index) =>
          index === nativeIndex && estGasCost != null
            ? decimalMax('0', decimalMinus(balances[address], decimalMultiply(estGasCost, GAS_BUFFER_MULTIPLIER)))
            : balances[address],
        ),
      )
}
