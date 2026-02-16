import BigNumber from 'bignumber.js'
import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useRemoveCollateralFutureLeverage } from '@/llamalend/queries/remove-collateral/remove-collateral-future-leverage.query'
import { useRemoveCollateralEstimateGas } from '@/llamalend/queries/remove-collateral/remove-collateral-gas-estimate.query'
import { getRemoveCollateralHealthOptions } from '@/llamalend/queries/remove-collateral/remove-collateral-health.query'
import { useUserCurrentLeverage } from '@/llamalend/queries/user-current-leverage.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { CollateralForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'

export function RemoveCollateralInfoList<ChainId extends IChainId>({
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
  const isOpen = !!userCollateral
  const userState = q(useUserState(params, isOpen))

  const expectedCollateral = mapQuery(
    userState,
    (state) =>
      state.collateral &&
      userCollateral && {
        value: decimal(
          // An error will be thrown by the validation suite, the "max" is just for preventing negative collateral in the UI
          BigNumber.max(0, new BigNumber(state.collateral).minus(new BigNumber(userCollateral))),
        ) as Decimal,
        tokenSymbol: collateralToken?.symbol,
      },
  )

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      gas={useRemoveCollateralEstimateGas(networks, params, isOpen)}
      health={useHealthQueries((isFull) => getRemoveCollateralHealthOptions({ ...params, isFull }), isOpen)}
      prevHealth={useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }), isOpen)}
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
          collateralDelta: userCollateral && (`-${userCollateral}` as Decimal),
          expectedBorrowed: userState.data?.debt,
        },
        isOpen && !!userCollateral,
      )}
      userState={userState}
      collateral={expectedCollateral}
      leverageEnabled={leverageEnabled}
      prevLeverageValue={q(useUserCurrentLeverage(params, isOpen))}
      leverageValue={q(useRemoveCollateralFutureLeverage(params, isOpen))}
    />
  )
}
