import { invalidateMarketDetails } from '@/lend/entities/market-details'
import { type State, useStore } from '@/lend/store/useStore'
import { Api, ChainId } from '@/lend/types/lend.types'
import { refetchLoanExists } from '@/llamalend/queries/loan-exists'
import {
  invalidateUserBands,
  invalidateUserCurrentLeverage,
  invalidateUserHealth,
  invalidateUserLoss,
  invalidateUserMarketBalances,
  invalidateUserPrices,
  invalidateUserState,
} from '@/llamalend/queries/user'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { UserMarketParams } from '@ui-kit/lib/model/query/root-keys'

type UserLoanDetailsParams = UserMarketParams<ChainId>

export const invalidateAllUserBorrowDetails = (params: UserLoanDetailsParams) =>
  Promise.all([
    invalidateUserMarketBalances(params),
    invalidateUserPrices(params),
    invalidateUserState(params),
    invalidateUserBands(params),
    invalidateUserLoss(params),
    invalidateUserCurrentLeverage(params),
    invalidateUserHealth({ ...params, isFull: true }),
    invalidateUserHealth({ ...params, isFull: false }),
  ])

export const refetchUserMarket = async ({
  market,
  api,
  state: { user, markets } = useStore.getState(),
}: {
  api: Api
  market: LendMarketTemplate
  state?: Pick<State, 'user' | 'markets'>
}) => {
  const loanExists = await refetchLoanExists({
    chainId: api.chainId,
    marketId: market.id,
    userAddress: api.signerAddress,
  })
  void Promise.all([
    loanExists && user.fetchAll(api, market, true),
    loanExists &&
      invalidateAllUserBorrowDetails({ chainId: api.chainId, marketId: market.id, userAddress: api.signerAddress }),
    invalidateMarketDetails({ chainId: api.chainId, marketId: market.id }),
    markets.fetchAll(api, market, true),
  ])
  return { loanExists }
}
