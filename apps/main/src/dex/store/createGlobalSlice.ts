import { produce } from 'immer'
import lodash from 'lodash'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import { curvejsApi } from '@/dex/lib/curvejs'
import { scheduleSwapRequest } from '@/dex/lib/swapRequestScheduler'
import { getSwapSuggestedTokenAddresses, getSwapSuggestedTokenSymbols } from '@/dex/lib/swapTokenSuggestions'
import type { State } from '@/dex/store/useStore'
import {
  ChainId,
  CurveApi,
  NetworkConfig,
  NetworkConfigFromApi,
  type PoolData,
  Token,
  TokensMapper,
  TokensNameMapper,
  Wallet,
} from '@/dex/types/main.types'
import { log } from '@ui-kit/lib/logging'
import { fetchNetworks } from '../entities/networks'

export type SliceKey = keyof State | ''
export type StateKey = string
const { isEqual } = lodash

type GlobalState = {
  hasDepositAndStake: { [chainId: string]: boolean | null }
  hasRouter: { [chainId: string]: boolean | null }
}

export interface GlobalSlice extends GlobalState {
  getNetworkConfigFromApi(chainId: ChainId | ''): NetworkConfigFromApi
  setNetworkConfigFromApi(curve: CurveApi): void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate(
    config: Config,
    curveApi: CurveApi | undefined,
    prevCurveApi: CurveApi | undefined,
    wallet: Wallet | undefined,
  ): Promise<void>

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean): void
}

const DEFAULT_STATE = {
  hasDepositAndStake: {},
  hasRouter: {},
} satisfies GlobalState

export const createGlobalSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): GlobalSlice => ({
  ...DEFAULT_STATE,

  getNetworkConfigFromApi: (chainId: ChainId | '') => {
    const resp: NetworkConfigFromApi = {
      hasDepositAndStake: undefined,
      hasRouter: undefined,
    }
    if (chainId) {
      resp.hasDepositAndStake = get().hasDepositAndStake[chainId] ?? get().storeCache.hasDepositAndStake[chainId]
      resp.hasRouter = get().hasRouter[chainId] ?? get().storeCache.hasRouter[chainId]
    }
    return resp
  },
  setNetworkConfigFromApi: (curve: CurveApi) => {
    const { chainId } = curve
    const { hasDepositAndStake, hasRouter } = curvejsApi.network.fetchNetworkConfig(curve)
    set(
      produce((state: State) => {
        state.hasDepositAndStake[chainId] = hasDepositAndStake
        state.storeCache.hasDepositAndStake[chainId] = hasDepositAndStake
        state.hasRouter[chainId] = hasRouter
        state.storeCache.hasRouter[chainId] = hasRouter
      }),
    )
  },
  hydrate: async (_config, curveApi, prevCurveApi) => {
    if (!curveApi) return

    const state = get()
    const isNetworkSwitched = prevCurveApi?.chainId !== curveApi.chainId
    const isUserSwitched = prevCurveApi?.signerAddress !== curveApi.signerAddress
    const { chainId } = curveApi
    log('Hydrating DEX', curveApi?.chainId, {
      isNetworkSwitched,
      isUserSwitched,
      hasRPC: !curveApi.isNoRPC,
    })

    // reset store
    if (isNetworkSwitched) {
      state.pools.resetState()
      state.quickSwap.resetState()
      state.tokens.resetState()
      state.createPool.resetState()
      state.dashboard.resetState()
    }

    // update network settings from api
    state.setNetworkConfigFromApi(curveApi)

    const networks = await fetchNetworks()
    const network = networks[chainId]
    const isSwapRouteHydration =
      typeof window !== 'undefined' && /^\/dex\/[^/]+\/swap\/?$/.test(window.location.pathname)

    if (isSwapRouteHydration) {
      seedSwapTokenMapper(get(), curveApi, network)
      if (!hasPoolsForChain(state, chainId)) {
        state.pools.setEmptyPoolListDefault(chainId)
      }
      void hydrateSwapRouteInBackground(get, curveApi, chainId, network, {
        forceReloadCurveData: isNetworkSwitched || isUserSwitched,
      })
      log('Hydrating DEX - Swap path seeded with minimal token set')
      return
    }

    // get poolList
    const poolIds = await curvejsApi.network.fetchAllPoolsList(curveApi, network)

    // if no pools found for network, set tvl, volume and pools state to empty object
    if (!poolIds.length) {
      state.pools.setEmptyPoolListDefault(chainId)
      state.tokens.setEmptyPoolListDefault(curveApi)
      return
    }

    // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.finance/api/getFactoryAPYs-kava)
    const failedFetching24hOldVprice: { [poolAddress: string]: boolean } =
      chainId === 2222 ? await curvejsApi.network.getFailedFetching24hOldVprice() : {}

    await state.pools.fetchPools(curveApi, poolIds, failedFetching24hOldVprice)

    log('Hydrating DEX - Complete')
  },
  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValues = state[sliceKey][key]
        const storedActiveKeyValues = storedValues[activeKey] // todo: this means the following branch is unreachable?
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValue = state[sliceKey][key]
        if (!isEqual(storedValue, value)) {
          if (showLog) {
            log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
          }
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T, showLog?: boolean) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce((state) => {
          const storedValue = state[sliceKey][key]
          if (!isEqual(storedValue, value)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
            }
            state[sliceKey][key] = value
          }
        }),
      )
    }
  },
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T) => {
    set(
      produce((state) => {
        state[sliceKey] = {
          ...state[sliceKey],
          ...defaultState,
        }
      }),
    )
  },
})

