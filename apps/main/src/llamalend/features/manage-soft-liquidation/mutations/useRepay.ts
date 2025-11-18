import type { Hex } from 'viem'
import { useConfig } from 'wagmi'
// We need to invalidate all user loan details for lend when repaying.
// Ideally in the future the user-loan-details query will be split up
// and the lend app uses those split up queries from llamalend app.
// eslint-disable-next-line import/no-restricted-paths
import { invalidateAllUserBorrowDetails } from '@/lend/entities/user-loan-details'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/invalidation'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys, type UserMarketParams } from '@ui-kit/lib/model'
import { waitForTransactionReceipt } from '@wagmi/core'

const getSymbol = (market?: LlamaMarketTemplate) => (market && getTokens(market))?.borrowToken?.symbol ?? '?'

export function useRepay(params: UserMarketParams) {
  const { marketId } = params
  const config = useConfig()

  return useLlammaMutation({
    mutationKey: [...rootKeys.userMarket(params), 'repay'] as const,
    marketId,
    mutationFn: async ({ debt }: { debt: string }, { market }) => {
      // TODO: Doesn't support leveraged lend and mint markets yet.
      // see const { loanRepay } = apiLending when you get to it
      const hash = (await market.repay(+debt)) as Hex
      await waitForTransactionReceipt(config, { hash })

      return { hash }
    },
    pendingMessage: ({ debt }, market) => t`Repaying debt: ${debt} ${getSymbol(market)}`,
    onSuccess: (_, { debt }: { debt: string }, { market }) => {
      notify(t`Repaid debt: ${debt} ${getSymbol(market)}`, 'success')
      invalidateAllUserMarketDetails(params) //TODO: There's no nice and easy way to reset mint market user state yet
      invalidateAllUserBorrowDetails(params)
    },
    onError: (error: Error) => notify(error.message, 'error'),
  })
}
