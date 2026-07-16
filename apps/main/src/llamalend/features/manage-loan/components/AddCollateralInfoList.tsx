import { BigNumber } from 'bignumber.js'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useAddCollateralFutureLeverage } from '@/llamalend/queries/add-collateral/add-collateral-future-leverage.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { getAddCollateralHealthOptions } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserCurrentLeverage } from '@/llamalend/queries/user'
import { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { CollateralForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { useBorrowRates } from '@/llamalend/widgets/action-card/hooks/useBorrowRates'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/hooks/usePrevLoanState'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Token } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui-kit/features/forms'
import type { MarketType } from '@ui-kit/types/market'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { getLeverageInfoFields } from '../../../widgets/action-card/hooks/getLeverageInfoFields'

export function AddCollateralInfoList<ChainId extends IChainId>({
  params,
  values: { userCollateral },
  collateralToken,
  borrowToken,
  networks,
  form,
  controllerAddress,
  marketType,
}: {
  params: CollateralParams<ChainId>
  values: CollateralForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  form: UseFormReturn<CollateralForm>
  controllerAddress: Address | undefined
  marketType: MarketType
}) {
  const isOpen = form.isTouched('userCollateral')
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken }, isOpen)
  const { prevCollateral, prevDebt } = prevLoanState
  return (
    <LoanActionInfoList
      isOpen={isOpen}
      gas={q(useAddCollateralEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries(isFull => getAddCollateralHealthOptions({ ...params, isFull }, isOpen)))}
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
        stateCollateral => userCollateral && decimal(new BigNumber(stateCollateral).plus(userCollateral))!,
      )}
      prices={q(useAddCollateralPrices(params, isOpen))}
      oraclePrice={q(useMarketOraclePrice(params, isOpen))}
      {...getLeverageInfoFields({
        leverageEnabled: false,
        leverageValue: useAddCollateralFutureLeverage(params, isOpen),
        prevLeverageValue: useUserCurrentLeverage(params, isOpen),
        prevCollateral,
        leverageTotalCollateral: prevCollateral,
        collateralDelta: userCollateral,
      })}
      {...prevLoanState}
      {...useBorrowRates({ params, marketType, controllerAddress }, isOpen)}
    />
  )
}