const DEFAULT_TOKEN: Token = {
  address: '',
  symbol: '',
  decimals: 0,
  haveSameTokenName: false,
  volume: 0,
}

const ADDRESS_FALLBACK_PREFIX = 6
const ADDRESS_FALLBACK_SUFFIX = 4
const swapBackgroundHydrationInFlight = new Set<string>()
const swapVolumeHydrationInFlight = new Set<string>()
const SWAP_VOLUME_HYDRATION_DELAY_MS = 1200

function seedSwapTokenMapper(state: State, curveApi: CurveApi, network: NetworkConfig) {
  const curveApiWithConstants = curveApi as CurveApi & {
    constants?: {
      COINS?: Record<string, string>
      DECIMALS?: Record<string, number>
    }
  }
  const { chainId } = curveApi
  const chainIdStr = chainId.toString()
  const nativeToken = curveApi.getNetworkConstants().NATIVE_TOKEN

  const cachedRouterValues = state.storeCache.routerFormValues[chainId] ?? {}
  const predefinedSuggestionSymbolByAddress = getSwapSuggestedTokenSymbols(chainId)
  const suggestionSymbolByAddress = Object.fromEntries(
    (network.createQuickList ?? []).map(({ address, symbol }) => [address.toLowerCase(), symbol]),
  )
  const symbolByAddress = Object.entries(curveApiWithConstants.constants?.COINS ?? {}).reduce(
    (acc, [symbol, address]) => {
      if (address) acc[String(address).toLowerCase()] = symbol
      return acc
    },
    {} as Record<string, string>,
  )

  const existingTokensMapper = state.tokens.tokensMapper[chainId] ?? {}
  const existingTokensNameMapper = state.tokens.tokensNameMapper[chainId] ?? {}

  const addresses = getSwapSuggestedTokenAddresses({
    chainId,
    network,
    nativeToken,
    cachedFromAddress: cachedRouterValues.fromAddress,
    cachedToAddress: cachedRouterValues.toAddress,
  })

  const nextTokensMapper: TokensMapper = { ...existingTokensMapper }
  const nextTokensNameMapper: TokensNameMapper = { ...existingTokensNameMapper }

  for (const address of new Set(addresses)) {
    const addressKey = address.toLowerCase()
    const existingSymbol = nextTokensNameMapper[addressKey] || nextTokensMapper[addressKey]?.symbol
    const isFallbackAddressLabel = !!existingSymbol && existingSymbol.startsWith('0x') && existingSymbol.includes('...')
    const suggestedSymbol =
      suggestionSymbolByAddress[addressKey] ||
      predefinedSuggestionSymbolByAddress[addressKey] ||
      symbolByAddress[addressKey]
    const tokenSymbol =
      (isFallbackAddressLabel ? '' : existingSymbol) ||
      (addressKey === nativeToken.address.toLowerCase() ? nativeToken.symbol : '') ||
      (addressKey === nativeToken.wrappedAddress.toLowerCase() ? nativeToken.wrappedSymbol : '') ||
      suggestedSymbol ||
      existingSymbol ||
      `${addressKey.slice(0, ADDRESS_FALLBACK_PREFIX)}...${addressKey.slice(-ADDRESS_FALLBACK_SUFFIX)}`

    const tokenDecimals =
      nextTokensMapper[addressKey]?.decimals ?? (curveApiWithConstants.constants?.DECIMALS?.[addressKey] || 18)

    nextTokensMapper[addressKey] = {
      ...(nextTokensMapper[addressKey] ?? DEFAULT_TOKEN),
      address: addressKey,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      haveSameTokenName: false,
      volume: nextTokensMapper[addressKey]?.volume ?? 0,
    }
    nextTokensNameMapper[addressKey] = tokenSymbol
  }

  state.tokens.setStateByActiveKey('tokensMapper', chainIdStr, nextTokensMapper)
  state.tokens.setStateByActiveKey('tokensNameMapper', chainIdStr, nextTokensNameMapper)
}

