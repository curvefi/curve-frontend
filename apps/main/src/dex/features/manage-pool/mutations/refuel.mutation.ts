import { useCallback } from 'react'
import { parseUnits, zeroAddress, type Address } from 'viem'
import { useConfig } from 'wagmi'
import { invalidateTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { approve, fetchHasEnoughAllowance } from '@ui-kit/lib/model/entities/allowance'
import { useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { waitForApproval } from '@ui-kit/utils'
import { writeContract } from '@wagmi/core'
import { refuelPoolAbi } from '../abi'
import type { RefuelFormValues, Tokens } from '../types'
import { refuelFormValidationSuite } from '../validation/refuel.validation'

type RefuelMutationOptions = {
  chainId: number
  poolAddress: Address
  tokens: Tokens | undefined
  userAddress: Address | undefined
  onReset: () => void
}

export const useRefuelMutation = ({ chainId, poolAddress, tokens, userAddress, onReset }: RefuelMutationOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useTransactionMutation<RefuelFormValues>({
    mutationKey: [...rootKeys.chain({ chainId }), 'refuel'] as const,
    mutationFn: async (form: RefuelFormValues) => {
      if (!userAddress) throw new Error('Wallet not connected')
      if (!tokens) throw new Error('Token data not available')
      if (tokens.tokenA.decimals == null || tokens.tokenB.decimals == null) throw new Error('Token decimals not loaded')

      const tokenAAmount = parseUnits(form.tokenAAmount ?? '0', tokens.tokenA.decimals)
      const tokenBAmount = parseUnits(form.tokenBAmount ?? '0', tokens.tokenB.decimals)

      // Make sure all the pool can spend the pool's tokens held by the user before refueling, otherwise request approval
      for (const { amount, token } of [
        { amount: tokenAAmount, token: tokens.tokenA },
        { amount: tokenBAmount, token: tokens.tokenB },
      ]) {
        if (amount <= 0n) continue
        const tokenAddress = token.address
        const spenderAddress = poolAddress

        await waitForApproval({
          isApproved: async () =>
            await fetchHasEnoughAllowance(config, {
              amount,
              chainId,
              userAddress,
              tokenAddress,
              spenderAddress,
            }),
          onApprove: async () => await approve(config, { amount, chainId, tokenAddress, spenderAddress }),
          message: t`Approved ${token.symbol} for refueling`,
          config,
        })
      }

      return {
        hash: await writeContract(config, {
          chainId,
          address: poolAddress,
          abi: refuelPoolAbi,
          functionName: 'add_liquidity',
          args: [
            [tokenAAmount, tokenBAmount],
            0n, // min_mint_amount = 0 (donation, we don't keep LP tokens)
            zeroAddress, // receiver must be zero address for donations
            true, // donation = true
          ],
        }),
      }
    },
    validationSuite: refuelFormValidationSuite,
    validationParams: {},
    pendingMessage: () => t`Refueling pool...`,
    successMessage: () => t`Pool refueled!`,
    onReset: () => {
      void invalidateTokenBalances(config, {
        chainId,
        userAddress: userAddress!,
        tokenAddresses: [tokens!.tokenA.address, tokens!.tokenB.address],
      })
      onReset()
    },
  })

  const onSubmit = useCallback((form: RefuelFormValues) => mutate(form), [mutate])

  return { onSubmit, mutate, error, isPending }
}
