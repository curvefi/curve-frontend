import BigNumber from 'bignumber.js'
import type { FieldError, UseFormReturn } from 'react-hook-form'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanIsApproved } from '@/llamalend/queries/create-loan/create-loan-approved.query'
import { useMarketRates } from '@/llamalend/queries/market'
import { useMarketFutureRates } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils/decimal'
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

const toQueryError = (error: FieldError | undefined) => (error?.message ? new Error(error.message) : null)

export const CreateLoanInfoList = <ChainId extends IChainId>({
  market,
  params,
  values: { slippage, leverageEnabled, userCollateral, debt },
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
  const leverageCollateral = mapQuery(leverageTotalCollateral, (levTotCol) =>
    decimal(new BigNumber(levTotCol).minus(userCollateral ?? '0')),
  )
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
      collateral={q({
        data: { value: userCollateral ?? null, tokenSymbol: collateralToken?.symbol },
        isLoading: !collateralToken,
        error: toQueryError(form.formState.errors.userCollateral),
      })}
      debt={q({
        data: { value: debt ?? null, tokenSymbol: borrowToken?.symbol },
        isLoading: !borrowToken,
        error: toQueryError(form.formState.errors.debt),
      })}
      {...(leverageEnabled && {
        routes,
        leverageValue,
        leverageCollateral,
        leverageTotalCollateral,
        exchangeRate: mapQuery(expectedCollateral, (data) => data?.avgPrice ?? null),
        priceImpact: q(priceImpact),
        slippage,
        onSlippageChange,
        collateralSymbol: collateralToken?.symbol,
      })}
    />
  )
}
