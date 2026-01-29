import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useAddCollateralFutureLeverage } from '@/llamalend/queries/add-collateral/add-collateral-future-leverage.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { getAddCollateralHealthOptions } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useUserCurrentLeverage } from '@/llamalend/queries/user-current-leverage.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { CollateralForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanInfoAccordion } from '@/llamalend/widgets/forms/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'

export function AddCollateralInfoAccordion<ChainId extends IChainId>({
  params,
  values: { userCollateral },
  collateralToken,
  borrowToken,
  networks,
  leverageEnabled,
}: {
  params: CollateralParams<ChainId>
  values: CollateralForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  leverageEnabled: boolean
}) {
  const [isOpen, , , toggle] = useSwitch(false)
  const userState = q(useUserState(params, isOpen))

  const expectedCollateral = useMemo(
    () =>
      mapQuery(
        userState,
        (state) =>
          userCollateral &&
          state.collateral && {
            value: decimal(new BigNumber(userCollateral).plus(state.collateral)) as Decimal,
            tokenSymbol: collateralToken?.symbol,
          },
      ),
    [collateralToken?.symbol, userState, userCollateral],
  )

  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      gas={useAddCollateralEstimateGas(networks, params, isOpen)}
      health={useHealthQueries((isFull) => getAddCollateralHealthOptions({ ...params, isFull }))}
      prevHealth={useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }))}
      rates={q(useMarketRates(params, isOpen))}
      prevLoanToValue={useLoanToValueFromUserState(
        {
          chainId: params.chainId,
          marketId: params.marketId,
          userAddress: params.userAddress,
          collateralToken,
          borrowToken,
          expectedBorrowed: userState.data?.debt,
        },
        isOpen,
      )}
      loanToValue={useLoanToValueFromUserState(
        {
          chainId: params.chainId,
          marketId: params.marketId,
          userAddress: params.userAddress,
          collateralToken,
          borrowToken,
          collateralDelta: userCollateral,
          expectedBorrowed: userState.data?.debt,
        },
        isOpen && !!userCollateral,
      )}
      userState={userState}
      collateral={expectedCollateral}
      leverageEnabled={leverageEnabled}
      prevLeverageValue={q(useUserCurrentLeverage(params, isOpen))}
      leverageValue={q(useAddCollateralFutureLeverage(params, isOpen))}
    />
  )
}
