import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { type AddCollateralOptions, useAddCollateralMutation } from '@/llamalend/mutations/add-collateral.mutation'
import { useAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { useAddCollateralBands } from '@/llamalend/queries/add-collateral/add-collateral-bands.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { useAddCollateralHealth } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
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

export const useAddCollateralForm = ({
  market,
  network,
  networks,
  enabled = true,
  onAdded,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  networks: NetworkDict<LlamaChainId>
  enabled?: boolean
  onAdded?: NonNullable<AddCollateralOptions['onAdded']>
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

  const isApproved = useAddCollateralIsApproved(params)

  const { onSubmit, ...action } = useAddCollateralMutation({ marketId, network, onAdded })

  useCallbackAfterFormUpdate(form, action.reset)

  const bands = useAddCollateralBands(params, enabled)
  const healthFull = useAddCollateralHealth({ ...params, isFull: true }, enabled)
  const healthNotFull = useAddCollateralHealth({ ...params, isFull: false }, enabled)
  const prices = useAddCollateralPrices(params, enabled)
  const gas = useAddCollateralEstimateGas(networks, params, enabled)

  const formErrors = useFormErrors(form.formState)

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || action.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    bands,
    healthFull,
    healthNotFull,
    prices,
    gas,
    isApproved,
    formErrors,
  }
}
