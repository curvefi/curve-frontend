import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'
import type { BorrowForm, BorrowFormQuery } from '../../features/borrow/types'
import { borrowQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

type BorrowPricesReceiveQuery = BorrowFormQuery & Pick<BorrowForm, 'maxDebt'>
type BorrowPricesReceiveParams = FieldsOf<BorrowPricesReceiveQuery>

type BorrowPricesResult = [Decimal, Decimal]
const convertNumbers = (prices: string[]) => [prices[0], prices[1]] as BorrowPricesResult

export const { useQuery: useCreateLoanPrices } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    maxDebt,
  }: BorrowPricesReceiveParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanPrices',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
      { maxDebt },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: BorrowPricesReceiveQuery): Promise<BorrowPricesResult> => {
    const market = getLlamaMarket(marketId)
    return !leverageEnabled
      ? convertNumbers(await market.createLoanPrices(userCollateral, debt, range))
      : market instanceof LendMarketTemplate
        ? convertNumbers(await market.leverage.createLoanPrices(userCollateral, userBorrowed, debt, range))
        : market.leverageV2.hasLeverage()
          ? convertNumbers(await market.leverageV2.createLoanPrices(userCollateral, userBorrowed, debt, range))
          : convertNumbers(await market.leverage.createLoanPrices(userCollateral, debt, range))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [
    createLoanMaxReceiveKey(params),
    ...(params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
  ],
})
