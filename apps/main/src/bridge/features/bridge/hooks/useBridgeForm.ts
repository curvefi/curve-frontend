import { noop } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { Address } from '@primitives/address.utils'
import type { BaseConfig } from '@ui/utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useForm, useFormSync } from '@ui-kit/features/forms'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import { Chain } from '@ui-kit/utils'
import { BRIDGE_CHAINS, getBridgeDestinationChainIds, getBridgeRoute, type BridgeProvider } from '../layerzero'
import { useBridgeApproveMutation } from '../mutations/approve.mutation'
import { useBridgeMutation } from '../mutations/bridge.mutation'
import { useBridgeApproveGasEstimate } from '../queries/bridge-approve-gas-estimate'
import { useBridgeCapacity } from '../queries/bridge-capacity.query'
import { useBridgeCost } from '../queries/bridge-cost.query'
import { useBridgeGasEstimate } from '../queries/bridge-gas-estimate'
import { invalidateBridgeIsApproved, useBridgeIsApproved } from '../queries/bridge-is-approved'
import type { BridgeFormValues } from '../types'
import { bridgeFormValidationSuite } from '../validation/bridge.validation'
import { useLayerZeroBridgeForm } from './useLayerZeroBridgeForm'

export type BridgeForm = BridgeFormValues

const defaultDestination = (chainId: number) => getBridgeDestinationChainIds(chainId)[0] ?? Chain.Ethereum

const useBridgeParams = ({
  chainId,
  userAddress,
  amount,
}: Pick<BridgeFormValues, 'amount'> & {
  chainId: number | undefined
  userAddress: Address | undefined
}) => useDebouncedValue(useMemo(() => ({ chainId, userAddress, amount }), [chainId, userAddress, amount]))

const useFastBridgeGas = createApprovedEstimateGasHook({
  useIsApproved: useBridgeIsApproved,
  useApproveEstimate: useBridgeApproveGasEstimate,
  useActionEstimate: useBridgeGasEstimate,
})

export const useBridgeForm = ({ chainId, networks }: { chainId: number; networks: Record<number, BaseConfig> }) => {
  const form = useForm<BridgeFormValues>({
    validation: bridgeFormValidationSuite,
    defaultValues: {
      fromChainId: chainId,
      toChainId: defaultDestination(chainId),
      token: 'crvUSD',
      amount: undefined,
      min: undefined,
      max: undefined,
      walletBalance: undefined,
    },
  })
  const values = form.watchValues()
  const { amount, token, toChainId } = values
  const { address: userAddress } = useConnection()
  const { curveApi: curve } = useCurve()

  const route = useMemo(() => getBridgeRoute({ fromChainId: chainId, toChainId, token }), [chainId, toChainId, token])
  const provider: BridgeProvider | undefined = route?.provider
  const isFastBridge = provider === 'fastbridge'
  const isLayerZero = provider === 'layerzero'

  useFormSync(form, {
    fromChainId: chainId,
    toChainId: defaultDestination(chainId),
    amount: undefined,
  })

  const bridgeNetworks = useMemo(() => curve?.fastBridge.getSupportedNetworks() ?? [], [curve?.fastBridge])
  const params = useBridgeParams({ chainId, userAddress, amount })
  const fastTokenAddress = bridgeNetworks.find(network => network.chainId === chainId)?.crvUsdAddress as
    Address | undefined
  const fastBalance = useTokenBalance(
    { ...params, tokenAddress: fastTokenAddress },
    isFastBridge && fastTokenAddress != null,
  )
  const capacity = useBridgeCapacity({ chainId }, isFastBridge)
  const fastIsApproved = useBridgeIsApproved(params, isFastBridge)
  const fastBridgeCost = useBridgeCost(params, isFastBridge)
  const fastGas = useFastBridgeGas(networks, params, isFastBridge)

  const fastApprove = useBridgeApproveMutation({
    chainId,
    onApproved: async () => await invalidateBridgeIsApproved(params),
    onReset: noop,
  })
  const fastBridge = useBridgeMutation({ chainId, onReset: () => form.reset({ amount: undefined }) })

  const layerZero = useLayerZeroBridgeForm({ chainId, networks, form, enabled: isLayerZero })
  const walletBalance = isFastBridge ? fastBalance.data : layerZero.walletBalance.data
  useFormSync(form, {
    min: isFastBridge ? capacity.data?.min : undefined,
    max: isFastBridge ? capacity.data?.max : undefined,
    walletBalance,
  })

  const supportedNetworks = useMemo(
    () =>
      Object.values(networks).filter(network =>
        BRIDGE_CHAINS.includes(network.chainId as (typeof BRIDGE_CHAINS)[number]),
      ),
    [networks],
  )
  const destinationChainIds = getBridgeDestinationChainIds(chainId)
  const destinationNetworks = useMemo(
    () => supportedNetworks.filter(network => destinationChainIds.includes(network.chainId)),
    [destinationChainIds, supportedNetworks],
  )

  const fastSubmit = fastIsApproved.data ? fastBridge.onSubmit : fastApprove.onSubmit
  const submit = isFastBridge ? fastSubmit : isLayerZero ? layerZero.submit : undefined
  const formErrors = form.formState.visibleErrors
  const formAmountError = formErrors.find(([field]) => field === 'amount')?.[1]

  return {
    form,
    values,
    route,
    provider,
    supportedNetworks,
    destinationNetworks,
    tokenAddress: isFastBridge ? fastTokenAddress : layerZero.route?.tokenAddress,
    walletBalance: {
      balance: walletBalance,
      loading: isFastBridge ? fastBalance.isLoading : layerZero.walletBalance.isLoading,
    },
    loading: isFastBridge
      ? fastBalance.isLoading || capacity.isLoading
      : isLayerZero
        ? !layerZero.route ||
          layerZero.quote.isLoading ||
          layerZero.isKilled.isLoading ||
          layerZero.walletBalance.isLoading
        : false,
    isPending:
      form.formState.isSubmitting ||
      (isFastBridge ? fastBridge.isPending || fastApprove.isPending : layerZero.isPending),
    isApproved: isFastBridge ? fastIsApproved.data : layerZero.isApproved,
    bridgeCost: isFastBridge ? fastBridgeCost : layerZero.quote,
    gas: isFastBridge ? fastGas : layerZero.gas,
    amountError: isFastBridge ? formAmountError : layerZero.amountError,
    error: isFastBridge ? (fastApprove.error ?? fastBridge.error) : layerZero.error,
    formErrors,
    isKilled: isLayerZero && layerZero.isKilled.data === true,
    disabled: !route || (isLayerZero && layerZero.disabled),
    onSubmit: form.handleSubmit(submit ?? noop),
  }
}
