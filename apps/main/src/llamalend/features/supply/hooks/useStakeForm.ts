import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens, hasGauge, hasVault } from '@/llamalend/llama.utils'
import type { FormDisabledAlert, LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useStakeMutation } from '@/llamalend/mutations/stake.mutation'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { stakeFormValidationSuite, StakeParams, type StakeForm } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Address } from '@primitives/address.utils'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'
import { useFormErrors, useFormSync } from '@ui-kit/utils/react-form.utils'
import { useVaultUserBalances } from './useVaultUserBalances'

const emptyStakeForm = (): StakeForm => ({ stakeAmount: undefined, maxStakeAmount: undefined })

const getVaultToken = (market: LlamaMarketTemplate | undefined): { address: Address; symbol: string } | undefined =>
  market && hasVault(market)
    ? {
        address: market.addresses.vault as Address,
        symbol: t`Vault shares`,
      }
    : undefined

export const useStakeForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  depositDisabledAlert,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  depositDisabledAlert?: FormDisabledAlert
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id
  const marketHasGauge = !!market && hasGauge(market)

  const vaultToken = getVaultToken(market)
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress }, enabled)
  const maxUserStake = mapQuery(userBalances, d => d.depositedShares)

  const form = useForm<StakeForm>({
    ...formDefaultOptions,
    resolver: vestResolver(stakeFormValidationSuite),
    defaultValues: emptyStakeForm(),
  })

  const values = watchForm(form)

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): StakeParams<ChainId> => ({ chainId, marketId, userAddress, stakeAmount: values.stakeAmount }),
      [chainId, marketId, userAddress, values.stakeAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isStaking,
    error: stakeError,
  } = useStakeMutation({ marketId, network, onReset: form.reset, userAddress })

  useFormSync(form, { maxStakeAmount: maxUserStake.data })

  const disabledAlert = depositDisabledAlert
  const { formState } = form
  const isPending = formState.isSubmitting || isStaking
  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !!disabledAlert || !formState.isValid || !marketHasGauge || isPending || isDebouncing,
    vaultToken,
    borrowToken,
    collateralToken,
    stakeError,
    max: maxUserStake,
    isApproved: useStakeIsApproved(params, enabled),
    hasGauge: marketHasGauge,
    formErrors: useFormErrors(formState),
    disabledAlert,
  }
}
