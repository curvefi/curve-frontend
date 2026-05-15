import { useMemo } from 'react'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import type { Chain } from '@curvefi/prices-api'
import { useForm } from '@ui-kit/features/forms'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useTokenDecimals } from '@ui-kit/hooks/useTokenDecimals'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { useRefuelMutation } from '../mutations/refuel.mutation'
import { useRefuelPool } from '../queries/pools.query'
import type { RefuelFormValues, Tokens } from '../types'
import { refuelFormValidationSuite } from '../validation/refuel.validation'

const userDefaultValues = {
  tokenAAmount: undefined,
  tokenBAmount: undefined,
} as const satisfies RefuelFormValues

export const useRefuelForm = ({
  chainId,
  blockchainId,
  poolAddress,
}: {
  chainId: number
  blockchainId: Chain
  poolAddress: Address
}) => {
  const { address: userAddress } = useConnection()

  const { data: pool, isLoading: isPoolLoading } = useRefuelPool({ blockchainId, poolAddress })
  const coins = useMemo(() => pool?.coins.toSorted((x, y) => x.poolIndex - y.poolIndex), [pool?.coins])

  const tokenADecimals = useTokenDecimals({ chainId, tokenAddress: coins?.[0]?.address })
  const tokenBDecimals = useTokenDecimals({ chainId, tokenAddress: coins?.[1]?.address })

  const tokenABalance = useTokenBalance({ chainId, userAddress, tokenAddress: coins?.[0]?.address })
  const tokenBBalance = useTokenBalance({ chainId, userAddress, tokenAddress: coins?.[1]?.address })

  const tokenAUsdRate = useTokenUsdRate({ chainId, tokenAddress: coins?.[0]?.address })
  const tokenBUsdRate = useTokenUsdRate({ chainId, tokenAddress: coins?.[1]?.address })

  const tokens = useMemo(
    (): Tokens | undefined =>
      coins != null && tokenADecimals.data != null && tokenBDecimals.data != null
        ? {
            tokenA: { address: coins[0].address, symbol: coins[0].symbol, decimals: tokenADecimals.data },
            tokenB: { address: coins[1].address, symbol: coins[1].symbol, decimals: tokenBDecimals.data },
          }
        : undefined,
    [coins, tokenADecimals.data, tokenBDecimals.data],
  )

  const form = useForm<RefuelFormValues>({
    defaultValues: userDefaultValues,
    validation: refuelFormValidationSuite,
  })

  const values = form.watchValues()

  const {
    onSubmit: onSubmitRefuel,
    error: refuelError,
    isPending: isRefueling,
  } = useRefuelMutation({ chainId, poolAddress, tokens, userAddress, onReset: () => form.reset(userDefaultValues) })

  const { formState } = form
  const formErrors = formState.visibleErrors
  const isPending = formState.isSubmitting || isRefueling

  return {
    form,
    values,
    tokenA: {
      address: coins?.[0]?.address,
      symbol: coins?.[0]?.symbol,
      decimals: tokenADecimals.data,
      balance: tokenABalance.data,
      usdRate: tokenAUsdRate.data,
      isLoading: isPoolLoading || tokenADecimals.isLoading || tokenABalance.isLoading || tokenAUsdRate.isLoading,
      amountError: formErrors.find(([field]) => field === 'tokenAAmount')?.[1],
    },
    tokenB: {
      address: coins?.[1]?.address,
      symbol: coins?.[1]?.symbol,
      decimals: tokenBDecimals.data,
      balance: tokenBBalance.data,
      usdRate: tokenBUsdRate.data,
      isLoading: isPoolLoading || tokenBDecimals.isLoading || tokenBBalance.isLoading || tokenBUsdRate.isLoading,
      amountError: formErrors.find(([field]) => field === 'tokenBAmount')?.[1],
    },
    poolTvl: {
      usd: pool?.tvlUsd,
      isLoading: isPoolLoading,
    },
    isPending,
    isDisabled: tokens == null || !formState.isValid || isPending,
    refuelError,
    formErrors,
    onSubmit: form.handleSubmit(onSubmitRefuel),
  }
}
