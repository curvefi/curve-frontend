import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form/dist/types'
import { useAccount } from 'wagmi'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { recordEntries } from '@curvefi/prices-api/objects.util'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { type BorrowForm, BorrowPreset, type LlamaMarketTemplate } from './borrow.types'
import { BORROW_PRESET_RANGES, DEFAULT_SLIPPAGE } from './borrow.util'
import { useMaxBorrowReceive } from './queries/borrow-max-receive.query'
import { borrowFormValidationSuite } from './queries/borrow.validation'
import { useCreateLoanMutation } from './queries/create-loan.mutation'
import { useUserBalances } from './queries/user-balances.query'

type UseBorrowFormParams = {
  market: LlamaMarketTemplate
  network: BaseConfig<NetworkEnum, IChainId>
  preset: BorrowPreset
}

const getTokens = (market: LlamaMarketTemplate, chain: NetworkEnum) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          chain,
          symbol: market.collateralSymbol,
          address: market.collateral,
          decimals: market.collateralDecimals,
        },
        borrowToken: {
          chain,
          symbol: 'crvUSD',
          address: CRVUSD_ADDRESS,
          decimals: 18,
        },
      }
    : {
        collateralToken: {
          chain,
          symbol: market.collateral_token.symbol,
          address: market.collateral_token.address,
          decimals: market.collateral_token.decimals,
        },
        borrowToken: {
          chain,
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address,
          decimals: market.borrowed_token.decimals,
        },
      }

const useCallbackAfterFormUpdate = (form: UseFormReturn<BorrowForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export function useBorrowForm({ market, network: { id: chain, chainId }, preset }: UseBorrowFormParams) {
  const { address: userAddress } = useAccount()
  const form = useForm<BorrowForm>({
    ...formDefaultOptions,
    // todo: also validate maxLeverage and maxCollateral
    resolver: vestResolver(borrowFormValidationSuite),
    defaultValues: {
      userCollateral: undefined,
      userBorrowed: 0,
      debt: undefined,
      leverage: undefined,
      slippage: DEFAULT_SLIPPAGE,
      range: BORROW_PRESET_RANGES[preset],
    },
  })
  const values = form.watch()
  const params = { chainId, poolId: market.id, userAddress, ...values }
  const {
    onSubmit,
    isPending: isCreating,
    isSuccess: isCreated,
    error: creationError,
    txHash,
    reset: resetCreation,
  } = useCreateLoanMutation({ chainId, poolId: market.id, reset: form.reset })
  const { borrowToken, collateralToken } = useMemo(() => getTokens(market, chain), [market, chain])
  useCallbackAfterFormUpdate(form, resetCreation) // reset creation state on form change

  // todo: figure out why form.formState.isValid is always true. For now, using useMemo to recalculate validation
  // const validation = useMemo(() => {
  //   const validation = borrowFormValidationSuite(values)
  //   const result = { isValid: validation.isValid(), errors: validation.getErrors() }
  //   console.log(result, validation)
  //   return result
  // }, [values])

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isCreating || form.formState.isSubmitting,
    onSubmit: form.handleSubmit(onSubmit), // todo: handle form errors
    maxBorrow: useMaxBorrowReceive(params),
    balances: useUserBalances(params),
    borrowToken,
    collateralToken,
    isCreated,
    creationError,
    txHash,
    formErrors: useMemo(
      () =>
        recordEntries(form.formState.errors)
          .filter(([field, error]) => field in form.formState.dirtyFields && error?.message)
          .map(([_, error]) => error!.message!),
      [form.formState],
    ),
  }
}
