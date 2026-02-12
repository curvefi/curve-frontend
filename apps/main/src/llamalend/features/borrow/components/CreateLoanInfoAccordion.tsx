import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { q } from '@ui-kit/types/util'
import { mapQuery } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'
import { useCreateLoanEstimateGas } from '../../../queries/create-loan/create-loan-approve-estimate-gas.query'
import { useCreateLoanBands } from '../../../queries/create-loan/create-loan-bands.query'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanHealth } from '../../../queries/create-loan/create-loan-health.query'
import { useCreateLoanPriceImpact } from '../../../queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '../../../queries/create-loan/create-loan-prices.query'
import { useMarketFutureRates } from '../../../queries/market-future-rates.query'
import { LoanInfoAccordion } from '../../../widgets/action-card/LoanInfoAccordion'
import { useLoanToValue } from '../hooks/useLoanToValue'
import { type CreateLoanForm, type CreateLoanFormQueryParams, type Token } from '../types'

/**
 * Accordion with action infos about the loan (like health, band range, price range, N, borrow APR, LTV, estimated gas, slippage)
 * By default, only the health info is visible. The rest is visible when the accordion is expanded.
 * When leverage is enabled, leverage-specific infos and slippage settings are also included.
 */
export const CreateLoanInfoAccordion = <ChainId extends IChainId>({
  params,
  values: { range, slippage, leverageEnabled },
  collateralToken,
  borrowToken,
  networks,
  onSlippageChange,
}: {
  params: CreateLoanFormQueryParams<ChainId>
  values: CreateLoanForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  onSlippageChange: (newSlippage: Decimal) => void
}) => {
  const [isOpen, , , toggle] = useSwitch(false)
  const expectedCollateral = q(useCreateLoanExpectedCollateral(params, isOpen))
  const leverageValue = mapQuery(expectedCollateral, (data) => data?.leverage)
  const leverageTotalCollateral = mapQuery(expectedCollateral, (data) => data?.totalCollateral)
  const priceImpact = q(useCreateLoanPriceImpact(params, isOpen))

  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      range={range}
      isApproved={q(useCreateLoanIsApproved(params))}
      health={q(useCreateLoanHealth(params, isOpen))}
      bands={q(useCreateLoanBands(params, isOpen))}
      prices={q(useCreateLoanPrices(params, isOpen))}
      prevRates={q(useMarketRates(params, isOpen))}
      rates={q(useMarketFutureRates(params, isOpen))}
      loanToValue={useLoanToValue(
        {
          params,
          collateralToken,
          borrowToken,
        },
        isOpen,
      )}
      gas={useCreateLoanEstimateGas(networks, params, isOpen)}
      leverageEnabled={leverageEnabled}
      {...(leverageEnabled && {
        leverageValue,
        leverageTotalCollateral,
        priceImpact,
        slippage,
        onSlippageChange,
        collateralSymbol: collateralToken?.symbol,
      })}
    />
  )
}
