import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useRemoveCollateralFutureLeverage } from '@/llamalend/queries/remove-collateral/remove-collateral-future-leverage.query'
import { useRemoveCollateralEstimateGas } from '@/llamalend/queries/remove-collateral/remove-collateral-gas-estimate.query'
import { getRemoveCollateralHealthOptions } from '@/llamalend/queries/remove-collateral/remove-collateral-health.query'
import { useRemoveCollateralPrices } from '@/llamalend/queries/remove-collateral/remove-collateral-prices.query'
import { useUserCurrentLeverage } from '@/llamalend/queries/user'
import { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { CollateralForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { useBorrowRates } from '@/llamalend/widgets/action-card/hooks/useBorrowRates'
import { useLeverageInfoFields } from '@/llamalend/widgets/action-card/hooks/useLeverageInfoFields'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/hooks/usePrevLoanState'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Token } from '@primitives/address.utils'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalMax, decimalMinus, decimalNegate } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

export function RemoveCollateralInfoList<ChainId extends IChainId>({
  params,
  values: { userCollateral },
  collateralToken,
  borrowToken,
  networks,
  form,
  market,
}: {
  params: CollateralParams<ChainId>
  values: CollateralForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  form: UseFormReturn<CollateralForm>
  market: LlamaMarketTemplate | undefined
}) {
  const isOpen = isFormTouched(form, 'userCollateral')
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken }, isOpen)
  const { prevCollateral, prevDebt } = prevLoanState
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      gas={q(useRemoveCollateralEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries(isFull => getRemoveCollateralHealthOptions({ ...params, isFull }, isOpen)))}
      debt={prevDebt}
      loanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            collateralDelta: userCollateral && decimalNegate(userCollateral),
            expectedBorrowed: prevDebt.data,
          },
          isOpen && !!userCollateral,
        ),
      )}
      collateral={mapQuery(
        prevCollateral,
        stateCollateral => decimalMax('0', decimalMinus(stateCollateral, userCollateral ?? '0')), // validation fails, "max" just to prevent collateral<0 the UI
      )}
      prices={q(useRemoveCollateralPrices(params, isOpen))}
      {...useLeverageInfoFields({
        leverageEnabled: false,
        leverageValue: useRemoveCollateralFutureLeverage(params, isOpen),
        prevLeverageValue: useUserCurrentLeverage(params, isOpen),
        prevCollateral,
        leverageTotalCollateral: prevCollateral,
        collateralDelta: userCollateral && decimalNegate(userCollateral),
      })}
      {...prevLoanState}
      {...useBorrowRates({ params, market }, isOpen)}
    />
  )
}
