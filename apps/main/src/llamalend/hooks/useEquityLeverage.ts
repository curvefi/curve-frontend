import {
  getAddCollateralPosition,
  getBorrowMorePosition,
  getCreateLoanPosition,
  getEquityLeverage,
  getEquityLeverageApr,
  getRemoveCollateralPosition,
  getRepayPosition,
  getYieldMultiplier,
  type LeverageRates,
} from '@/llamalend/equity-leverage.utils'
import type { CreateLoanFormQueryParams } from '@/llamalend/features/borrow/types'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { hasZapV2 } from '@/llamalend/llama.utils'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { isLeverageBorrowMore } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useMarketFutureRates } from '@/llamalend/queries/market/market-future-rates.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { type MarketRates, useMarketRates } from '@/llamalend/queries/market/market-rates.query'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import { type UserState, useUserState } from '@/llamalend/queries/user/user-state.query'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayParams } from '@/llamalend/queries/validation/repay.types'
import { getMarketCampaigns, sumCampaignsApr } from '@/llamalend/rates.utils'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import { useCampaigns } from '@evm-ui/queries/campaigns/campaigns.query'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { BlockchainIds } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, DISABLED_Q, mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { decimal, decimalMinus, ZERO } from '@ui/lib/decimal'

type DecimalQuery = QueryProp<Decimal | null>

/** Leverage and est. leveraged APR of the open position (current) and of the position after the action (future) */
export type EquityLeverage = {
  current: DecimalQuery
  future: DecimalQuery
  currentApr: DecimalQuery
  futureApr: DecimalQuery
  yieldMultiplier: DecimalQuery
}

/** The current value while the action has no future value, e.g. empty inputs */
export const getFutureOrCurrent = <T>({ current, future }: { current: QueryProp<T>; future: QueryProp<T> }) =>
  future.data === undefined && !future.isLoading && !future.error ? current : future

type MarketYields = Omit<LeverageRates, 'borrowApr'>

const getApr = (position: UserState | null, oraclePrice: Decimal, { borrowApr }: MarketRates, yields: MarketYields) =>
  position && getEquityLeverageApr(position, oraclePrice, { ...yields, borrowApr: borrowApr ?? null })

const getBorrowedToken = (snapshot: LendingSnapshot | CrvUsdSnapshot) =>
  'borrowedToken' in snapshot ? snapshot.borrowedToken : snapshot.stablecoinToken

/** Yields and borrow rewards of the market, from its latest snapshot and its borrow campaigns */
function useLeverageRates(enabled: boolean): QueryProp<MarketYields> {
  const { marketType, controllerAddress, chainId, ammAddress, vaultToken } = useMarketContext()
  const blockchainId = BlockchainIds[chainId]
  const snapshots = useMarketSnapshots({ marketType, controllerAddress, blockchainId, enabled })
  const campaigns = useCampaigns({ blockchainId })
  return combineQueries(
    [snapshots, { ...campaigns, data: campaigns.isLoading ? undefined : campaigns.data }],
    (snapshots, campaigns) => {
      const latest = snapshots.at(-1)
      const marketCampaigns = getMarketCampaigns(campaigns, {
        marketType,
        controllerAddress,
        vaultAddress: vaultToken?.address,
        ammAddress,
      })
      return {
        collateralYieldApr: decimal(latest?.collateralToken.rebasingYieldApr) ?? null,
        borrowedYieldApr: decimal(latest && getBorrowedToken(latest).rebasingYieldApr) ?? ZERO,
        borrowRewardsApr: decimal(sumCampaignsApr(marketCampaigns.filter(c => c.action === 'borrow'))) ?? ZERO,
      }
    },
  )
}

/**
 * Equity leverage of the open position (current) and of the position after the action (future).
 * Returns null when it is not shown: disabled, on the stable channel, or neither the open position nor the action
 * borrows through the zap.
 */
