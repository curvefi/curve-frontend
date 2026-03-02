import BigNumber from 'bignumber.js'
import type { UseFormReturn } from 'react-hook-form'
import { useNetBorrowApr } from '@/llamalend/features/borrow/hooks/useNetBorrowApr'
import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useAddCollateralFutureLeverage } from '@/llamalend/queries/add-collateral/add-collateral-future-leverage.query'
import { useAddCollateralEstimateGas } from '@/llamalend/queries/add-collateral/add-collateral-gas-estimate.query'
import { getAddCollateralHealthOptions } from '@/llamalend/queries/add-collateral/add-collateral-health.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import { useMarketRates } from '@/llamalend/queries/market'
import { getUserHealthOptions, useUserCurrentLeverage, useUserState } from '@/llamalend/queries/user'
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
  market,
  params,
  values: { userCollateral },
  collateralToken,
  borrowToken,
  networks,
  leverageEnabled,
  form,
}: {
  market: LlamaMarketTemplate | undefined
  params: CollateralParams<ChainId>
  values: CollateralForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  networks: NetworkDict<ChainId>
  leverageEnabled: boolean
  form: UseFormReturn<CollateralForm>
}) {
  const isOpen = isFormTouched(form, 'userCollateral')
  const userState = useUserState(params, isOpen)

  const expectedCollateral = mapQuery(
    userState,
    (state) =>
      userCollateral &&
      state.collateral && {
        value: decimal(new BigNumber(userCollateral).plus(state.collateral)) as Decimal,
        tokenSymbol: collateralToken?.symbol,
      },
  )

  const { marketRates, netBorrowApr } = useNetBorrowApr(
    {
      market,
      params,
      marketRates: q(useMarketRates(params, isOpen)),
    },
    isOpen,
  )

  return (
    <LoanActionInfoList
      isOpen={isOpen}
      gas={q(useAddCollateralEstimateGas(networks, params, isOpen))}
      health={q(useHealthQueries((isFull) => getAddCollateralHealthOptions({ ...params, isFull }, isOpen)))}
      prevHealth={q(useHealthQueries((isFull) => getUserHealthOptions({ ...params, isFull }, isOpen)))}
      prevRates={marketRates}
      prevNetBorrowApr={netBorrowApr && q(netBorrowApr)}
      prevLoanToValue={q(
        useLoanToValueFromUserState(
          {
            chainId: params.chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            expectedBorrowed: userState.data?.debt,
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
            expectedBorrowed: userState.data?.debt,
          },
          isOpen && !!userCollateral,
        ),
      )}
      userState={q(userState)}
      collateral={expectedCollateral}
      leverageEnabled={leverageEnabled}
      prevLeverageValue={q(useUserCurrentLeverage(params, isOpen))}
      leverageValue={q(useAddCollateralFutureLeverage(params, isOpen))}
      exchangeRate={q(useMarketOraclePrice(params, isOpen))}
      collateralSymbol={collateralToken?.symbol}
      borrowSymbol={borrowToken?.symbol}
    />
  )
}
