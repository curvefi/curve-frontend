import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreFutureLeverage } from '@/llamalend/queries/borrow-more/borrow-more-future-leverage.query'
import { useBorrowMoreEstimateGas } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreHealth } from '@/llamalend/queries/borrow-more/borrow-more-health.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserCurrentLeverage } from '@/llamalend/queries/user'
import { type BorrowMoreForm, type BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { useBorrowRates } from '@/llamalend/widgets/action-card/hooks/useBorrowRates'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/hooks/usePrevLoanState'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { combineQueries } from '@ui-kit/lib/queries/combine'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery, q, type QueryProp } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import type { PriceImpact } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { getLeverageInfoFields } from '../../../widgets/action-card/hooks/getLeverageInfoFields'

export function BorrowMoreLoanInfoList<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, debt },
  tokens: { collateralToken, borrowToken },
  networks,
  onSlippageChange,
  leverageEnabled,
  form,
  controllerAddress,
  marketType,
  routes,
  priceImpact,
}: {
  params: BorrowMoreParams<ChainId>
  values: BorrowMoreForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  networks: NetworkDict<ChainId>
  controllerAddress: Address | undefined
  marketType: LlamaMarketType
  onSlippageChange: (newSlippage: Decimal) => void
  leverageEnabled: boolean | undefined
  form: UseFormReturn<BorrowMoreForm>
  routes: MarketRoutes | undefined
  priceImpact: QueryProp<PriceImpact | Decimal | null>
}) {
  const isOpen = form.isTouched('userCollateral', 'userBorrowed', 'debt')
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken }, isOpen)
  const { prevCollateral, prevDebt } = prevLoanState

  const expectedCollateralQuery = useBorrowMoreExpectedCollateral(params, isOpen && leverageEnabled)
  const totalCollateral = expectedCollateralQuery.data?.totalCollateral
  const collateralDelta = leverageEnabled ? totalCollateral : userCollateral
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useBorrowMoreIsApproved(params, isOpen))}
      gas={q(useBorrowMoreEstimateGas(networks, params, isOpen))}
      health={q(useBorrowMoreHealth(params, isOpen))}
      prices={q(useBorrowMorePrices(params, isOpen))}
      oraclePrice={q(useMarketOraclePrice(params, isOpen))}
      loanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            collateralDelta,
            expectedBorrowed: prevDebt.data && decimalSum(prevDebt.data, debt),
          },
          isOpen,
        ),
      )}
      debt={mapQuery(prevDebt, stateDebt => decimalSum(stateDebt, debt))}
      {...getLeverageInfoFields({
        leverageEnabled,
        leverageValue: useBorrowMoreFutureLeverage(params, isOpen),
        prevLeverageValue: useUserCurrentLeverage(params, isOpen),
        prevCollateral,
        leverageTotalCollateral: combineQueries(
          [prevCollateral, expectedCollateralQuery],
          (prevCollateral, { totalCollateral }) => maybes([totalCollateral, prevCollateral], decimalSum),
        ),
        expected: expectedCollateralQuery,
        routes,
        slippage,
        onSlippageChange,
        priceImpact,
        collateralDelta,
      })}
      {...useBorrowRates({ params, marketType, controllerAddress, debtDelta: debt }, isOpen)}
      {...prevLoanState}
    />
  )
}
