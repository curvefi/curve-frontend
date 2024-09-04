import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import countBy from 'lodash/countBy'

import { log } from '@/utils'
import { updateHaveSameTokenNames } from '@/store/createPoolsSlice'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  tokensImage: { [tokenAddress: string]: string | null }
  tokensNameMapper: { [chainId: string]: TokensNameMapper }
  tokensMapper: { [chainId: string]: TokensMapper } // list of all tokens from poolDatas
  tokensMapperNonSmallTvl: { [chainId: string]: TokensMapper }
  loading: boolean
}

const sliceKey = 'tokens'

// prettier-ignore
export type TokensSlice = {
  [sliceKey]: SliceState & {
    setTokenImage: (tokenAddress: string, src: string | null) => void
    setTokensMapper(chainId: ChainId, poolDatas: PoolData[]): Promise<string[]>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_TOKEN: Token = {
  address: '',
  symbol: '',
  decimals: 0,
  haveSameTokenName: false,
  volume: 0,
}

const DEFAULT_STATE: SliceState = {
  tokensImage: {},
  tokensNameMapper: {},
  tokensMapper: {},
  tokensMapperNonSmallTvl: {},
  loading: true,
}

const createTokensSlice = (set: SetState<State>, get: GetState<State>): TokensSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    setTokenImage: (tokenAddress, src) => {
      get()[sliceKey].setStateByActiveKey('tokensImage', tokenAddress, src)
    },
    setTokensMapper: async (chainId, poolDatas) => {
      const { pools } = get()
      const { tokensMapper, tokensMapperNonSmallTvl, ...sliceState } = get()[sliceKey]

      sliceState.setStateByKey('loading', true)

      const { hideSmallPoolsTvl: chainTvl, nativeTokens } = networks[chainId]
      const tvlMapper = pools.tvlMapper[chainId] ?? {}
      const volumeMapper = pools.volumeMapper[chainId] ?? {}
      const DEFAULT_TOKEN_MAPPER = _getDefaultTokenMapper(chainId)
      let cTokensMapper: TokensMapper = { ...(tokensMapper[chainId] ?? DEFAULT_TOKEN_MAPPER) }
      let cTokensMapperNonSmallTvl: TokensMapper = { ...(tokensMapperNonSmallTvl[chainId] ?? DEFAULT_TOKEN_MAPPER) }
      let partialTokensMapper: TokensMapper = {}

      for (const { pool, tokenAddressesAll, tokensAll, tokenDecimalsAll } of poolDatas) {
        const tvl = +(tvlMapper[pool.id]?.value ?? '0')
        const volume = +(volumeMapper[pool.id]?.value ?? '0')
        let counted = countBy(tokensAll)

        for (const idx in tokenAddressesAll) {
          const address = tokenAddressesAll[idx]
          const tokenMappedVolume = cTokensMapper[address]?.volume ?? 0
          const token = tokensAll[idx] // ignore token name with empty string

          if (token) {
            counted[token] = counted[token] - 1
            const tokenVolume = counted[token] === 0 ? tokenMappedVolume + volume : tokenMappedVolume

            const obj: Token = {
              ...(cTokensMapper[address] ?? DEFAULT_TOKEN),
              address,
              symbol: token,
              decimals: tokenDecimalsAll[idx],
              haveSameTokenName: false,
              volume: tokenVolume,
            }

            cTokensMapper[address] = obj
            partialTokensMapper[address] = obj

            // if pool list is <= 10 or if pool's tvl >= chain's tvl (etc. 10000) add to list
            if (poolDatas.length <= 10 || tvl >= chainTvl) {
              cTokensMapperNonSmallTvl[address] = obj
            }
          } else {
            log(`Missing token name in pool ${pool.id}`)
          }
        }
      }

      // update have same token name value
      cTokensMapper = updateHaveSameTokenNames(cTokensMapper)
      const parsedTokensMapperNonSmallTvl: TokensMapper = {}
      for (const key in cTokensMapperNonSmallTvl) {
        parsedTokensMapperNonSmallTvl[key] = cTokensMapper[key]
      }

      const parsedPartialTokensMapper: TokensMapper = {}
      for (const key in partialTokensMapper) {
        parsedPartialTokensMapper[key] = cTokensMapper[key]
      }

      const chainIdStr = chainId.toString()
      sliceState.setStateByActiveKey('tokensMapper', chainIdStr, cTokensMapper)
      sliceState.setStateByActiveKey('tokensMapperNonSmallTvl', chainIdStr, parsedTokensMapperNonSmallTvl)
      sliceState.setStateByKey('loading', false)

      return Object.keys(parsedPartialTokensMapper)
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export function getTokensMapperStr(tokensMapper: TokensMapper | undefined) {
  return Object.keys(tokensMapper ?? {}).reduce((str, tokenAddress) => {
    str += tokenAddress.charAt(5)
    return str
  }, '')
}

export function _getDefaultTokenMapper(chainId: ChainId) {
  const { address, symbol, wrappedAddress, wrappedSymbol } = networks[chainId].nativeTokens
  return {
    [address]: { ...DEFAULT_TOKEN, symbol: symbol, address: address },
    [wrappedAddress]: { ...DEFAULT_TOKEN, symbol: wrappedSymbol, address: wrappedAddress },
  }
}

export default createTokensSlice
