import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork, NetworkDict } from '@/llamalend/llamalend.types'
import { type AddCollateralOptions, useAddCollateralMutation } from '@/llamalend/mutations/add-collateral.mutation'
import { useAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { useAddCollateralBands } from '@/llamalend/queries/add-collateral/add-collateral-bands.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { getAddCollateralHealthOptions } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { mapQuery, withTokenSymbol } from '@/llamalend/queries/utils'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  collateralFormValidationSuite,
  type CollateralForm,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils/decimal'
import { useFormErrors } from '../../borrow/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<CollateralForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useAddCollateralForm = <ChainId extends LlamaChainId>({
  market,
  network,
  networks,
  enabled,
  onAdded,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  networks: NetworkDict<ChainId>
  enabled?: boolean
  onAdded?: NonNullable<AddCollateralOptions['onAdded']>
}) => {
  const { address: userAddress } = useAccount()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken
  const { data: maxCollateral } = useTokenBalance({ chainId, userAddress }, collateralToken)

  const form = useForm<CollateralForm>({
    ...formDefaultOptions,
    resolver: vestResolver(collateralFormValidationSuite),
    defaultValues: {
      userCollateral: undefined,
      maxCollateral: undefined,
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
        }) as CollateralParams<ChainId>,
      [chainId, marketId, userAddress, values.userCollateral],
    ),
  )

  const isApproved = useAddCollateralIsApproved(params)

  const { onSubmit, ...action } = useAddCollateralMutation({
    marketId,
    network,
    onAdded,
    onReset: form.reset,
    userAddress,
  })

  useCallbackAfterFormUpdate(form, action.reset)

  useEffect(() => {
    form.setValue('maxCollateral', maxCollateral, { shouldValidate: true })
  }, [form, maxCollateral])

  const userState = useUserState(params, enabled)
  const bands = useAddCollateralBands(params, enabled)
  const health = useHealthQueries((isFull) => getAddCollateralHealthOptions({ ...params, isFull }, enabled))
  const prices = useAddCollateralPrices(params, enabled)
  const gas = useAddCollateralEstimateGas(networks, params, enabled)

  const expectedCollateral = useMemo(
    () =>
      withTokenSymbol(
        {
          ...mapQuery(userState, (state) => state?.collateral),
          data: decimal(
            values.userCollateral
              ? new BigNumber(values.userCollateral)
                  .plus(userState.data?.collateral ? new BigNumber(userState.data?.collateral) : '0')
                  .toString()
              : null,
          ),
        },
        collateralToken?.symbol,
      ),
    [collateralToken?.symbol, userState, values.userCollateral],
  )

  const formErrors = useFormErrors(form.formState)

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || action.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    bands,
    health,
    prices,
    gas,
    isApproved,
    formErrors,
    collateralToken,
    borrowToken,
    txHash: action.data?.hash,
    userState,
    expectedCollateral,
  }
}
