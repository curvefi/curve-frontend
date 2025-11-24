import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import {
  type RemoveCollateralOptions,
  useRemoveCollateralMutation,
} from '@/llamalend/mutations/remove-collateral.mutation'
import { useRemoveCollateralBands } from '@/llamalend/queries/remove-collateral/remove-collateral-bands.query'
import { useRemoveCollateralEstimateGas } from '@/llamalend/queries/remove-collateral/remove-collateral-gas-estimate.query'
import { useRemoveCollateralHealth } from '@/llamalend/queries/remove-collateral/remove-collateral-health.query'
import { useMaxRemovableCollateral } from '@/llamalend/queries/remove-collateral/remove-collateral-max-removable.query'
import { useRemoveCollateralPrices } from '@/llamalend/queries/remove-collateral/remove-collateral-prices.query'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  collateralFormValidationSuite,
  type CollateralForm,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { useFormErrors } from '../../borrow/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<CollateralForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useRemoveCollateralForm = ({
  market,
  network,
  networks,
  enabled,
  onRemoved,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  networks: NetworkDict<LlamaChainId>
  enabled?: boolean
  onRemoved: NonNullable<RemoveCollateralOptions['onRemoved']>
}) => {
  const { address: userAddress } = useAccount()
  const { chainId } = network
  const marketId = market?.id

  const form = useForm<CollateralForm>({
    ...formDefaultOptions,
    resolver: vestResolver(collateralFormValidationSuite),
    defaultValues: {
      userCollateral: undefined,
    },
  })

  const values = form.watch()

  const params = useDebouncedValue(
    useMemo(
      () =>
        ({
          chainId,
          marketId,
          userAddress,
          userCollateral: values.userCollateral,
        }) as CollateralParams<LlamaChainId>,
      [chainId, marketId, userAddress, values.userCollateral],
    ),
  )

  const { onSubmit, ...action } = useRemoveCollateralMutation({
    marketId,
    network,
    onRemoved,
    onReset: form.reset,
    userAddress,
  })

  useCallbackAfterFormUpdate(form, action.reset)

  const maxRemovable = useMaxRemovableCollateral(params, enabled)
  const bands = useRemoveCollateralBands(params, enabled)
  const healthFull = useRemoveCollateralHealth({ ...params, isFull: true }, enabled)
  const healthNotFull = useRemoveCollateralHealth({ ...params, isFull: false }, enabled)
  const prices = useRemoveCollateralPrices(params, enabled)
  const gas = useRemoveCollateralEstimateGas(networks, params, enabled)

  const formErrors = useFormErrors(form.formState)

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || action.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    maxRemovable,
    bands,
    healthFull,
    healthNotFull,
    prices,
    gas,
    formErrors,
  }
}
