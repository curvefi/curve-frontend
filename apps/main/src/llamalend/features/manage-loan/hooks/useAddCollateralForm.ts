import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork, NetworkDict } from '@/llamalend/llamalend.types'
import { type AddCollateralOptions, useAddCollateralMutation } from '@/llamalend/mutations/add-collateral.mutation'
import { useAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { useAddCollateralBands } from '@/llamalend/queries/add-collateral/add-collateral-bands.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { getAddCollateralHealthOptions } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { mapQuery, withTokenSymbol } from '@/llamalend/queries/utils'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  addCollateralFormValidationSuite,
  type CollateralForm,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils/decimal'
import { useFormErrors } from '../../borrow/react-form.utils'
import { useLoanToValueFromUserState } from './useLoanToValueFromUserState'

const useCallbackAfterFormUpdate = (form: UseFormReturn<CollateralForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useAddCollateralForm = <ChainId extends LlamaChainId>({
  market,
  network,
  networks,
  enabled,
  onAdded,
  isAccordionOpen,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  networks: NetworkDict<ChainId>
  enabled?: boolean
  onAdded: NonNullable<AddCollateralOptions['onAdded']>
  isAccordionOpen: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken
  const { data: maxCollateral } = useTokenBalance({ chainId, userAddress }, collateralToken)

  const form = useForm<CollateralForm>({
    ...formDefaultOptions,
    resolver: vestResolver(addCollateralFormValidationSuite),
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

  const userState = useUserState(params, enabled)
  const prices = useAddCollateralPrices(params, enabled)
  const health = useHealthQueries((isFull) => getAddCollateralHealthOptions({ ...params, isFull }, enabled))
  const gas = useAddCollateralEstimateGas(networks, params, enabled)
  const prevHealth = useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }, enabled))
  const bands = useAddCollateralBands(params, enabled && isAccordionOpen)
  const prevLoanToValue = useLoanToValueFromUserState({
    chainId,
    marketId: params.marketId,
    userAddress: params.userAddress,
    collateralToken,
    borrowToken,
    enabled: isAccordionOpen,
    expectedBorrowed: userState.data?.debt,
  })
  const loanToValue = useLoanToValueFromUserState({
    chainId: params.chainId!,
    marketId: params.marketId,
    userAddress: params.userAddress,
    collateralToken,
    borrowToken,
    enabled: isAccordionOpen && !!values.userCollateral,
    collateralDelta: values.userCollateral,
    expectedBorrowed: userState.data?.debt,
  })
  const marketRates = useMarketRates(params, isAccordionOpen)

  const expectedCollateral = useMemo(
    () =>
      withTokenSymbol(
        {
          ...mapQuery(userState, (state) => state?.collateral),
          data: decimal(
            values.userCollateral != null && userState.data?.collateral != null
              ? new BigNumber(values.userCollateral).plus(new BigNumber(userState.data?.collateral)).toString()
              : null,
          ),
        },
        collateralToken?.symbol,
      ),
    [collateralToken?.symbol, userState, values.userCollateral],
  )

  const formErrors = useFormErrors(form.formState)

  useEffect(() => {
    form.setValue('maxCollateral', maxCollateral, { shouldValidate: true })
  }, [form, maxCollateral])

  return {
    form,
    values,
    isPending: form.formState.isSubmitting || action.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    bands,
    prevHealth,
    health,
    prevLoanToValue,
    loanToValue,
    marketRates,
    prices,
    gas,
    isApproved,
    formErrors,
    collateralToken,
    expectedCollateral,
    borrowToken,
    txHash: action.data?.hash,
    userState,
  }
}
