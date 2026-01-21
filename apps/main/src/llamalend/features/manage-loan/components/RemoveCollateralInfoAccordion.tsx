import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { Token } from '@/llamalend/features/borrow/types'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useRemoveCollateralEstimateGas } from '@/llamalend/queries/remove-collateral/remove-collateral-gas-estimate.query'
import { getRemoveCollateralHealthOptions } from '@/llamalend/queries/remove-collateral/remove-collateral-health.query'
import { getUserHealthOptions } from '@/llamalend/queries/user-health.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { CollateralForm } from '@/llamalend/queries/validation/manage-loan.validation'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'

export function RemoveCollateralInfoAccordion<ChainId extends IChainId>({
  params,
  values: { userCollateral },
  collateralToken,
  borrowToken,
  networks,
}: {
  params: CollateralParams<ChainId>
  values: CollateralForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
}) {
  const [isOpen, , , toggle] = useSwitch(false)
  const userState = q(useUserState(params, isOpen))
  const expectedCollateral = useMemo(
    () =>
      // An error will be thrown by the validation suite, the "max" is just for preventing negative collateral in the UI
      mapQuery(
        userState,
        (state) =>
          state.collateral &&
          userCollateral && {
            value: decimal(
              BigNumber.max(0, new BigNumber(state.collateral).minus(new BigNumber(userCollateral))),
            ) as Decimal,
            tokenSymbol: collateralToken?.symbol,
          },
      ),
    [collateralToken?.symbol, userState, userCollateral],
  )

  return (
    <LoanInfoAccordion
      isOpen={isOpen}
      toggle={toggle}
      gas={useRemoveCollateralEstimateGas(networks, params, isOpen)}
      health={useHealthQueries((isFull) => getRemoveCollateralHealthOptions({ ...params, isFull }))}
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
          collateralDelta: userCollateral && (`-${userCollateral}` as Decimal),
          expectedBorrowed: userState.data?.debt,
        },
        isOpen && !!userCollateral,
      )}
      userState={userState}
      collateral={expectedCollateral}
    />
  )
}
