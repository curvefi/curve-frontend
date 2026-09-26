import { useMemo } from 'react'
import { ethAddress, isAddressEqual, type Address } from 'viem'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { getPoolAmounts, poolAmountField, type PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { decimal, decimalMax, decimalMinus, decimalMultiply } from '@ui/lib/decimal'
import { useDepositEstimateGas } from '../deposit.query'
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
          getPoolAmounts(params as Partial<PoolTokenFields>, params.decimals?.length)?.[nativeIndex],
      }),
    }),
    [balances.data, nativeIndex, params, tokenAddresses],
  )
  const gas = useDepositEstimateGas(maxParams)

  return nativeIndex < 0
    ? mapQuery(balances, balances => tokenAddresses.map(address => decimal(balances[address])))
    : combineQueries([balances, gas], (balances, { estGasCost }) => {
        const gasCost = decimal(estGasCost)
        return tokenAddresses.map((address, index) =>
          index === nativeIndex && gasCost != null
            ? decimalMax('0', decimalMinus(balances[address], decimalMultiply(gasCost, GAS_BUFFER_MULTIPLIER)))
            : decimal(balances[address]),
        )
      })
}
