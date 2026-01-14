import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useRepayBands } from '@/llamalend/queries/repay/repay-bands.query'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { useRepayHealth } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'

export function RepayLoanInfoAccordion<ChainId extends IChainId>({
  params,
  values: { slippage, userCollateral, isFull },
  collateralToken,
  borrowToken,
  networks,
  onSlippageChange,
  hasLeverage,
}: {
  params: RepayParams<ChainId>
  values: RepayForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
  hasLeverage: boolean | undefined
}) {
  const [isOpen, , , toggle] = useSwitch(false)
  const userState = q(useUserState(params, isOpen))
  const expectedBorrowed = useRepayExpectedBorrowed(params, isOpen)
  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      bands={q(useRepayBands(params, isOpen))}
      gas={useRepayEstimateGas(networks, params, isOpen)}
      health={q(useRepayHealth(params, isOpen))}
      prevHealth={useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }))}
      isFullRepay={isFull}
      prevRates={q(useMarketRates(params, isOpen))}
      rates={q(useMarketFutureRates(params, isOpen))}
      debt={{
        ...expectedBorrowed,
        data: expectedBorrowed.data && {
          tokenSymbol: borrowToken?.symbol,
          value: decimal(expectedBorrowed.data.totalBorrowed)!,
        },
      }}
      withdraw={mapQuery(expectedBorrowed, (data) => ({ value: data.totalBorrowed, tokenSymbol: borrowToken?.symbol }))}
      userState={userState}
      prices={q(useRepayPrices(params, isOpen))}
      // routeImage={q(useRepayRouteImage(params, isOpen))}
      loanToValue={useLoanToValueFromUserState(
        {
          chainId: params.chainId,
          marketId: params.marketId,
          userAddress: params.userAddress,
          collateralToken,
          borrowToken,
          collateralDelta: userCollateral && `${-+userCollateral}`,
        },
        isOpen,
      )}
      leverage={{
        enabled: !!hasLeverage,
        priceImpact: useRepayPriceImpact(params, isOpen),
        slippage,
        onSlippageChange,
        collateralSymbol: collateralToken?.symbol,
      }}
    />
  )
}
