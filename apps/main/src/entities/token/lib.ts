import { useMemo } from 'react'
import type { Address } from 'viem'
import useTokensMapper from '@main/hooks/useTokensMapper'
import useStore from '@main/store/useStore'
import { useChainId } from '@main/entities/chain'
import { Token } from '@main/types/main.types'

export const useTokens = (addresses: (Address | undefined)[]): { data: (Token | undefined)[] } => {
  const { data: chainId } = useChainId()
  const { tokensMapper } = useTokensMapper(chainId)

  const tokensKey = JSON.stringify(addresses)

  const tokens = useMemo(
    () => addresses.map((address) => (address ? tokensMapper[address] : undefined)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensKey, tokensMapper],
  )

  return { data: tokens }
}

export const useTokensUSDRates = (tokens: (Address | undefined)[]): { data: (number | undefined)[] } => {
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)

  const tokensKey = JSON.stringify(tokens)

  const usdRates = useMemo(
    () => tokens.map((token) => (token ? usdRatesMapper[token] : undefined)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensKey, usdRatesMapper],
  )

  return { data: usdRates }
}
