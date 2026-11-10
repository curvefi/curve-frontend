import { BigNumber } from 'bignumber.js'
import { sum } from 'lodash'
import { useCallback } from 'react'
import { useSyncMarketLeverageSlippage } from '@/llamalend/hooks/useSyncMarketLeverageSlippage'
import { getMarketLeverageSlippage } from '@/llamalend/llama.utils'
import { type CloseLoanMutation, useClosePositionMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useUserBalances, type UserBalances } from '@/llamalend/queries/user/user-balances.query'
import { useUserState, type UserState } from '@/llamalend/queries/user/user-state.query'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type TokenUsdRate, useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { decimal, decimalNegate } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'
import { CLOSE_POSITION_COLUMNS, type ClosePositionRow } from '../ui/columns/columns.definitions'

const CLOSE_POSITION_SAFETY_BUFFER = 1.0001 // 0.01% safety margin

const userDefaultValues = {}

/** Hook to build state for the close-position form */
export function useClosePositionForm({
  network,
}: {
  network: { blockchainId: LlamaNetworkId; chainId: LlamaChainId }
}) {
  const { marketId, controllerAddress, tokens, userAddress } = useMarketContext<LlamaChainId>()
  const { chainId } = network
  const defaultSlippage = getMarketLeverageSlippage(chainId, controllerAddress)

  // Token data
  const { borrowToken, collateralToken } = tokens

  const borrowTokenUsdRateQuery = useTokenUsdRate({ chainId, tokenAddress: borrowToken?.address })

  const collateralTokenUsdRateQuery = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address })

  const userBalancesQuery = useUserBalances({ chainId, marketId, userAddress })

  const userStateQuery = useUserState({ chainId, marketId, userAddress })

  // Form state
  const form = useForm<CloseLoanMutation>({ defaultValues: { ...userDefaultValues, slippage: defaultSlippage } })
  useSyncMarketLeverageSlippage(form, defaultSlippage)

  const {
    values,
    formState: { isSubmitting, visibleErrors },
  } = form
  const {
    onSubmit,
    isPending: isClosing,
    error: closeError,
  } = useClosePositionMutation({ network, marketId, onReset: () => form.reset(userDefaultValues), userAddress })

  const isPending = isSubmitting || isClosing

  const selectTableData = useCallback(
    (
      { collateral, debt, convertedBorrowed }: UserState,
      { borrowed }: UserBalances,
      borrowTokenUsdRate: TokenUsdRate,
      collateralTokenUsdRate: TokenUsdRate,
    ) => {
      // Combine all user state balances with their token data and USD rates
      const collateralAmount = maybes([collateral, collateralToken], (collateral, collateralToken) =>
        +collateral > 0
          ? {
              symbol: collateralToken.symbol,
              amount: collateral,
              usd: maybe(collateralTokenUsdRate, rate => decimal(BigNumber(collateral).times(rate))),
            }
          : undefined,
      )

      const debtAmount = maybes([debt, borrowToken], (debt, borrowToken) =>
        +debt > 0
          ? {
              symbol: borrowToken.symbol,
              amount: debt,
              usd: maybe(borrowTokenUsdRate, rate => decimal(BigNumber(debt).times(rate))),
            }
          : undefined,
      )

      const convertedBorrowedAmount = maybes([convertedBorrowed, borrowToken], (convertedBorrowed, borrowToken) =>
        +convertedBorrowed > 0
          ? {
              symbol: borrowToken.symbol,
              amount: convertedBorrowed,
              usd: maybe(borrowTokenUsdRate, rate => decimal(BigNumber(convertedBorrowed).times(rate))),
            }
          : undefined,
      )

      /**
       * The portion of outstanding debt covered by the converted borrowed tokens already in the AMM
       * (converted from collateral during soft liquidation).
       * Capped at the debt amount — any surplus becomes the recoverable `excess`.
       */
      const paidFromCollateral = maybes([convertedBorrowed, debt], (convertedBorrowed, debt) =>
        decimalNegate(decimal(BigNumber.min(convertedBorrowed, debt))),
      )
      const paidFromCollateralAmount = maybes(
        [paidFromCollateral, borrowToken],
        (paidFromCollateral, borrowToken) =>
          +paidFromCollateral < 0 && {
            symbol: borrowToken.symbol,
            amount: paidFromCollateral,
            usd: maybe(borrowTokenUsdRate, rate => decimalNegate(decimal(BigNumber(-+paidFromCollateral).times(rate)))),
          },
      )

      /**
       * Calculates the excess borrow tokens (if borrow AMM balance > outstanding debt)
       * Can be negative, which indicates the additional amount needed from the user's wallet
       * to cover the debt after using up the converted borrowed tokens in the AMM. This is used to determine
       * if the user needs to pay additional from their wallet and how much,
       * or if there's an excess that can be recovered.
       */
      const excess = maybes([convertedBorrowed, debt], (convertedBorrowed, debt) =>
        decimal(BigNumber(convertedBorrowed).minus(debt)),
      )
      const excessConvertedAmount = maybes([excess, borrowToken], (excess, borrowToken) => ({
        symbol: borrowToken.symbol,
        amount: excess,
        usd: maybe(borrowTokenUsdRate, rate => decimalNegate(decimal(BigNumber(-+excess).times(rate)))),
      }))

      const rows: ClosePositionRow[] = notFalsy(
        { label: t`Collateral`, value: notFalsy(collateralAmount, convertedBorrowedAmount) },
        { label: t`Outstanding debt`, value: notFalsy(debtAmount), testId: 'outstanding-debt' },
        paidFromCollateralAmount && { label: t`Paid from collateral`, value: notFalsy(paidFromCollateralAmount) },
        // If excess < 0, the converted borrowed tokens don't fully cover the debt
        // and the user must pay the shortfall from their wallet
        Number(excessConvertedAmount?.amount) < 0 && {
          label: t`Paid from wallet`,
          value: notFalsy(excessConvertedAmount),
        },
      )

      /**
       * Determines if a user can close their position and calculates how much
       * additional borrowed token is required. Applies a safety buffer
       * to account for potential contract execution edge cases where exact balance
       * matching might fail due to rounding or state changes between transaction
       * submission and execution.
       *
       * The calculation is: max(0, (debt - convertedBorrowed) * CLOSE_POSITION_SAFETY_BUFFER - borrowed)
       * where:
       * - debt: Total amount owed
       * - convertedBorrowed: The converted borrowed tokens already in the AMM
       * - borrowed: User's borrowed token balance
       */
      const missing = maybes([debt, convertedBorrowed, borrowed], (debt, convertedBorrowed, borrowed) =>
        decimal(
          BigNumber.max(
            0,
            new BigNumber(debt).minus(convertedBorrowed).times(CLOSE_POSITION_SAFETY_BUFFER).minus(borrowed),
          ),
        ),
      )

      /**
       * The recoverable collateral and borrow tokens when closing a position in soft liquidation
       * 1. Any remaining collateral tokens (if collateral > 0)
       * 2. Excess borrow tokens (if borrow AMM balance > outstanding debt)
       */
      const collateralToRecover = notFalsy(collateralAmount, Number(excess) > 0 && excessConvertedAmount)
      const collateralToRecoverUsd = collateralToRecover.some(({ usd }) => usd == null)
        ? undefined
        : sum(collateralToRecover.map(col => Number(col.usd)))
      const hasBadDebt = collateralToRecoverUsd != null && collateralToRecoverUsd <= 0

      return { rows, collateralToRecover, hasBadDebt, missing, borrowedBalance: borrowed }
    },
    [borrowToken, collateralToken],
  )

  const tableDataQuery = useCombinedQueries(
    [userStateQuery, userBalancesQuery, borrowTokenUsdRateQuery, collateralTokenUsdRateQuery],
    selectTableData,
  )
  const { data: closePositionData } = tableDataQuery
  const missing = closePositionData?.missing

  const table = useCurveTable({ columns: CLOSE_POSITION_COLUMNS, query: mapQuery(tableDataQuery, ({ rows }) => rows) })

  return {
    form,
    values,
    isPending,
    isDisabled: isPending || !!table.error || Number(missing) > 0,
    userAddress,
    table,
    debtTokenSymbol: borrowToken?.symbol,
    collateralToRecover: closePositionData?.collateralToRecover,
    hasBadDebt: closePositionData?.hasBadDebt ?? false,
    missing,
    borrowedBalance: closePositionData?.borrowedBalance,
    closeError,
    formErrors: visibleErrors,
    isApproved: q(useCloseLoanIsApproved({ chainId, marketId, userAddress })),
    onSubmit: form.handleSubmit(onSubmit),
  }
}
