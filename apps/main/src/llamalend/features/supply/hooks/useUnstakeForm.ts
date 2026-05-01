import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { getTokens, hasVault } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useUnstakeMutation } from '@/llamalend/mutations/unstake.mutation'
import {
  type UnstakeForm,
  unstakeFormValidationSuite,
  UnstakeParams,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { useForm } from '@ui-kit/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { mapQuery } from '@ui-kit/types/util'
import { useFormErrors, useFormSync } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from './useVaultUserBalances'

const emptyUnstakeForm = (): UnstakeForm => ({ unstakeAmount: undefined, maxUnstakeAmount: undefined })

const getVaultToken = (market: LlamaMarketTemplate | undefined): { address: Address; symbol: string } | undefined =>
  market && hasVault(market)
    ? {
        address: market.addresses.vault as Address,
        symbol: t`Vault shares`,
      }
    : undefined

export const useUnstakeForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const vaultToken = getVaultToken(market)
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, enabled)
  const maxUserUnstake = mapQuery(userBalances, d => d.stakedShares)

  const form = useForm<UnstakeForm>({
    validation: unstakeFormValidationSuite,
    defaultValues: emptyUnstakeForm(),
  })

  const values = form.values

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): UnstakeParams<ChainId> => ({ chainId, marketId, userAddress, unstakeAmount: values.unstakeAmount }),
      [chainId, marketId, userAddress, values.unstakeAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isUnstaking,
    error: unstakeError,
  } = useUnstakeMutation({
    marketId,
    network,
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form

  useFormSync(form, { maxUnstakeAmount: maxUserUnstake.data })

  const isPending = formState.isSubmitting || isUnstaking
  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending || isDebouncing,
    vaultToken,
    borrowToken,
    collateralToken,
    unstakeError,
    max: maxUserUnstake,
    formErrors: useFormErrors(formState),
  }
}