export function useEquityLeverage(
  {
    params,
    futurePosition,
    isZapBorrow = false,
    debtDelta,
  }: {
    params: UserMarketParams
    futurePosition?: QueryProp<UserState | null>
    isZapBorrow?: boolean
    /** Debt change of the action, for the future borrow APR */
    debtDelta?: Decimal | null
  },
  enabled = true,
): EquityLeverage | null {
  const isEnabled = useLlamalendEquityLeverage() && enabled
  const { marketType, controllerAddress, chainId, userAddress, tokens } = useMarketContext()
  const { data: collateralEvents } = useUserCollateralEvents({
    app: marketType,
    controllerAddress,
    chainId,
    userAddress,
    tokens,
  })
  const oraclePrice = q(useMarketOraclePrice(params, isEnabled))
  const position = q(useUserState(params, isEnabled))
  const futurePositionQuery = futurePosition ?? DISABLED_Q
  const leverageRates = useLeverageRates(isEnabled)
  const currentRates = q(useMarketRates(params, isEnabled))
  const futureRates = getFutureOrCurrent({
    current: currentRates,
    future: q(useMarketFutureRates({ chainId, marketId: params.marketId, debtDelta }, isEnabled)),
  })
  const currentApr = combineQueries([position, oraclePrice, currentRates, leverageRates], getApr)
  const equityLeverage = {
    current: combineQueries([position, oraclePrice], getEquityLeverage),
    future: combineQueries(
      [futurePositionQuery, oraclePrice],
      (position, oraclePrice) => position && getEquityLeverage(position, oraclePrice),
    ),
    currentApr,
    futureApr: combineQueries([futurePositionQuery, oraclePrice, futureRates, leverageRates], getApr),
    yieldMultiplier: combineQueries([currentApr, leverageRates], (apr, { collateralYieldApr }) =>
      getYieldMultiplier(apr, collateralYieldApr),
    ),
  }
  return isEnabled && (isZapBorrow || collateralEvents?.isZapLeveraged) ? equityLeverage : null
}

export function useCreateLoanEquityLeverage(params: CreateLoanFormQueryParams) {
  const { market } = useMarketContext()
  return useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(
        useCreateLoanExpectedCollateral(params, !!params.leverageEnabled),
        ({ totalCollateral }) => getCreateLoanPosition({ collateral: totalCollateral, debt: params.debt ?? ZERO }),
      ),
      isZapBorrow: !!params.leverageEnabled && hasZapV2(market),
      debtDelta: params.debt,
    },
    !!params.leverageEnabled,
  )
}

export function useBorrowMoreEquityLeverage(params: BorrowMoreParams) {
  const { market } = useMarketContext()
  const expectedCollateral = useBorrowMoreExpectedCollateral(params, !!params.leverageEnabled)
  const isZapBorrow = isLeverageBorrowMore(market, params.leverageEnabled)
  return useEquityLeverage({
    params,
    futurePosition: combineQueries(
      [q(useUserState(params)), isZapBorrow ? expectedCollateral : constQ(null)],
      (position, expected) =>
        getBorrowMorePosition(position, {
          collateral: (expected ? expected.totalCollateral : params.userCollateral) ?? ZERO,
          debt: params.debt ?? ZERO,
        }),
    ),
    isZapBorrow,
    debtDelta: params.debt,
  })
}

export function useRepayEquityLeverage(params: RepayParams, debt: QueryProp<Decimal | null>, enabled = true) {
  const position = q(useUserState(params, enabled))
  return useEquityLeverage(
    {
      params,
      futurePosition: combineQueries(
        [position, debt],
        (position, debt) =>
          debt &&
          getRepayPosition(position, {
            stateCollateral: params.stateCollateral ?? ZERO,
            debt,
            isFull: !!params.isFull,
          }),
      ),
      debtDelta: maybes([debt.data, position.data?.debt], decimalMinus),
    },
    enabled,
  )
}

export const useAddCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(q(useUserState(params, enabled)), position =>
        getAddCollateralPosition(position, params.userCollateral ?? ZERO),
      ),
    },
    enabled,
  )

export const useRemoveCollateralEquityLeverage = (params: CollateralParams, enabled = true) =>
  useEquityLeverage(
    {
      params,
      futurePosition: mapQuery(q(useUserState(params, enabled)), position =>
        getRemoveCollateralPosition(position, params.userCollateral ?? ZERO),
      ),
    },
    enabled,
  )
