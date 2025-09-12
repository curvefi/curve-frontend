import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { Address } from 'viem'
import { formatUnits } from 'viem'
import { useAccount, useBalance } from 'wagmi'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { notFalsy, recordEntries } from '@curvefi/prices-api/objects.util'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { CRVUSD_ADDRESS, formatNumber } from '@ui-kit/utils'
import { type BorrowForm, BorrowPreset, type LlamaMarketTemplate } from './borrow.types'
import { BORROW_PRESET_RANGES } from './llama.util'
import { useMaxBorrowReceive } from './queries/borrow-max-receive.query'
import { borrowFormValidationSuite } from './queries/borrow.validation'
import { useCreateLoanMutation } from './queries/create-loan.mutation'
import { SLIPPAGE_PRESETS } from '@ui-kit/features/slippage-settings/ui/slippage.utils'

const getTokens = (market: LlamaMarketTemplate, chain: NetworkEnum) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          chain,
          symbol: market.collateralSymbol,
          address: market.collateral as Address,
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
          address: market.collateral_token.address as Address,
          decimals: market.collateral_token.decimals,
        },
        borrowToken: {
          chain,
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address as Address,
          decimals: market.borrowed_token.decimals,
        },
      }

const useCallbackAfterFormUpdate = (form: UseFormReturn<BorrowForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

const useUserBalance = (userAddress: Address | undefined, token: { address: Address } | undefined, chainId: number) => {
  const { data: userCollateral } = useBalance({ address: userAddress, token: token?.address, chainId })
  return parseInt(formatUnits(userCollateral?.value || 0n, userCollateral?.decimals || 18), 10)
}

export function useBorrowForm<ChainId extends IChainId>({
  market,
  network: { id: chain, chainId },
  preset,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<NetworkEnum, ChainId>
  preset: BorrowPreset
}) {
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
      slippage: SLIPPAGE_PRESETS.STABLE,
      range: BORROW_PRESET_RANGES[preset],
    },
  })
  const values = form.watch()
  const params = useDebouncedValue(
    useMemo(
      () => ({ chainId, poolId: market?.id, userAddress, ...values }),
      [chainId, market?.id, userAddress, values],
    ),
  )

  const {
    onSubmit,
    isPending: isCreating,
    isSuccess: isCreated,
    error: creationError,
    txHash,
    reset: resetCreation,
  } = useCreateLoanMutation({ chainId, poolId: market?.id, reset: form.reset })
  const maxBorrow = useMaxBorrowReceive(params)

  const { borrowToken, collateralToken } = useMemo(() => market && getTokens(market, chain), [market, chain]) ?? {}
  const userCollateralBalance = useUserBalance(userAddress, collateralToken, chainId)

  useCallbackAfterFormUpdate(form, resetCreation) // reset creation state on form change

  const maxDebt = maxBorrow.data?.maxDebt
  const maxDebtError =
    maxDebt != null &&
    values.debt &&
    values.debt > maxDebt &&
    t`Exceeds maximum borrowable amount of ${formatNumber(maxDebt, { abbreviate: true, currency: borrowToken?.symbol })} ${borrowToken?.symbol ?? ''}`

  const maxCollateral = userCollateralBalance ?? maxBorrow.data?.maxTotalCollateral
  const maxCollateralError =
    maxCollateral != null &&
    values.userCollateral &&
    values.userCollateral > maxCollateral &&
    t`Exceeds your balance of ${formatNumber(maxCollateral, { abbreviate: true, currency: collateralToken?.symbol })} ${collateralToken?.symbol ?? ''}`

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isCreating,
    onSubmit: form.handleSubmit(onSubmit), // todo: handle form errors
    maxBorrow,
    borrowToken,
    collateralToken,
    isCreated,
    creationError,
    txHash,
    maxDebt,
    maxCollateral,
    tooMuchDebt: !!maxDebtError,
    tooMuchCollateral: !!maxCollateralError,
    formErrors: useMemo(
      () =>
        notFalsy(
          ...recordEntries(form.formState.errors)
            .filter(([field, error]) => field in form.formState.dirtyFields && error?.message)
            .map(([_, error]) => error!.message!),
          maxDebtError,
          maxCollateralError,
        ),
      [form.formState, maxDebtError, maxCollateralError],
    ),
  }
}
