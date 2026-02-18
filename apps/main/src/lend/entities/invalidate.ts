import { invalidateMarketDetails } from '@/lend/entities/market-details'
import { type State, useStore } from '@/lend/store/useStore'
import { Api } from '@/lend/types/lend.types'
import { refetchLoanExists } from '@/llamalend/queries/user'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
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
  await Promise.all([
    loanExists && user.fetchAll(api, market, true),
    loanExists &&
      invalidateAllUserMarketDetails({ chainId: api.chainId, marketId: market.id, userAddress: api.signerAddress }),
    invalidateMarketDetails({ chainId: api.chainId, marketId: market.id }),
    markets.fetchAll(api, market, true),
  ])
  return { loanExists }
}
