import { noop } from 'lodash'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import { useForm } from '@ui-kit/features/forms'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useRefuelMutation } from '../mutations/refuel.mutation'
import { REFUEL_PRESET_PERCENTAGES, type RefuelConfiguration, type RefuelFormValues, type RefuelTokens } from '../types'
import { refuelFormValidationSuite } from '../validation/refuel.validation'

const userDefaultValues = {
  configuration: 'balanced',
  targetRefuelPercentage: REFUEL_PRESET_PERCENTAGES.balanced,
  tokenAAmount: undefined,
  tokenBAmount: undefined,
} as const satisfies RefuelFormValues

export const useRefuelForm = ({
  chainId,
  poolAddress,
  tokens,
}: {
  chainId: number
  poolAddress: Address
  tokens: RefuelTokens
}) => {
  const { address: userAddress } = useConnection()

  const form = useForm<RefuelFormValues>({
    defaultValues: userDefaultValues,
    validation: refuelFormValidationSuite,
  })

  const values = form.watchValues()

  const tokenABalance = useTokenBalance({ chainId, userAddress, tokenAddress: tokens.tokenA.address }, !!userAddress)
  const tokenBBalance = useTokenBalance({ chainId, userAddress, tokenAddress: tokens.tokenB.address }, !!userAddress)

  const setConfiguration = (configuration: RefuelConfiguration) => {
    form.update(
      configuration === 'custom'
        ? { configuration }
        : { configuration, targetRefuelPercentage: REFUEL_PRESET_PERCENTAGES[configuration] },
    )
  }

  const {
    onSubmit: onSubmitRefuel,
    error: refuelError,
    isPending: isRefueling,
  } = useRefuelMutation({ chainId, poolAddress, tokens, userAddress, onReset: noop })

  const { formState } = form
  const formErrors = formState.visibleErrors
  const targetRefuelPercentageError = formErrors.find(([field]) => field === 'targetRefuelPercentage')?.[1]
  const tokenAAmountError = formErrors.find(([field]) => field === 'tokenAAmount')?.[1]
  const tokenBAmountError = formErrors.find(([field]) => field === 'tokenBAmount')?.[1]

  return {
    form,
    values,
    isPending: formState.isSubmitting || isRefueling,
    balances: {
      tokenA: tokenABalance,
      tokenB: tokenBBalance,
    },
    error: tokenABalance.error ?? tokenBBalance.error,
    refuelError,
    formErrors,
    targetRefuelPercentageError,
    tokenAAmountError,
    tokenBAmountError,
    setConfiguration,
    onSubmit: form.handleSubmit(onSubmitRefuel),
  }
}
