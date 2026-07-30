import { useMemo } from 'react'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import type { Chain } from '@curvefi/prices-api'
import { maybes } from '@primitives/objects.utils'
import { useForm } from '@ui-kit/features/forms'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useTokenDecimals } from '@ui-kit/hooks/useTokenDecimals'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { mapQuery, q } from '@ui-kit/types/util'
import { useRefuelMutation } from '../mutations/refuel.mutation'
import { useRefuelPool } from '../queries/pools.query'
import type { RefuelFormValues, Tokens } from '../types'
import { refuelFormValidationSuite } from '../validation/refuel.validation'

const userDefaultValues = {
  tokenAAmount: undefined,
  tokenBAmount: undefined,
} as const satisfies RefuelFormValues

const maybeToken = (token: { address: Address; symbol: string } | undefined, decimals: number | undefined) =>
  maybes([token, decimals], ({ address, symbol }, decimals) => ({ address, symbol, decimals }))

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

  const pool = useRefuelPool({ blockchainId, poolAddress })
  const [coinA, coinB] = useMemo(
    () => pool.data?.coins.toSorted((x, y) => x.poolIndex - y.poolIndex) ?? [],
    [pool.data?.coins],
  )

  const tokenADecimals = useTokenDecimals({ chainId, tokenAddress: coinA?.address })
  const tokenBDecimals = useTokenDecimals({ chainId, tokenAddress: coinB?.address })

  const tokenABalance = useTokenBalance({ chainId, userAddress, tokenAddress: coinA?.address })
  const tokenBBalance = useTokenBalance({ chainId, userAddress, tokenAddress: coinB?.address })

  const tokenAUsdRate = useTokenUsdRate({ chainId, tokenAddress: coinA?.address })
  const tokenBUsdRate = useTokenUsdRate({ chainId, tokenAddress: coinB?.address })

  const tokens = useMemo(
    (): Tokens | undefined =>
      maybes([maybeToken(coinA, tokenADecimals.data), maybeToken(coinB, tokenBDecimals.data)], (tokenA, tokenB) => ({
        tokenA,
        tokenB,
      })),
    [coinA, coinB, tokenADecimals.data, tokenBDecimals.data],
  )

  const form = useForm<RefuelFormValues>({ defaultValues: userDefaultValues, validation: refuelFormValidationSuite })

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
    values: form.watchValues(),
    tokenA: {
      address: coinA?.address,
      symbol: coinA?.symbol,
      decimals: q(tokenADecimals),
      balance: q(tokenABalance),
      usdRate: q(tokenAUsdRate),
      amountError: formErrors.find(([field]) => field === 'tokenAAmount')?.[1],
    },
    tokenB: {
      address: coinB?.address,
      symbol: coinB?.symbol,
      decimals: q(tokenBDecimals),
      balance: q(tokenBBalance),
      usdRate: q(tokenBUsdRate),
      amountError: formErrors.find(([field]) => field === 'tokenBAmount')?.[1],
    },
    poolTvl: mapQuery(pool, p => p.tvlUsd),
    isPending,
    isDisabled: tokens == null || !formState.isValid || isPending,
    refuelError,
    formErrors,
    onSubmit: form.handleSubmit(onSubmitRefuel),
  }
}
