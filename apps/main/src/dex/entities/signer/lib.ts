import { useMemo } from 'react'
import type { Address } from 'viem'
import useStore from '@/dex/store/useStore'
import { useWallet } from '@ui-kit/features/connect-wallet'

export const useSignerAddress = (): { data: Address | undefined } => {
  const { wallet } = useWallet.getState()
  const signerAddress = wallet?.accounts?.[0]?.address
  return { data: signerAddress }
}

export const useIsSignerConnected = () => {
  const { data: signerAddress } = useSignerAddress()
  return { data: !!signerAddress }
}

export const useTokensBalances = (
  tokens: (Address | undefined)[],
): { data: (string | undefined)[]; isLoading: boolean } => {
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const userBalancesLoading = useStore((state) => state.userBalances.loading)

  const tokensKey = JSON.stringify(tokens)

  const balances = useMemo(() => {
    if (userBalancesLoading) return tokens.map(() => undefined)
    return tokens.map((token) => (token ? userBalancesMapper[token] : undefined))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensKey, userBalancesMapper, userBalancesLoading])

  return { data: balances, isLoading: userBalancesLoading }
}
