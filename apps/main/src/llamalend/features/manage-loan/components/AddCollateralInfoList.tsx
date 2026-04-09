import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useAddCollateralFutureLeverage } from '@/llamalend/queries/add-collateral/add-collateral-future-leverage.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { getAddCollateralHealthOptions } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
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
import { decimal } from '@ui-kit/utils'
import { isFormTouched } from '@ui-kit/utils/react-form.utils'

export function AddCollateralInfoList<ChainId extends IChainId>({
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
      gas={q(useAddCollateralEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries((isFull) => getAddCollateralHealthOptions({ ...params, isFull }, isOpen)))}
      debt={prevDebt}
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
      collateral={mapQuery(
        prevCollateral,
        (stateCollateral) => userCollateral && decimal(new BigNumber(stateCollateral).plus(userCollateral))!,
      )}
      prices={q(useAddCollateralPrices(params, isOpen))}
      {...useLeverageInfoFields({
        leverageEnabled: false,
        leverageValue: useAddCollateralFutureLeverage(params, isOpen),
        prevLeverageValue: useUserCurrentLeverage(params, isOpen),
        prevCollateral,
        leverageTotalCollateral: prevCollateral,
        collateralDelta: userCollateral,
      })}
      {...prevLoanState}
      {...useBorrowRates({ params, market }, isOpen)}
    />
  )
}
