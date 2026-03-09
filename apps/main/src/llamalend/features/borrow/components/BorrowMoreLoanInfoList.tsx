import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreFutureLeverage } from '@/llamalend/queries/borrow-more/borrow-more-future-leverage.query'
import { useBorrowMoreEstimateGas } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreHealth } from '@/llamalend/queries/borrow-more/borrow-more-health.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import { useMarketFutureRates, useMarketOraclePrice, useMarketRates } from '@/llamalend/queries/market'
import { getUserHealthOptions, useUserCurrentLeverage, useUserPrices } from '@/llamalend/queries/user'
import { usePrevUserState } from '@/llamalend/queries/user/user-prev-state.query.ts'
import { type BorrowMoreForm, type BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { mapQuery, q, type QueryProp } from '@ui-kit/types/util'
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
  const { prevDebt, prevCollateral } = usePrevUserState(params, isOpen)
  const expectedCollateralQuery = useBorrowMoreExpectedCollateral(params, isOpen && leverageEnabled)
  const prevLeverageValue = useUserCurrentLeverage(params, isOpen)
  const leverageValue = useBorrowMoreFutureLeverage(params, isOpen && leverageEnabled)
  const priceImpact = useBorrowMorePriceImpact(params, isOpen && leverageEnabled)

  const collateralDelta = leverageEnabled ? expectedCollateralQuery.data?.totalCollateral : userCollateral

  const totalDebt = useMemo(
    () => debt && prevDebt.data && decimal(new BigNumber(prevDebt.data).plus(debt).toString()),
    [debt, prevDebt.data],
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
            expectedBorrowed: prevDebt.data,
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
      prevDebt={prevDebt}
      debt={mapQuery(
        prevDebt,
        (stateDebt) =>
          debt && { value: decimal(new BigNumber(stateDebt).plus(debt))!, tokenSymbol: borrowToken?.symbol },
      )}
      {...(leverageEnabled
        ? {
            leverageEnabled,
            leverageValue: q(leverageValue),
            prevLeverageValue: q(prevLeverageValue),
            prevLeverageCollateral: q({
              data:
                prevCollateral.data &&
                prevLeverageValue.data &&
                decimal(
                  new BigNumber(prevCollateral.data).minus(
                    new BigNumber(prevCollateral.data).div(prevLeverageValue.data),
                  ),
                ),
              ...combineQueryState(prevCollateral, prevLeverageValue),
            }),
            leverageCollateral: mapQuery(expectedCollateralQuery, ({ totalCollateral }) =>
              decimal(new BigNumber(totalCollateral).minus(userCollateral ?? '0')),
            ),
            prevLeverageTotalCollateral: prevCollateral,
            leverageTotalCollateral: q({
              data:
                expectedCollateralQuery.data?.totalCollateral &&
                prevCollateral.data &&
                decimal(new BigNumber(prevCollateral.data).plus(expectedCollateralQuery.data.totalCollateral)),
              ...combineQueryState(prevCollateral, expectedCollateralQuery),
            }),
            routes,
            slippage,
            onSlippageChange,
            priceImpact: q(priceImpact),
          }
        : {
            collateral: q({
              data: collateralDelta &&
                prevCollateral.data && {
                  value: decimal(new BigNumber(prevCollateral.data).plus(collateralDelta))!,
                  tokenSymbol: collateralToken?.symbol,
                },
              ...combineQueryState(prevCollateral, expectedCollateralQuery),
            }),
            prevCollateral,
          })}
      exchangeRate={q(useMarketOraclePrice(params, isOpen))}
      collateralSymbol={collateralToken?.symbol}
      borrowSymbol={borrowToken?.symbol}
    />
  )
}
