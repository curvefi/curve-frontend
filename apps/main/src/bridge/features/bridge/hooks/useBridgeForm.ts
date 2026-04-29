import { noop } from 'lodash'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { BaseConfig } from '@ui/utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import { useFormErrors, useFormSync } from '@ui-kit/utils/react-form.utils'
import { useBridgeApproveMutation } from '../mutations/approve.mutation'
import { useBridgeMutation } from '../mutations/bridge.mutation'
import { useBridgeApproveGasEstimate } from '../queries/bridge-approve-gas-estimate'
import { useBridgeCapacity } from '../queries/bridge-capacity.query'
import { useBridgeCost } from '../queries/bridge-cost.query'
import { useBridgeGasEstimate } from '../queries/bridge-gas-estimate'
import { invalidateBridgeIsApproved, useBridgeIsApproved } from '../queries/bridge-is-approved'
import { bridgeFormValidationSuite } from '../validation/bridge.validation'

export type BridgeForm = {
  fromChainId: number | undefined
  amount: Decimal | undefined

  // Validation fields
  min: number | undefined
  max: number | undefined
  walletBalance: Decimal | undefined
}

/** Debounce for form values such that we're not spamming queries (for validation) */
const useBridgeParams = ({
  chainId,
  userAddress,
  amount,
}: BridgeForm & {
  chainId: number | undefined
  userAddress: Address | undefined
}) => useDebouncedValue(useMemo(() => ({ chainId, userAddress, amount }), [chainId, userAddress, amount]))

const emptyBridgeForm = () =>
  ({
    fromChainId: undefined,
    amount: undefined,

    min: undefined,
    max: undefined,
    walletBalance: undefined,
  }) satisfies BridgeForm

const formProps = {
  ...formDefaultOptions,
  resolver: vestResolver(bridgeFormValidationSuite),
  defaultValues: emptyBridgeForm(),
}

export const useBridgeForm = ({ chainId, networks }: { chainId: number; networks: Record<number, BaseConfig> }) => {
  const form = useForm<BridgeForm>(formProps)

  const values = watchForm(form)

  const { address: userAddress } = useConnection()
  const params = useBridgeParams({ chainId, userAddress, ...values })

  // Fetch wallet balance for UI and form validation
  const { curveApi: curve } = useCurve()
  const bridgeNetworks = useMemo(() => curve?.fastBridge.getSupportedNetworks() ?? [], [curve?.fastBridge])
  const { data: crvUsdBalance, isLoading: crvUsdBalanceLoading } = useTokenBalance({
    ...params,
    tokenAddress: bridgeNetworks.find(network => network.chainId === chainId)?.crvUsdAddress as Address,
  })

  const walletBalance = useMemo(
    () => ({ balance: crvUsdBalance, loading: crvUsdBalanceLoading }),
    [crvUsdBalance, crvUsdBalanceLoading],
  )

  useFormSync(form, { walletBalance: walletBalance.balance })

  // Fetch bridge capacity for form validation
  const { data: capacity, isLoading: capacityLoading } = useBridgeCapacity({ chainId })

  useFormSync(form, { min: capacity?.min, max: capacity?.max })

  // Approve mutation (High chane it'll get merged into the bridge mutation later on as it deviates from the usual approve/execute flow with a single button click)
  const isApproved = useBridgeIsApproved(params)
  const {
    onSubmit: onSubmitApprove,
    isPending: isApproving,
    error: approveError,
  } = useBridgeApproveMutation({
    chainId,
    onApproved: async () => await invalidateBridgeIsApproved(params),
    onReset: noop, // don't reset on approval, keep the values
  })

  // Bridge mutation
  const {
    onSubmit: onSubmitBridge,
    isPending: isBridging,
    error: bridgeError,
  } = useBridgeMutation({ chainId, onReset: form.reset })

  /**
   * Set fromChainId to the chainId passed to this form, which is the chain from the URL.
   * If no valid chain id could be found we pick the first supported one.
   * This might sound a bit weird at first glance, why not set the form value from an event fired by the chain selector?
   * Well, the ChainList feature instantly changes the URL rather than fire a proper callback, and I don't want to refactor it.
   */
  const supportedNetworks = useMemo(
    () =>
      Object.values(networks).filter(({ chainId }) => bridgeNetworks.map(({ chainId }) => chainId).includes(chainId)),
    [networks, bridgeNetworks],
  )

  const network = supportedNetworks.find(network => network.chainId === chainId)
  useFormSync(form, { fromChainId: network?.chainId ?? supportedNetworks[0]?.chainId })

  // Form errors
  const { formState } = form
  const formErrors = useFormErrors(form.formState)
  const amountError = formErrors.find(([field]) => field === 'amount')?.[1]

  return {
    form,
    values,
    loading: crvUsdBalanceLoading || capacityLoading, // Primarily to make sure validation setup is done
    walletBalance,
    supportedNetworks,

    // Bridge mutation
    isPending: formState.isSubmitting || isBridging || isApproving,
    isApproved,

    // Action infos
    bridgeCost: useBridgeCost(params),
    gas: createApprovedEstimateGasHook({
      useIsApproved: useBridgeIsApproved,
      useApproveEstimate: useBridgeApproveGasEstimate,
      useActionEstimate: useBridgeGasEstimate,
    })(networks, params),

    // Errors
    amountError,
    approveError,
    bridgeError,
    formErrors,

    onSubmit: form.handleSubmit(isApproved.data ? onSubmitBridge : onSubmitApprove),
  }
}
