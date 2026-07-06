import { countBy } from 'lodash'
import type { StoreApi } from 'zustand'
import { updateHaveSameTokenNames } from '@/dex/store/createPoolsSlice'
import type { State } from '@/dex/store/useStore'
import { Token, TokensMapper, TokensNameMapper, PoolData, PoolVolumes, type CurveApi } from '@/dex/types/main.types'
import { log } from '@ui-kit/lib/logging'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  tokensNameMapper: Record<string, TokensNameMapper>
  tokensMapper: Record<string, TokensMapper> // list of all tokens from poolDatas
  loading: boolean
}

const SLICE_KEY = 'tokens'

// prettier-ignore
export type TokensSlice = {
  [SLICE_KEY]: SliceState & {
    setTokensMapper: (curve: CurveApi, poolDatas: PoolData[], poolVolumes: PoolVolumes) => string[]
    setEmptyPoolListDefault: (curve: CurveApi) => void

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => void
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
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
  tokensNameMapper: {},
  tokensMapper: {},
  loading: true,
}

export const createTokensSlice = (
  _set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): TokensSlice => ({
  [SLICE_KEY]: {
    ...DEFAULT_STATE,

    setTokensMapper: (curve, poolDatas, poolVolumes) => {
      const { tokensMapper, ...sliceState } = get()[SLICE_KEY]

      sliceState.setStateByKey('loading', true)

      const chainId = curve.chainId
      const DEFAULT_TOKEN_MAPPER = _getDefaultTokenMapper(curve)
      let cTokensMapper: TokensMapper = { ...(tokensMapper[chainId] ?? DEFAULT_TOKEN_MAPPER) }
      const partialTokensMapper: TokensMapper = {}

      for (const { pool, tokenAddressesAll, tokensAll, tokenDecimalsAll } of poolDatas) {
        const volume = +poolVolumes[pool.id] || 0
        const counted = countBy(tokensAll)

        for (const [idx, address] of tokenAddressesAll.entries()) {
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
          } else {
            log(`Missing token name in pool ${pool.id}`)
          }
        }
      }

      // update have same token name value
      cTokensMapper = updateHaveSameTokenNames(cTokensMapper)

      const parsedPartialTokensMapper: TokensMapper = {}
      for (const key in partialTokensMapper) {
        parsedPartialTokensMapper[key] = cTokensMapper[key]
      }

      const chainIdStr = chainId.toString()
      sliceState.setStateByActiveKey('tokensMapper', chainIdStr, cTokensMapper)
      sliceState.setStateByKey('loading', false)

      return Object.keys(parsedPartialTokensMapper)
    },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await -- Existing violation before enabling this rule.
    setEmptyPoolListDefault: async curve => {
      const { [SLICE_KEY]: sliceState } = get()
      const chainId = curve.chainId
      const nativeToken = curve.getNetworkConstants().NATIVE_TOKEN

      if (!nativeToken) return

      const strChainId = chainId.toString()

      const tokensNameMapper = {
        [nativeToken.address]: nativeToken.symbol,
        [nativeToken.wrappedAddress]: nativeToken.wrappedSymbol,
      }
      sliceState.setStateByActiveKey('tokensNameMapper', strChainId, tokensNameMapper)

      const tokensMapper: Record<string, Token> = {
        [nativeToken.address]: {
          ...DEFAULT_TOKEN,
          address: nativeToken.address,
          symbol: nativeToken.symbol,
        },
        [nativeToken.wrappedAddress]: {
          ...DEFAULT_TOKEN,
          address: nativeToken.wrappedAddress,
          symbol: nativeToken.wrappedSymbol,
        },
      }
      sliceState.setStateByActiveKey('tokensMapper', strChainId, tokensMapper)
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      get().setAppStateByActiveKey(SLICE_KEY, key, activeKey, value)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(SLICE_KEY, key, value)
    },
    setStateByKeys: sliceState => {
      get().setAppStateByKeys(SLICE_KEY, sliceState)
    },
    resetState: () => {
      get().resetAppState(SLICE_KEY, DEFAULT_STATE)
    },
  },
})

export function getTokensMapperStr(tokensMapper: TokensMapper | undefined) {
  return Object.keys(tokensMapper ?? {}).reduce((str, tokenAddress) => {
    str += tokenAddress.charAt(5)
    return str
  }, '')
}

function _getDefaultTokenMapper(curve: CurveApi) {
  const { address, symbol, wrappedAddress, wrappedSymbol } = curve.getNetworkConstants().NATIVE_TOKEN
  return {
    [address]: { ...DEFAULT_TOKEN, symbol, address },
    [wrappedAddress]: { ...DEFAULT_TOKEN, symbol: wrappedSymbol, address: wrappedAddress },
  }
}
