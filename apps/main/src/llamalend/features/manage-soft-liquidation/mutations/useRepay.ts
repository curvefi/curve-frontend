import type { Address } from 'viem'
import { useConfig } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { notify } from '@ui-kit/features/connect-wallet'
import { waitForTransactionReceipt } from '@wagmi/core'

type RepayOptions = {
  market: LlamaMarketTemplate | undefined
}

export function useRepay({ market }: RepayOptions) {
  const symbol = (market && getTokens(market))?.borrowToken?.symbol ?? '?'
  const config = useConfig()

  return useLlammaMutation({
    mutationKey: ['repay', { marketId: market?.id }] as const,
    market,
    mutationFn: async ({ debt }: { debt: string }, { market }) => {
      // TODO: doesn't support leveraged lend markets yet. not sure about mint markets either, that feature is under construction iirc.
      // see const { loanRepay } = apiLending when you get to it
      const hash = (await market.repay(+debt)) as Address
      await waitForTransactionReceipt(config, { hash })
      return { hash }
    },
    pendingMessage: ({ debt }) => `Repaying debt: ${debt} ${symbol}`,
    onSuccess: ({ hash }, { debt }: { debt: string }) => {
      notify(`Repaid debt: ${debt} ${symbol}`, 'success')
      // TODO: invalidate specific queries to update the values in repay tab
    },
    onError: (error: Error) => notify(error.message, 'error'),
  })
}
