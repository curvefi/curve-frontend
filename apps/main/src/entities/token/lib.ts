import useTokensMapper from '@/hooks/useTokensMapper'
import useStore from '@/store/useStore'
import { useMemo } from 'react'
import type { Address } from 'viem'
import { useChainId } from '@/entities/chain'
import { useLiquidityMapping, useVolumeMapping } from '@/entities/pool/lib/pool-info'
import networks from '@/networks'
import countBy from 'lodash/countBy'
import { log } from '@/utils'
import { addHaveSameTokenNames } from '@/store/createPoolsSlice'
import { useCurve } from '@/entities/curve'
import { BD } from '@/shared/curve-lib'

const DEFAULT_TOKEN: Token = {
  address: '',
  symbol: '',
  decimals: 0,
  haveSameTokenName: false,
  volume: 0,
}

export const useTokens = (addresses: (Address | undefined)[]): { data: (Token | undefined)[] } => {
  const { data: chainId } = useChainId()
  const { tokensMapper } = useTokensMapper(chainId)

  const tokensKey = JSON.stringify(addresses)

  const tokens = useMemo(
    () => addresses.map((address) => (address ? tokensMapper[address] : undefined)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensKey, tokensMapper]
  )

  return { data: tokens }
}

export const useTokensUSDRates = (tokens: (Address | undefined)[]): { data: (number | undefined)[] } => {
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)

  const tokensKey = JSON.stringify(tokens)

  const usdRates = useMemo(
    () => tokens.map((token) => (token ? usdRatesMapper[token] : undefined)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensKey, usdRatesMapper]
  )

  return { data: usdRates }
}

export const useTokenMapping = (chainId: ChainId, pools?: PoolData[]) => {
  const volumeMapping = useVolumeMapping(chainId, pools)
  const { fetchUserBalancesByTokens } = useStore((state) => state.userBalances)
  const { data: curve } = useCurve()

  const cTokensMapper: TokensMapper = _getDefaultTokenMapper(chainId)

  for (const { pool, tokenAddressesAll, tokensAll, tokenDecimalsAll } of (pools ?? [])) {
    const volume = +(volumeMapping[pool.id]?.value ?? '0')
    const counted = countBy(tokensAll)

    for (const idx in tokenAddressesAll) {
      const address = tokenAddressesAll[idx]
      const tokenMappedVolume = cTokensMapper[address]?.volume ?? 0
      const token = tokensAll[idx] // ignore token name with empty string
      if (!token) {
        log(`Missing token name in pool ${pool.id}`)
        continue
      }
      counted[token] -= 1
      cTokensMapper[address] = {
        ...(cTokensMapper[address] ?? DEFAULT_TOKEN),
        address,
        symbol: token,
        decimals: tokenDecimalsAll[idx],
        haveSameTokenName: false,
        volume: counted[token] === 0 ? tokenMappedVolume + volume : tokenMappedVolume,
        poolIds: [...cTokensMapper[address]?.poolIds ?? [], pool.id],
      }
    }
  }

  // update have same token name value
  const updatedTokenMapping = addHaveSameTokenNames(cTokensMapper)
  if (curve?.signerAddress) {
    fetchUserBalancesByTokens(curve, Object.keys(updatedTokenMapping))
  }
  return updatedTokenMapping
}

export const useHighLiquidityTokens = (chainId: ChainId, pools?: PoolData[]) => {
  const chainTvl = BD.from(networks[chainId].hideSmallPoolsTvl)
  const tokenMapping = useTokenMapping(chainId, pools)
  const liquidityMapping = useLiquidityMapping(chainId, pools)

  // if pool list is <= 10
  if (pools && pools.length <= 10) {
    return tokenMapping
  }
  // if pool's tvl >= chain's tvl (etc. 10000) add to list
  return pools && Object.fromEntries(Object.entries(tokenMapping).filter(
    ([_, token]) => token?.poolIds?.find((poolId) => BD.from(liquidityMapping[poolId]?.value || '0').gte(chainTvl))
  ))
}

export function _getDefaultTokenMapper(chainId: ChainId) {
  const { address, symbol, wrappedAddress, wrappedSymbol } = networks[chainId].nativeTokens
  return {
    [address]: { ...DEFAULT_TOKEN, symbol: symbol, address: address },
    [wrappedAddress]: { ...DEFAULT_TOKEN, symbol: wrappedSymbol, address: wrappedAddress },
  }
}
