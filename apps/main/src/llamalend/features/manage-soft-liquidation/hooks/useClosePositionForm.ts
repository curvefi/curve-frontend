import { BigNumber } from 'bignumber.js'
import { sum } from 'lodash'
import { useCallback } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { type CloseLoanMutation, useClosePositionMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useUserBalances, useUserState } from '@/llamalend/queries/user'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { useForm } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { useCombinedQueries } from '@ui-kit/lib/queries/combine'
import { QueryData } from '@ui-kit/lib/queries/types'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { mapQuery } from '@ui-kit/types/util'
import { decimal, decimalNegate } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { useMarketContext } from '../../market-context'
import { CLOSE_POSITION_COLUMNS, type ClosePositionRow } from '../ui/columns/columns.definitions'

const CLOSE_POSITION_SAFETY_BUFFER = 1.0001 // 0.01% safety margin

const userDefaultValues = {}
const formOptions = {
  defaultValues: { ...userDefaultValues, slippage: SLIPPAGE[LEVERAGE].default },
} as const

type UserStateData = QueryData<typeof useUserState>
type UserBalancesData = QueryData<typeof useUserBalances>
type TokenUsdRate = QueryData<typeof useTokenUsdRate>
/** Hook to build state for the close-position form */
export function useClosePositionForm({
  network,
}: {
  network: { id: LlamaNetworkId; chainId: LlamaChainId; name: string }
}) {
  const { marketId, tokens, userAddress } = useMarketContext<LlamaChainId>()
  const { chainId } = network

  // Token data
  const { borrowToken, collateralToken } = tokens

  const borrowTokenUsdRateQuery = useTokenUsdRate({ chainId, tokenAddress: borrowToken?.address })

  const collateralTokenUsdRateQuery = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address })

  const userBalancesQuery = useUserBalances({ chainId, marketId, userAddress })

  const userStateQuery = useUserState({ chainId, marketId, userAddress })

  // Form state
  const form = useForm<CloseLoanMutation>(formOptions)

  const values = form.watchValues()
  const {
    onSubmit,
    isPending: isClosing,
    error: closeError,
  } = useClosePositionMutation({
    network,
    marketId,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
  })

  const { isSubmitting, visibleErrors } = form.formState
  const isPending = isSubmitting || isClosing

  const selectTableData = useCallback(
    (
      { collateral, debt, stablecoin }: UserStateData,
      { borrowed }: UserBalancesData,
      borrowTokenUsdRate: TokenUsdRate,
      collateralTokenUsdRate: TokenUsdRate,
    ) => {
      // Combine all user state balances with their token data and USD rates
      const collateralAmount = maybes([collateral, collateralToken], ([collateral, collateralToken]) =>
        +collateral > 0
          ? {
              symbol: collateralToken.symbol,
              amount: collateral,
              usd: maybe(collateralTokenUsdRate, rate => decimal(BigNumber(collateral).times(rate))),
            }
          : undefined,
      )

      const debtAmount = maybes([debt, borrowToken], ([debt, borrowToken]) =>
        +debt > 0
          ? {
              symbol: borrowToken.symbol,
              amount: debt,
              usd: maybe(borrowTokenUsdRate, rate => decimal(BigNumber(debt).times(rate))),
            }
          : undefined,
      )

      const stablecoinAmount = maybes([stablecoin, borrowToken], ([stablecoin, borrowToken]) =>
        +stablecoin > 0
          ? {
              symbol: borrowToken.symbol,
              amount: stablecoin,
              usd: maybe(borrowTokenUsdRate, rate => decimal(BigNumber(stablecoin).times(rate))),
            }
          : undefined,
      )

      /**
       * The portion of outstanding debt covered by the stablecoin already held in the AMM
       * (converted from collateral during soft liquidation).
       * Capped at the debt amount — any surplus becomes the recoverable `excess`.
       */
      const paidFromCollateral = maybes([stablecoin, debt], ([stablecoin, debt]) =>
        decimalNegate(decimal(BigNumber.min(stablecoin, debt))),
      )
      const paidFromCollateralAmount = maybes(
        [paidFromCollateral, borrowToken],
        ([paidFromCollateral, borrowToken]) =>
          +paidFromCollateral < 0 && {
            symbol: borrowToken.symbol,
            amount: paidFromCollateral,
            usd: maybe(borrowTokenUsdRate, rate => decimalNegate(decimal(BigNumber(-+paidFromCollateral).times(rate)))),
          },
      )

      /**
       * Calculates the excess borrow tokens (if borrow AMM balance > outstanding debt)
       * Can be negative, which indicates the additional amount needed from the user's wallet
       * to cover the debt after using up the stablecoin in the AMM. This is used to determine
       * if the user needs to pay additional from their wallet and how much,
       * or if there's an excess that can be recovered.
       */
      const excess = maybes([stablecoin, debt], ([stablecoin, debt]) => decimal(BigNumber(stablecoin).minus(debt)))
      const excessStablecoinAmount = maybes([excess, borrowToken], ([excess, borrowToken]) => ({
        symbol: borrowToken.symbol,
        amount: excess,
        usd: maybe(borrowTokenUsdRate, rate => decimalNegate(decimal(BigNumber(-+excess).times(rate)))),
      }))

      const rows: ClosePositionRow[] = notFalsy(
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
      )

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
      const missing = maybes([debt, stablecoin, borrowed], ([debt, stablecoin, borrowed]) =>
        decimal(
          BigNumber.max(0, new BigNumber(debt).minus(stablecoin).times(CLOSE_POSITION_SAFETY_BUFFER).minus(borrowed)),
        ),
      )

      /**
       * The recoverable collateral and borrow tokens when closing a position in soft liquidation
       * 1. Any remaining collateral tokens (if collateral > 0)
       * 2. Excess borrow tokens (if borrow AMM balance > outstanding debt)
       */
      const collateralToRecover = notFalsy(collateralAmount, Number(excess) > 0 && excessStablecoinAmount)
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

  const table = useTable({
    columns: CLOSE_POSITION_COLUMNS,
    query: mapQuery(tableDataQuery, ({ rows }) => rows),
    ...getTableOptions(closePositionData?.rows),
  })

  return {
    form,
    values,
    isPending,
    isDisabled: isPending || !!table.error || Number(missing) > 0,
    table,
    debtTokenSymbol: borrowToken?.symbol,
    collateralToRecover: closePositionData?.collateralToRecover,
    hasBadDebt: closePositionData?.hasBadDebt ?? false,
    missing,
    borrowedBalance: closePositionData?.borrowedBalance,
    closeError,
    formErrors: visibleErrors,
    isApproved: useCloseLoanIsApproved({ chainId, marketId, userAddress }),
    onSubmit: form.handleSubmit(onSubmit),
  }
}
