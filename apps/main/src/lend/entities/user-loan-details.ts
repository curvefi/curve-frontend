import { invalidateMarketDetails } from '@/lend/entities/market-details'
import { type State, useStore } from '@/lend/store/useStore'
import { Api } from '@/lend/types/lend.types'
import { refetchLoanExists } from '@/llamalend/queries/loan-exists'
import { invalidateBorrowPositionQueries } from '@/llamalend/queries/validation/invalidation'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'

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
      invalidateBorrowPositionQueries({ chainId: api.chainId, marketId: market.id, userAddress: api.signerAddress }),
    invalidateMarketDetails({ chainId: api.chainId, marketId: market.id }),
    markets.fetchAll(api, market, true),
  ])
  return { loanExists }
}