async function hydrateSwapRouteInBackground(
  get: StoreApi<State>['getState'],
  curveApi: CurveApi,
  chainId: number,
  network: NetworkConfig,
  options?: { forceReloadCurveData?: boolean },
) {
  const state = get()
  const hydrationKey = getSwapHydrationKey(curveApi, chainId)
  const shouldForceReloadCurveData = options?.forceReloadCurveData ?? false
  const hasPoolsInStore = hasPoolsForChain(state, chainId)
  if (
    (!shouldForceReloadCurveData && state.pools.haveAllPools[chainId] && hasPoolsInStore) ||
    state.pools.poolsLoading[chainId] ||
    swapBackgroundHydrationInFlight.has(hydrationKey)
  ) {
    return
  }

  swapBackgroundHydrationInFlight.add(hydrationKey)
  try {
    const poolIds = await scheduleSwapRequest('low', () => curvejsApi.network.fetchAllPoolsList(curveApi, network))
    if (!poolIds.length) {
      state.tokens.setEmptyPoolListDefault(curveApi)
      return
    }

    const poolsResponse = await scheduleSwapRequest('low', () =>
      state.pools.fetchPools(curveApi, poolIds, null, {
        includeBlacklist: false,
        includeGaugeData: false,
        includeMetrics: false,
      }),
    )

    if (network.isLite || !poolsResponse?.poolDatas.length) {
      log('Hydrating DEX - Swap path light pool hydration complete', chainId, { pools: poolIds.length })
      return
    }

    scheduleIdleTask(() => {
      void scheduleSwapRequest('low', () =>
        hydrateSwapVolumeRankingInBackground(get, curveApi, chainId, poolsResponse.poolDatas),
      )
    }, SWAP_VOLUME_HYDRATION_DELAY_MS)
    log('Hydrating DEX - Swap path light pool hydration complete', chainId, { pools: poolIds.length })
  } catch (error) {
    console.warn('Swap background hydration failed', chainId, error)
  } finally {
    swapBackgroundHydrationInFlight.delete(hydrationKey)
  }
}

async function hydrateSwapVolumeRankingInBackground(
  get: StoreApi<State>['getState'],
  curveApi: CurveApi,
  chainId: number,
  poolDatas: PoolData[],
) {
  const state = get()
  const volumeHydrationKey = chainId.toString()
  if (state.pools.poolsLoading[chainId]) return
  if (Object.keys(state.pools.volumeMapper[chainId] ?? {}).length > 0) return
  if (swapVolumeHydrationInFlight.has(volumeHydrationKey)) return

  swapVolumeHydrationInFlight.add(volumeHydrationKey)
  try {
    await state.pools.fetchPoolsVolume(chainId, poolDatas)
    await state.tokens.setTokensMapper(curveApi, poolDatas)
    log('Hydrating DEX - Swap volume hydration complete', chainId, { pools: poolDatas.length })
  } catch (error) {
    console.warn('Swap volume hydration failed', chainId, error)
  } finally {
    swapVolumeHydrationInFlight.delete(volumeHydrationKey)
  }
}

function scheduleIdleTask(callback: () => void, timeoutMs: number) {
  if (typeof window === 'undefined') return
  const id = window.setTimeout(callback, timeoutMs)
  return () => window.clearTimeout(id)
}

function hasPoolsForChain(state: State, chainId: number) {
  return Object.keys(state.pools.poolsMapper[chainId] ?? {}).length > 0
}

function getSwapHydrationKey(curveApi: CurveApi, chainId: number) {
  return `${chainId}:${curveApi.signerAddress || 'readonly'}:${curveApi.isNoRPC ? 'norpc' : 'rpc'}`
}
