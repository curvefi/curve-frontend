import type { UseFormReturn } from 'react-hook-form'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import { useMarketRates } from '@/llamalend/queries/market'
import { useMarketFutureRates } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, q } from '@ui-kit/types/util'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'
import { useCreateLoanEstimateGas } from '../../../queries/create-loan/create-loan-approve-estimate-gas.query'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanHealth } from '../../../queries/create-loan/create-loan-health.query'
import { useCreateLoanPriceImpact } from '../../../queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '../../../queries/create-loan/create-loan-prices.query'
import { LoanActionInfoList } from '../../../widgets/action-card/LoanActionInfoList'
import { useLoanToValue } from '../hooks/useLoanToValue'
import { useNetBorrowApr } from '../hooks/useNetBorrowApr'
import { type CreateLoanForm, type CreateLoanFormQueryParams } from '../types'

export const CreateLoanInfoList = <ChainId extends IChainId>({
  market,
  params,
  values: { slippage, leverageEnabled },
  collateralToken,
  borrowToken,
  networks,
  routes,
  onSlippageChange,
  form,
}: {
  market: LlamaMarketTemplate | undefined
  params: CreateLoanFormQueryParams<ChainId>
  values: CreateLoanForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  routes: MarketRoutes | undefined
  onSlippageChange: (newSlippage: Decimal) => void
  form: UseFormReturn<CreateLoanForm>
}) => {
  const isOpen = isFormTouched(form, 'userCollateral', 'debt')
  const expectedCollateral = useCreateLoanExpectedCollateral(params, isOpen)
  const leverageValue = mapQuery(expectedCollateral, (data) => data?.leverage)
  const leverageTotalCollateral = mapQuery(expectedCollateral, (data) => data?.totalCollateral)
  const priceImpact = useCreateLoanPriceImpact(params, isOpen)

  const { marketRates, marketFutureRates, netBorrowApr, futureBorrowApr } = useNetBorrowApr(
    {
      market,
      params,
      marketRates: q(useMarketRates(params, isOpen)),
      marketFutureRates: q(useMarketFutureRates(params, isOpen)),
    },
    isOpen,
  )

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useCreateLoanIsApproved(params))}
      health={q(useCreateLoanHealth(params, isOpen))}
      prices={q(useCreateLoanPrices(params, isOpen))}
      prevRates={marketRates}
      rates={marketFutureRates}
      prevNetBorrowApr={netBorrowApr && q(netBorrowApr)}
      netBorrowApr={futureBorrowApr && q(futureBorrowApr)}
      exchangeRate={q(useMarketOraclePrice(params, isOpen))}
      collateralSymbol={collateralToken?.symbol}
      borrowSymbol={borrowToken?.symbol}
      loanToValue={q(
        useLoanToValue(
          {
            params,
            collateralToken,
            borrowToken,
          },
          isOpen,
        ),
      )}
      gas={q(useCreateLoanEstimateGas(networks, params, isOpen))}
      leverageEnabled={leverageEnabled}
      {...(leverageEnabled && {
        routes,
        leverageValue,
        leverageTotalCollateral,
        priceImpact: q(priceImpact),
        slippage,
        onSlippageChange,
        collateralSymbol: collateralToken?.symbol,
      })}
    />
  )
}
