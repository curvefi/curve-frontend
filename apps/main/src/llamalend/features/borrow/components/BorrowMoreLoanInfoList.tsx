import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreEstimateGas } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreHealth } from '@/llamalend/queries/borrow-more/borrow-more-health.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import { useMarketFutureRates, useMarketOraclePrice, useMarketRates } from '@/llamalend/queries/market'
import { getUserHealthOptions, useUserCurrentLeverage, useUserPrices, useUserState } from '@/llamalend/queries/user'
import type { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useNetBorrowApr } from '../hooks/useNetBorrowApr'

export function BorrowMoreLoanInfoList<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, debt },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  leverageEnabled,
  form,
  market,
  routes,
}: {
  params: BorrowMoreParams<ChainId>
  values: BorrowMoreForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  market: LlamaMarketTemplate | undefined
  onSlippageChange: (newSlippage: Decimal) => void
  leverageEnabled: boolean
  form: UseFormReturn<BorrowMoreForm>
  routes: MarketRoutes | undefined
}) {
  const isOpen = isFormTouched(form, 'userCollateral', 'userBorrowed', 'debt')
  const userState = useUserState(params, isOpen)
  const expectedCollateralQuery = useBorrowMoreExpectedCollateral(params, isOpen && leverageEnabled)
  const prevLeverageValue = useUserCurrentLeverage(params, isOpen)
  const priceImpact = useBorrowMorePriceImpact(params, isOpen && leverageEnabled)

  const collateralDelta = leverageEnabled ? expectedCollateralQuery.data?.totalCollateral : userCollateral

  const totalDebt = useMemo(
    () => debt && userState.data && decimal(new BigNumber(userState.data.debt).plus(debt).toString()),
    [debt, userState.data],
  )

  const { marketRates, marketFutureRates, netBorrowApr, futureBorrowApr } = useNetBorrowApr(
    {
      market,
      params,
      marketRates: q(useMarketRates(params, isOpen)),
      marketFutureRates: q(
        useMarketFutureRates(
          { chainId: params.chainId, marketId: params.marketId, debt: totalDebt },
          isOpen && !!totalDebt,
        ),
      ),
    },
    isOpen,
  )

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useBorrowMoreIsApproved(params, isOpen))}
      gas={q(useBorrowMoreEstimateGas(networks, params, isOpen))}
      health={q(useBorrowMoreHealth(params, isOpen && !!debt))}
      prevHealth={q(useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }, isOpen)))}
      prevPrices={mapQuery(useUserPrices(params), (prices) => prices as Decimal[])}
      prices={q(useBorrowMorePrices(params, isOpen))}
      prevRates={marketRates}
      rates={marketFutureRates}
      prevNetBorrowApr={netBorrowApr && q(netBorrowApr)}
      netBorrowApr={futureBorrowApr && q(futureBorrowApr)}
      prevLoanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            expectedBorrowed: userState.data?.debt,
          },
          isOpen,
        ),
      )}
      loanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            collateralDelta,
            expectedBorrowed: totalDebt,
          },
          isOpen && !!totalDebt && !!collateralDelta,
        ),
      )}
      debt={mapQuery(
        userState,
        ({ debt: stateDebt }) =>
          debt && { value: decimal(new BigNumber(stateDebt).plus(debt))!, tokenSymbol: borrowToken?.symbol },
      )}
      // TODO: remove collateral and prevCollateral when leverage enabled. prevCollateral is computed from userState
      collateral={q({
        data: collateralDelta &&
          userState.data && {
            value: decimal(new BigNumber(userState.data.collateral).plus(collateralDelta))!,
            tokenSymbol: collateralToken?.symbol,
          },
        isLoading: [userState, expectedCollateralQuery].some((q) => q.isLoading),
        error: [userState, expectedCollateralQuery].find((q) => q.error)?.error ?? null,
      })}
      userState={q(userState)}
      leverageEnabled={leverageEnabled}
      {...(leverageEnabled && {
        leverageValue: mapQuery(
          expectedCollateralQuery,
          // todo: this might not be correct, use the llamalend-js calculation that's being implemented
          ({ collateralFromDebt, collateralFromUserBorrowed, userCollateral }) => {
            const base = new BigNumber(userCollateral).plus(collateralFromUserBorrowed)
            return decimal(base.isZero() ? 0 : new BigNumber(collateralFromDebt).plus(base).div(base))
          },
        ),
        prevLeverageValue: q(prevLeverageValue),
        prevLeverageCollateral: q({
          data:
            userState.data?.collateral &&
            prevLeverageValue.data &&
            decimal(
              new BigNumber(userState.data.collateral).minus(
                new BigNumber(userState.data.collateral).div(prevLeverageValue.data),
              ),
            ),
          ...combineQueryState(userState, prevLeverageValue),
        }),
        leverageCollateral: mapQuery(expectedCollateralQuery, ({ totalCollateral }) =>
          decimal(new BigNumber(totalCollateral).minus(userCollateral ?? '0')),
        ),
        prevLeverageTotalCollateral: mapQuery(userState, ({ collateral }) => collateral),
        leverageTotalCollateral: q({
          data:
            expectedCollateralQuery.data?.totalCollateral &&
            userState.data?.collateral &&
            decimal(new BigNumber(userState.data.collateral).plus(expectedCollateralQuery.data.totalCollateral)),
          ...combineQueryState(userState, expectedCollateralQuery),
        }),
        routes,
        slippage,
        onSlippageChange,
        priceImpact: q(priceImpact),
      })}
      exchangeRate={q(useMarketOraclePrice(params, isOpen))}
      collateralSymbol={collateralToken?.symbol}
      borrowSymbol={borrowToken?.symbol}
    />
  )
}
