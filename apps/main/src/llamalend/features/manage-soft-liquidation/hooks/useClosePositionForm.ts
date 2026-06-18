import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { LEVERAGE } from '@/llamalend/constants'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type CloseLoanMutation, useClosePositionMutation } from '@/llamalend/mutations/close-position.mutation'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { useUserBalances, useUserState } from '@/llamalend/queries/user'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@primitives/objects.utils'
import { useForm } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { useCombinedQueries } from '@ui-kit/lib/queries/combine'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { mapQuery } from '@ui-kit/types/util'
import { decimal, decimalNegate } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { CLOSE_POSITION_COLUMNS, type ClosePositionRow } from '../ui/columns/columns.definitions'

const CLOSE_POSITION_SAFETY_BUFFER = 1.0001 // 0.01% safety margin

const userDefaultValues = {}
const formOptions = {
  defaultValues: { ...userDefaultValues, slippage: SLIPPAGE[LEVERAGE].default },
} as const

type UserStateData = NonNullable<ReturnType<typeof useUserState>['data']>
type UserBalancesData = NonNullable<ReturnType<typeof useUserBalances>['data']>
type TokenUsdRate = NonNullable<ReturnType<typeof useTokenUsdRate>['data']>

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

  const borrowTokenUsdRateQuery = useTokenUsdRate({ chainId, tokenAddress: borrowToken?.address }, enabled)

  const collateralTokenUsdRateQuery = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address }, enabled)

  const userBalancesQuery = useUserBalances({ chainId, marketId, userAddress }, enabled)

  const userStateQuery = useUserState({ chainId, marketId, userAddress }, enabled)

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
      const collateralAmount = collateral != null &&
        +collateral > 0 &&
        collateralToken && {
          symbol: collateralToken.symbol,
          amount: collateral,
          usd: decimal(collateralTokenUsdRate && BigNumber(collateral).times(collateralTokenUsdRate)),
        }

      const debtAmount = debt != null &&
        +debt > 0 &&
        borrowToken && {
          symbol: borrowToken.symbol,
          amount: debt,
          usd: decimal(borrowTokenUsdRate && BigNumber(debt).times(borrowTokenUsdRate)),
        }

      const stablecoinAmount = stablecoin != null &&
        +stablecoin > 0 &&
        borrowToken && {
          symbol: borrowToken.symbol,
          amount: stablecoin,
          usd: decimal(borrowTokenUsdRate && BigNumber(stablecoin).times(borrowTokenUsdRate)),
        }

      /**
       * The portion of outstanding debt covered by the stablecoin already held in the AMM
       * (converted from collateral during soft liquidation).
       * Capped at the debt amount — any surplus becomes the recoverable `excess`.
       */
      const paidFromCollateral = decimalNegate(decimal(stablecoin && debt && BigNumber.min(stablecoin, debt)))
      const paidFromCollateralAmount = paidFromCollateral != null &&
        +paidFromCollateral < 0 &&
        borrowToken && {
          symbol: borrowToken.symbol,
          amount: paidFromCollateral,
          usd: decimalNegate(decimal(borrowTokenUsdRate && BigNumber(-+paidFromCollateral).times(borrowTokenUsdRate))),
        }

      /**
       * Calculates the excess borrow tokens (if borrow AMM balance > outstanding debt)
       * Can be negative, which indicates the additional amount needed from the user's wallet
       * to cover the debt after using up the stablecoin in the AMM. This is used to determine
       * if the user needs to pay additional from their wallet and how much,
       * or if there's an excess that can be recovered.
       */
      const excess = decimal(stablecoin && debt && BigNumber(stablecoin).minus(debt))
      const excessStablecoinAmount = excess &&
        borrowToken && {
          symbol: borrowToken.symbol,
          amount: excess,
          usd: decimalNegate(decimal(borrowTokenUsdRate && BigNumber(-+excess).times(borrowTokenUsdRate))),
        }

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
      const missing =
        debt != null && stablecoin != null && borrowed != null
          ? decimal(
              BigNumber.max(
                0,
                new BigNumber(debt).minus(stablecoin).times(CLOSE_POSITION_SAFETY_BUFFER).minus(borrowed),
              ),
            )
          : undefined

      /**
       * The recoverable collateral and borrow tokens when closing a position in soft liquidation
       * 1. Any remaining collateral tokens (if collateral > 0)
       * 2. Excess borrow tokens (if borrow AMM balance > outstanding debt)
       */
      const collateralToRecover = notFalsy(collateralAmount, Number(excess) > 0 && excessStablecoinAmount)
      const collateralToRecoverUsd = collateralToRecover.reduce((sum, { usd }) => sum + (Number(usd) || 0), 0)

      return { rows, collateralToRecover, collateralToRecoverUsd, missing, borrowedBalance: borrowed }
    },
    [borrowToken, collateralToken],
  )

  const tableDataQuery = useCombinedQueries(
    [userStateQuery, userBalancesQuery, borrowTokenUsdRateQuery, collateralTokenUsdRateQuery],
    selectTableData,
  )

  const table = useTable({
    columns: CLOSE_POSITION_COLUMNS,
    query: mapQuery(tableDataQuery, ({ rows }) => rows),
    ...getTableOptions(tableDataQuery.data?.rows),
  })

  const missing = tableDataQuery.data?.missing

  return {
    form,
    values,
    isPending,
    isDisabled: isPending || !!table.error || Number(missing) > 0,
    table,
    debtTokenSymbol: borrowToken?.symbol,
    collateralToRecover: tableDataQuery.data?.collateralToRecover,
    collateralToRecoverUsd: tableDataQuery.data?.collateralToRecoverUsd ?? 0,
    missing,
    borrowedBalance: tableDataQuery.data?.borrowedBalance,
    closeError,
    formErrors: visibleErrors,
    isApproved: useCloseLoanIsApproved({ chainId, marketId, userAddress }, enabled),
    onSubmit: form.handleSubmit(onSubmit),
  }
}
