import { useMemo } from 'react'
import { enforce, test } from 'vest'
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'
import { useConfig, useConnection, useEstimateGas as useEstimateTransactionGas, useReadContract } from 'wagmi'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import type { BaseConfig } from '@ui/utils'
import { useForm, useFormSync } from '@ui-kit/features/forms'
import { invalidateTokenBalances, useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { createValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { approve } from '@ui-kit/lib/model/entities/allowance'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { Chain } from '@ui-kit/utils'
import { writeContract } from '@wagmi/core'
import {
  getLayerZeroRoute,
  isLayerZeroChain,
  layerZeroAmountFirstAbi,
  layerZeroReceiverFirstAbi,
  layerZeroStatusAbi,
  type LayerZeroToken,
} from '../layerzero'

export type LayerZeroBridgeFormValues = {
  fromChainId: number
  toChainId: number
  token: LayerZeroToken
  amount: Decimal | undefined
}

const parseAmount = (amount: Decimal | undefined) => {
  try {
    return amount ? parseUnits(amount, 18) : undefined
  } catch {
    return undefined
  }
}

const layerZeroBridgeValidationSuite = createValidationSuite(({ amount }: LayerZeroBridgeFormValues) => {
  test('amount', 'Bridge amount must be greater than zero', () => {
    enforce(amount).isNumeric().gt(0)
  })
})

export const useLayerZeroBridgeForm = ({
  chainId,
  networks,
}: {
  chainId: number
  networks: Record<number, BaseConfig>
}) => {
  const config = useConfig()
  const { address: userAddress } = useConnection()
  const form = useForm<LayerZeroBridgeFormValues>({
    defaultValues: {
      fromChainId: chainId,
      toChainId: chainId === Number(Chain.Ethereum) ? Number(Chain.Bsc) : Number(Chain.Ethereum),
      token: 'crvUSD',
      amount: undefined,
    },
  })
  const values = form.watchValues()
  const { amount, token, toChainId } = values
  const rawAmount = useMemo(() => parseAmount(amount), [amount])
  const route = useMemo(
    () => getLayerZeroRoute({ fromChainId: chainId, toChainId, token }),
    [chainId, toChainId, token],
  )

  useFormSync(form, { fromChainId: chainId })

  const supportedNetworks = useMemo(
    () => Object.values(networks).filter(({ chainId }) => isLayerZeroChain(chainId)),
    [networks],
  )
  const destinationNetworks = useMemo(
    () =>
      supportedNetworks.filter(({ chainId: destinationChainId }) =>
        chainId === Number(Chain.Ethereum)
          ? destinationChainId !== Number(Chain.Ethereum)
          : destinationChainId === Number(Chain.Ethereum),
      ),
    [chainId, supportedNetworks],
  )

  const walletBalance = useTokenBalance({ chainId, userAddress, tokenAddress: route?.tokenAddress })
  const quote = useReadContract({
    chainId,
    address: route?.bridgeAddress,
    abi: layerZeroStatusAbi,
    functionName: 'quote',
    query: { enabled: !!route },
  })
  const isKilled = useReadContract({
    chainId,
    address: route?.bridgeAddress,
    abi: layerZeroStatusAbi,
    functionName: 'is_killed',
    query: { enabled: !!route },
  })
  const allowance = useReadContract({
    chainId,
    address: route?.tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: userAddress && route ? [userAddress, route.bridgeAddress] : undefined,
    query: { enabled: !!userAddress && !!route },
  })

  const isApproved = maybe(rawAmount, amount => maybe(allowance.data, approvedAmount => approvedAmount >= amount))
  const transaction = useMemo(() => {
    if (!route || !rawAmount || !userAddress || isApproved == null) return undefined
    if (!isApproved) {
      return {
        to: route.tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [route.bridgeAddress, rawAmount],
        }),
      }
    }
    return maybe(quote.data, bridgeCost => ({
      to: route.bridgeAddress,
      data: route.amountFirst
        ? encodeFunctionData({
            abi: layerZeroAmountFirstAbi,
            functionName: 'bridge',
            args: [rawAmount, userAddress, userAddress],
          })
        : encodeFunctionData({
            abi: layerZeroReceiverFirstAbi,
            functionName: 'bridge',
            args: [userAddress, rawAmount, userAddress],
          }),
      value: bridgeCost,
    }))
  }, [isApproved, quote.data, rawAmount, route, userAddress])
  const gasUnits = useEstimateTransactionGas({
    chainId,
    account: userAddress,
    ...transaction,
    query: { enabled: !!transaction },
  })
  const gas = useEstimateGas(networks, chainId, maybe(gasUnits.data, Number), !!transaction)
  const amountError =
    rawAmount === 0n
      ? t`Bridge amount must be greater than zero`
      : rawAmount != null && walletBalance.data != null && rawAmount > parseUnits(walletBalance.data, 18)
        ? t`Bridge amount cannot exceed wallet balance`
        : undefined

  const approveMutation = useTransactionMutation<LayerZeroBridgeFormValues>({
    mutationKey: [...rootKeys.chain({ chainId }), 'layerzero-bridge-approve'] as const,
    mutationFn: async () => {
      if (!route || !rawAmount) throw new Error('Invalid LayerZero bridge route or amount')
      const [hash] = await approve(config, {
        amount: rawAmount,
        chainId,
        tokenAddress: route.tokenAddress,
        spenderAddress: route.bridgeAddress,
      })
      return { hash }
    },
    pendingMessage: () => t`Approving ${token}...`,
    successMessage: () => t`Approved ${token}`,
    onSuccess: async () => await allowance.refetch(),
    onReset: () => undefined,
    validationSuite: layerZeroBridgeValidationSuite,
    validationParams: {},
  })

  const bridgeMutation = useTransactionMutation<LayerZeroBridgeFormValues>({
    mutationKey: [...rootKeys.chain({ chainId }), 'layerzero-bridge', { toChainId, token }] as const,
    mutationFn: async () => {
      if (!route || !rawAmount || quote.data == null || !userAddress) {
        throw new Error('LayerZero bridge route is not ready')
      }
      const hash = route.amountFirst
        ? await writeContract(config, {
            chainId,
            address: route.bridgeAddress,
            abi: layerZeroAmountFirstAbi,
            functionName: 'bridge',
            args: [rawAmount, userAddress, userAddress],
            value: quote.data,
          })
        : await writeContract(config, {
            chainId,
            address: route.bridgeAddress,
            abi: layerZeroReceiverFirstAbi,
            functionName: 'bridge',
            args: [userAddress, rawAmount, userAddress],
            value: quote.data,
          })
      return { hash }
    },
    pendingMessage: () => t`Bridging ${token}...`,
    successMessage: () => t`Bridged ${token}`,
    onSuccess: async () => {
      await invalidateTokenBalances(config, {
        chainId,
        userAddress: userAddress!,
        tokenAddresses: [route!.tokenAddress],
      })
      form.reset({ amount: undefined })
    },
    onReset: () => undefined,
    validationSuite: layerZeroBridgeValidationSuite,
    validationParams: {},
  })

  const onSubmit = form.handleSubmit(isApproved ? bridgeMutation.mutate : approveMutation.mutate)

  return {
    form,
    values,
    route,
    supportedNetworks,
    destinationNetworks,
    walletBalance,
    quote,
    isKilled,
    isApproved,
    amountError,
    gas,
    isPending: approveMutation.isPending || bridgeMutation.isPending,
    error: approveMutation.error ?? bridgeMutation.error ?? quote.error ?? isKilled.error ?? allowance.error,
    disabled:
      !!amountError || !rawAmount || !route || quote.data == null || isKilled.data !== false || allowance.data == null,
    onSubmit,
  }
}
