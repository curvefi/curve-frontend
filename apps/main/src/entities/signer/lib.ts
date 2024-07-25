import { useCurve } from '@/entities/curve'
import useStore from '@/store/useStore'
import { useMemo } from 'react'
import type { Address } from 'viem'

export const useSignerAddress = (): { data: Address | undefined } => {
  const { data: curve } = useCurve()
  const signerAddress = curve?.signerAddress as Address | undefined
  return { data: signerAddress }
}

export const useIsSignerConnected = () => {
  const { data: signerAddress } = useSignerAddress()
  return { data: !!signerAddress }
}

export const useTokensBalances = (tokens: Address[]): { data: (string | undefined)[]; isLoading: boolean } => {
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const userBalancesLoading = useStore((state) => state.userBalances.loading)

  const tokensKey = JSON.stringify(tokens)

  const balances = useMemo(() => {
    if (userBalancesLoading) return tokens.map(() => undefined)
    return tokens.map((token) => userBalancesMapper[token])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensKey, userBalancesMapper, userBalancesLoading])

  return { data: balances, isLoading: userBalancesLoading }
}
