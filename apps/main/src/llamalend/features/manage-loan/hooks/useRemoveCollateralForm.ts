import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import {
  type RemoveCollateralOptions,
  useRemoveCollateralMutation,
} from '@/llamalend/mutations/remove-collateral.mutation'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useRemoveCollateralBands } from '@/llamalend/queries/remove-collateral/remove-collateral-bands.query'
import { useRemoveCollateralEstimateGas } from '@/llamalend/queries/remove-collateral/remove-collateral-gas-estimate.query'
import { getRemoveCollateralHealthOptions } from '@/llamalend/queries/remove-collateral/remove-collateral-health.query'
import { useMaxRemovableCollateral } from '@/llamalend/queries/remove-collateral/remove-collateral-max-removable.query'
import { useRemoveCollateralPrices } from '@/llamalend/queries/remove-collateral/remove-collateral-prices.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { mapQuery } from '@/llamalend/queries/utils'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  removeCollateralFormValidationSuite,
  type CollateralForm,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { Decimal, decimal } from '@ui-kit/utils/decimal'
import { useFormErrors } from '../../borrow/react-form.utils'
import { useLoanToValueFromUserState } from './useLoanToValueFromUserState'

const useCallbackAfterFormUpdate = (form: UseFormReturn<CollateralForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useRemoveCollateralForm = <
  ChainId extends LlamaChainId,
  NetworkName extends LlamaNetworkId = LlamaNetworkId,
>({
  market,
  network,
  networks,
  enabled,
  onRemoved,
  isAccordionOpen,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<NetworkName, ChainId>
  networks: NetworkDict<ChainId>
  enabled?: boolean
  onRemoved: NonNullable<RemoveCollateralOptions['onRemoved']>
  isAccordionOpen: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken

  const form = useForm<CollateralForm>({
    ...formDefaultOptions,
    resolver: vestResolver(removeCollateralFormValidationSuite),
    defaultValues: {
      userCollateral: undefined,
      maxCollateral: undefined,
    },
  })

  const values = form.watch()
  const { isValid } = form.formState

  const { params, isValid: debouncedIsValid } = useDebouncedValue(
    useMemo(
      () => ({
        params: {
          chainId,
          marketId,
          userAddress,
          userCollateral: values.userCollateral,
        } as CollateralParams<ChainId>,
        isValid,
      }),
      [chainId, marketId, userAddress, values.userCollateral, isValid],
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

  const userState = useUserState(params, enabled)
  const prices = useRemoveCollateralPrices(params, enabled && debouncedIsValid)
  const maxRemovable = useMaxRemovableCollateral(params, enabled)
  const health = useHealthQueries((isFull) =>
    getRemoveCollateralHealthOptions({ ...params, isFull }, enabled && debouncedIsValid),
  )
  const gas = useRemoveCollateralEstimateGas(networks, params, enabled && debouncedIsValid)
  const prevHealth = useHealthQueries((isFull) =>
    getUserHealthOptions({ ...params, isFull }, enabled && debouncedIsValid),
  )
  const bands = useRemoveCollateralBands(params, enabled && isAccordionOpen && debouncedIsValid)
  const prevLoanToValue = useLoanToValueFromUserState({
    chainId,
    marketId: params.marketId,
    userAddress: params.userAddress,
    collateralToken,
    borrowToken,
    enabled: isAccordionOpen && debouncedIsValid,
    expectedBorrowed: userState.data?.debt,
  })
  const loanToValue = useLoanToValueFromUserState({
    chainId: params.chainId!,
    marketId: params.marketId,
    userAddress: params.userAddress,
    collateralToken,
    borrowToken,
    enabled: isAccordionOpen && !!values.userCollateral && debouncedIsValid,
    collateralDelta: values.userCollateral != null ? (`-${values.userCollateral}` as Decimal) : undefined,
    expectedBorrowed: userState.data?.debt,
  })
  const marketRates = useMarketRates(params, isAccordionOpen)

  const expectedCollateral = useMemo(
    () =>
      mapQuery(userState, (state) => {
        // An error will be thrown by the validation suite, this is just for preventing negative collateral in the UI
        const value =
          state?.collateral != null &&
          values.userCollateral != null &&
          decimal(
            BigNumber.max(new BigNumber(state.collateral).minus(new BigNumber(values.userCollateral)), '0').toString(),
          )
        return value ? { value, tokenSymbol: collateralToken?.symbol } : null
      }),
    [collateralToken?.symbol, userState, values.userCollateral],
  )

  const formErrors = useFormErrors(form.formState)

  useEffect(() => {
    form.setValue('maxCollateral', maxRemovable.data, { shouldValidate: true })
  }, [form, maxRemovable.data])

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || action.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    maxRemovable,
    bands,
    health,
    prices,
    gas,
    txHash: action.data?.hash,
    collateralToken,
    borrowToken,
    formErrors,
    userState,
    expectedCollateral,
    prevHealth,
    marketRates,
    prevLoanToValue,
    loanToValue,
  }
}
