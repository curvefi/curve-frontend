import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import { useNetBorrowApr } from '@/llamalend/features/borrow/hooks/useNetBorrowApr'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useAddCollateralFutureLeverage } from '@/llamalend/queries/add-collateral/add-collateral-future-leverage.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { getAddCollateralHealthOptions } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
import { useMarketRates } from '@/llamalend/queries/market'
import { getUserHealthOptions, useUserCurrentLeverage, useUserPrices } from '@/llamalend/queries/user'
import { usePrevUserState } from '@/llamalend/queries/user/user-prev-state.query.ts'
import { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { CollateralForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

export function AddCollateralInfoList<ChainId extends IChainId>({
  params,
  values: { userCollateral },
  collateralToken,
  borrowToken,
  networks,
  leverageEnabled,
  form,
  market,
}: {
  params: CollateralParams<ChainId>
  values: CollateralForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  leverageEnabled: boolean
  form: UseFormReturn<CollateralForm>
  market: LlamaMarketTemplate | undefined
}) {
  const isOpen = isFormTouched(form, 'userCollateral')
  const { prevDebt, prevCollateral } = usePrevUserState(params, isOpen)

  const marketRates = q(useMarketRates(params, isOpen))
  const { netBorrowApr } = useNetBorrowApr({ market, params, marketRates }, isOpen)

  const expectedCollateral = mapQuery(
    prevCollateral,
    (stateCollateral) =>
      stateCollateral &&
      userCollateral && {
        value: decimal(new BigNumber(stateCollateral).plus(userCollateral)) as Decimal,
        tokenSymbol: collateralToken?.symbol,
      },
  )

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      gas={q(useAddCollateralEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries((isFull) => getAddCollateralHealthOptions({ ...params, isFull }, isOpen)))}
      prevHealth={q(useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }, isOpen)))}
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
            collateralDelta: userCollateral,
            expectedBorrowed: prevDebt.data,
          },
          isOpen && !!userCollateral,
        ),
      )}
      prevDebt={prevDebt}
      debt={mapQuery(prevDebt, (value) => (value != null ? { value, tokenSymbol: borrowToken?.symbol } : null))}
      prevRates={marketRates}
      rates={marketRates}
      prevNetBorrowApr={netBorrowApr && q(netBorrowApr)}
      netBorrowApr={netBorrowApr && q(netBorrowApr)}
      prevCollateral={prevCollateral}
      collateral={expectedCollateral}
      leverageEnabled={leverageEnabled}
      prevLeverageValue={q(useUserCurrentLeverage(params, isOpen))}
      leverageValue={q(useAddCollateralFutureLeverage(params, isOpen))}
      collateralSymbol={collateralToken?.symbol}
      borrowSymbol={borrowToken?.symbol}
      prevPrices={q(useUserPrices(params))}
      prices={q(useAddCollateralPrices(params, isOpen))}
    />
  )
}
