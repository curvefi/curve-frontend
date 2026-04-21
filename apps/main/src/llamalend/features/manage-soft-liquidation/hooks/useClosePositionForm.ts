import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type CloseLoanMutation, useClosePositionMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useUserBalances, useUserState } from '@/llamalend/queries/user'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { decimal, decimalNegate } from '@ui-kit/utils'
import { filterFormErrors } from '@ui-kit/utils/react-form.utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { CLOSE_POSITION_COLUMNS, type ClosePositionRow } from '../ui/columns/columns.definitions'

const CLOSE_POSITION_SAFETY_BUFFER = 1.0001 // 0.01% safety margin

const formOptions = {
  ...formDefaultOptions,
  defaultValues: { slippage: SLIPPAGE_PRESETS.STABLE },
} as const

/** Hook to build state for the close-position form */
export function useClosePositionForm({
  market,
  network,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId; name: string }
  enabled?: boolean
}) {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  // Token data
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const {
    data: borrowTokenUsdRate,
    error: borrowTokenUsdRateError,
    isLoading: borrowTokenUsdRateLoading,
  } = useTokenUsdRate({ chainId, tokenAddress: borrowToken?.address }, enabled)

  const {
    data: collateralTokenUsdRate,
    error: collateralTokenUsdRateError,
    isLoading: collateralTokenUsdRateLoading,
  } = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address }, enabled)

  const {
    data: userBalancesData,
    error: userBalancesError,
    isLoading: userBalancesLoading,
  } = useUserBalances({ chainId, marketId, userAddress }, enabled)

  const { borrowed } = userBalancesData ?? {}

  const {
    data: userState,
    error: userStateError,
    isLoading: userStateLoading,
  } = useUserState({ chainId, marketId, userAddress }, enabled)

  const { collateral, debt, stablecoin } = userState ?? {}

  // Loading and error state, which are derived from token data hooks above
  const isLoading =
    userStateLoading || userBalancesLoading || borrowTokenUsdRateLoading || collateralTokenUsdRateLoading
  const error = userStateError || userBalancesError || borrowTokenUsdRateError || collateralTokenUsdRateError

  // Form state
  const form = useForm<CloseLoanMutation>(formOptions)

  const values = watchForm(form)
  const {
    onSubmit,
    isPending: isClosing,
    error: closeError,
  } = useClosePositionMutation({
    network,
    marketId,
    onReset: form.reset,
    userAddress,
  })

  const formState = form.formState
  const isPending = formState.isSubmitting || isClosing

  // Combine all user state balances with their token data and USD rates
  const collateralAmount = useMemo(
    () =>
      collateral != null &&
      +collateral > 0 &&
      collateralToken && {
        symbol: collateralToken.symbol,
        amount: collateral,
        usd: decimal(collateralTokenUsdRate && BigNumber(collateral).times(collateralTokenUsdRate)),
      },
    [collateral, collateralToken, collateralTokenUsdRate],
  )

  const debtAmount = useMemo(
    () =>
      debt != null &&
      +debt > 0 &&
      borrowToken && {
        symbol: borrowToken.symbol,
        amount: debt,
        usd: decimal(borrowTokenUsdRate && BigNumber(debt).times(borrowTokenUsdRate)),
      },
    [borrowToken, borrowTokenUsdRate, debt],
  )

  const stablecoinAmount = useMemo(
    () =>
      stablecoin != null &&
      +stablecoin > 0 &&
      borrowToken && {
        symbol: borrowToken.symbol,
        amount: stablecoin,
        usd: decimal(borrowTokenUsdRate && BigNumber(stablecoin).times(borrowTokenUsdRate)),
      },
    [borrowToken, borrowTokenUsdRate, stablecoin],
  )

  /**
   * The portion of outstanding debt covered by the stablecoin already held in the AMM
   * (converted from collateral during soft liquidation).
   * Capped at the debt amount — any surplus becomes the recoverable `excess`.
   */
  const paidFromCollateral = decimalNegate(decimal(stablecoin && debt && BigNumber.min(stablecoin, debt)))
  const paidFromCollateralAmount = useMemo(
    () =>
      paidFromCollateral != null &&
      +paidFromCollateral < 0 &&
      borrowToken && {
        symbol: borrowToken.symbol,
        amount: paidFromCollateral,
        usd: decimalNegate(decimal(borrowTokenUsdRate && BigNumber(-paidFromCollateral).times(borrowTokenUsdRate))),
      },
    [borrowToken, borrowTokenUsdRate, paidFromCollateral],
  )

  /**
   * Calculates the excess borrow tokens (if borrow AMM balance > outstanding debt)
   * Can be negative, which indicates the additional amount needed from the user's wallet
   * to cover the debt after using up the stablecoin in the AMM. This is used to determine
   * if the user needs to pay additional from their wallet and how much,
   * or if there's an excess that can be recovered.
   */
  const excess = decimal(stablecoin && debt && BigNumber(stablecoin).minus(debt))
  const excessStablecoinAmount = useMemo(
    () =>
      excess &&
      borrowToken && {
        symbol: borrowToken.symbol,
        amount: excess,
        usd: decimalNegate(decimal(borrowTokenUsdRate && BigNumber(-excess).times(borrowTokenUsdRate))),
      },
    [borrowToken, borrowTokenUsdRate, excess],
  )

  // Table creation
  const tableData: ClosePositionRow[] = useMemo(
    () =>
      notFalsy(
        { label: t`Collateral`, value: notFalsy(collateralAmount, stablecoinAmount) },
        { label: t`Outstanding debt`, value: notFalsy(debtAmount), testId: 'outstanding-debt' },
        paidFromCollateralAmount && {
          label: t`Paid from collateral`,
          value: notFalsy(paidFromCollateralAmount),
        },
        // If excess < 0, the AMM stablecoin doesn't fully cover the debt
        // and the user must pay the shortfall from their wallet
        Number(excessStablecoinAmount?.amount) < 0 && {
          label: t`Paid from wallet`,
          value: notFalsy(excessStablecoinAmount),
        },
      ),
    [collateralAmount, stablecoinAmount, debtAmount, paidFromCollateralAmount, excessStablecoinAmount],
  )

  const table = useTable({
    columns: CLOSE_POSITION_COLUMNS,
    data: tableData,
    ...getTableOptions(tableData),
  })

  /**
   * Determines if a user can close their position and calculates how much
   * additional borrowed stablecoin is required. Applies a safety buffer
   * to account for potential contract execution edge cases where exact balance
   * matching might fail due to rounding or state changes between transaction
   * submission and execution.
   *
   * The calculation is: max(0, (debt - stablecoin) * CLOSE_POSITION_SAFETY_BUFFER - borrowed)
   * where:
   * - debt: Total amount owed
   * - stablecoin: User's stablecoin balance already present in the AMM
   * - borrowed: User's borrowed token balance
   */
  const missing =
    debt != null && stablecoin != null && borrowed != null
      ? decimal(
          BigNumber.max(0, new BigNumber(debt).minus(stablecoin).times(CLOSE_POSITION_SAFETY_BUFFER).minus(borrowed)),
        )
      : undefined

  return {
    form,
    values,
    isLoading,
    isPending,
    isDisabled: isPending || isLoading || !!error || Number(missing) > 0,
    table,
    debtTokenSymbol: borrowToken?.symbol,
    /**
     * The recoverable collateral and borrow tokens when closing a position in soft liquidation
     * 1. Any remaining collateral tokens (if collateral > 0)
     * 2. Excess borrow tokens (if borrow AMM balance > outstanding debt)
     */
    collateralToRecover: notFalsy(collateralAmount, Number(excess) > 0 && excessStablecoinAmount),
    missing,
    borrowedBalance: borrowed,
    error,
    closeError,
    formErrors: useMemo(() => filterFormErrors(formState), [formState]),
    isApproved: useCloseLoanIsApproved({ chainId, marketId, userAddress }, enabled),
    onSubmit: form.handleSubmit(onSubmit),
  }
}
