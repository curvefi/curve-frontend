import { useMemo } from 'react'
import { enforce, test } from 'vest'
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'
import { useBlock, useConfig, useConnection, useEstimateGas as useEstimateTransactionGas, useReadContract } from 'wagmi'
import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import type { BaseConfig } from '@ui/utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { invalidateTokenBalances, useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { createValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { approve } from '@ui-kit/lib/model/entities/allowance'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { type TransactionContext, useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { writeContract } from '@wagmi/core'
import {
  getLayerZeroRoute,
  layerZeroAmountFirstAbi,
  layerZeroCrvCapacityAbi,
  layerZeroReceiverFirstAbi,
  layerZeroStableCapacityAbi,
  layerZeroStatusAbi,
} from '../layerzero'
import { getLayerZeroCapacityResult } from '../layerzero-capacity'
import type { BridgeFormValues } from '../types'

const parseAmount = (amount: Decimal | undefined) => {
  try {
    return amount ? parseUnits(amount, 18) : undefined
  } catch {
    return undefined
  }
}

const layerZeroBridgeValidationSuite = createValidationSuite(({ amount }: BridgeFormValues) => {
  test('amount', 'Bridge amount must be greater than zero', () => {
    enforce(amount).isNumeric().gt(0)
  })
})

type LayerZeroBridgeResult = { hash: Hex; tokenAddress: Address; userAddress: Address }

export const useLayerZeroBridgeForm = ({
  chainId,
  networks,
  form,
  enabled,
}: {
  chainId: number
  networks: Record<number, BaseConfig>
  form: UseFormReturn<BridgeFormValues>
  enabled: boolean
}) => {
  const config = useConfig()
  const { address: userAddress } = useConnection()
  const values = form.watchValues()
  const { amount, token, toChainId } = values
  const rawAmount = useMemo(() => parseAmount(amount), [amount])
  const route = useMemo(
    () => (enabled ? getLayerZeroRoute({ fromChainId: chainId, toChainId, token }) : undefined),
    [chainId, enabled, toChainId, token],
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
  const destinationBlock = useBlock({
    chainId: toChainId,
    query: { enabled: route?.family === 'stable' },
  })
  const crvAvailable = useReadContract({
    chainId: toChainId,
    address: route?.bridgeAddress,
    abi: layerZeroCrvCapacityAbi,
    functionName: 'available',
    query: { enabled: route?.family === 'crv' },
  })
  const capacityLimit = useReadContract({
    chainId: toChainId,
    address: route?.bridgeAddress,
    abi: route?.family === 'stable' ? layerZeroStableCapacityAbi : layerZeroCrvCapacityAbi,
    functionName: 'limit',
    query: { enabled: !!route },
  })
  const crvPeriod = useReadContract({
    chainId: toChainId,
    address: route?.bridgeAddress,
    abi: layerZeroCrvCapacityAbi,
    functionName: 'period',
    query: { enabled: route?.family === 'crv' },
  })
  const stableIssued = useReadContract({
    chainId: toChainId,
    address: route?.bridgeAddress,
    abi: layerZeroStableCapacityAbi,
    functionName: 'issued',
    args: destinationBlock.data ? [destinationBlock.data.timestamp / 86_400n] : undefined,
    query: { enabled: route?.family === 'stable' && !!destinationBlock.data },
  })
  const stableDelay = useReadContract({
    chainId: toChainId,
    address: route?.bridgeAddress,
    abi: layerZeroStableCapacityAbi,
    functionName: 'delay',
    query: { enabled: route?.family === 'stable' },
  })
  const capacityAvailable = useMemo(() => {
    if (route?.family === 'crv') return crvAvailable.data
    if (route?.family === 'stable' && capacityLimit.data != null && stableIssued.data != null) {
      return capacityLimit.data > stableIssued.data ? capacityLimit.data - stableIssued.data : 0n
    }
    return undefined
  }, [capacityLimit.data, crvAvailable.data, route?.family, stableIssued.data])
  const capacity = useMemo(() => {
    if (!route || !rawAmount) return undefined
    if (route.family === 'crv' && crvAvailable.data != null && capacityLimit.data != null && crvPeriod.data != null) {
      return getLayerZeroCapacityResult('crv', rawAmount, {
        family: 'crv',
        available: crvAvailable.data,
        limit: capacityLimit.data,
        period: crvPeriod.data,
      })
    }
    if (
      route.family === 'stable' &&
      capacityLimit.data != null &&
      stableIssued.data != null &&
      stableDelay.data != null
    ) {
      return getLayerZeroCapacityResult('stable', rawAmount, {
        family: 'stable',
        limit: capacityLimit.data,
        issued: stableIssued.data,
        delay: stableDelay.data,
      })
    }
    return undefined
  }, [capacityLimit.data, crvAvailable.data, crvPeriod.data, rawAmount, route, stableDelay.data, stableIssued.data])
  const capacityError: Error | null =
    destinationBlock.error ??
    crvAvailable.error ??
    capacityLimit.error ??
    crvPeriod.error ??
    stableIssued.error ??
    stableDelay.error
  const capacityLoading =
    !!route &&
    (destinationBlock.isLoading ||
      capacityLimit.isLoading ||
      (route.family === 'crv'
        ? crvAvailable.isLoading || crvPeriod.isLoading
        : stableIssued.isLoading || stableDelay.isLoading))

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

  const approveMutation = useTransactionMutation<BridgeFormValues>({
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

  const bridgeMutation = useTransactionMutation<BridgeFormValues, TransactionContext, LayerZeroBridgeResult>({
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
      return { hash, tokenAddress: route.tokenAddress, userAddress }
    },
    pendingMessage: () => t`Bridging ${token}...`,
    successMessage: () => t`Bridged ${token}`,
    onSuccess: async ({ tokenAddress, userAddress }) => {
      await invalidateTokenBalances(config, {
        chainId,
        userAddress,
        tokenAddresses: [tokenAddress],
      })
      form.reset({ amount: undefined })
    },
    onReset: () => undefined,
    validationSuite: layerZeroBridgeValidationSuite,
    validationParams: {},
  })

  return {
    route,
    walletBalance,
    quote,
    isKilled,
    isApproved,
    amountError,
    capacity,
    capacityAvailable,
    capacityError,
    capacityLoading,
    gas,
    isPending: approveMutation.isPending || bridgeMutation.isPending,
    error: approveMutation.error ?? bridgeMutation.error ?? quote.error ?? isKilled.error ?? allowance.error,
    disabled:
      !!amountError || !rawAmount || !route || quote.data == null || isKilled.data !== false || allowance.data == null,
    submit: isApproved ? bridgeMutation.mutate : approveMutation.mutate,
  }
}
