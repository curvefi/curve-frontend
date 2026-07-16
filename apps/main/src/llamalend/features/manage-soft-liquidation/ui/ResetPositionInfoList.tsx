import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useResetEstimateGas } from '@/llamalend/queries/reset/reset-gas-estimate.query'
import { getResetHealthOptions } from '@/llamalend/queries/reset/reset-health.query'
import { useResetIsApproved } from '@/llamalend/queries/reset/reset-is-approved.query'
import { useResetPrices } from '@/llamalend/queries/reset/reset-prices.query'
import { getResetDebtReduction } from '@/llamalend/queries/reset/reset-query.helpers'
import type { ResetForm, ResetParams } from '@/llamalend/queries/validation/reset.validation'
import { useBorrowRates } from '@/llamalend/widgets/action-card/hooks/useBorrowRates'
import { usePrevLoanState } from '@/llamalend/widgets/action-card/hooks/usePrevLoanState'
import { LoanActionInfoList } from '@/llamalend/widgets/action-card/LoanActionInfoList'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address, Token } from '@primitives/address.utils'
import { maybes } from '@primitives/objects.utils'
import type { MarketType } from '@ui-kit/types/market'
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalMax, decimalMinus } from '@ui-kit/utils'

export function ResetPositionInfoList<ChainId extends IChainId>({
  params,
  values,
  tokens: { collateralToken, borrowToken },
  controllerAddress,
  marketType,
  networks,
}: {
  params: ResetParams<ChainId>
  values: ResetForm
  tokens: { collateralToken: Token | undefined; borrowToken: Token | undefined }
  controllerAddress: Address | undefined
  marketType: MarketType
  networks: NetworkDict<ChainId>
}) {
  const debtReduction = getResetDebtReduction(values)
  const isOpen = +debtReduction > 0
  const prevLoanState = usePrevLoanState({ params, collateralToken, borrowToken }, isOpen)
  const { prevDebt, prevCollateral } = prevLoanState
  const debt = mapQuery(prevDebt, prev => prev && decimalMax('0', decimalMinus(prev, debtReduction)))

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      isApproved={q(useResetIsApproved(params, isOpen))}
      gas={q(useResetEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries(isHealthFull => getResetHealthOptions({ ...params, isHealthFull }, isOpen)))}
      prices={q(useResetPrices(params, isOpen))}
      oraclePrice={q(useMarketOraclePrice(params, isOpen))}
      loanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            expectedBorrowed: debt.data,
          },
          isOpen,
        ),
      )}
      debt={debt}
      collateral={prevCollateral}
      {...useBorrowRates(
        { params, marketType, controllerAddress, debtDelta: maybes([debt.data, prevDebt.data], decimalMinus) },
        isOpen,
      )}
      {...prevLoanState}
    />
  )
}
