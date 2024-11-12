import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import { getBaseNetworksConfig } from '@/ui/utils'
import { SelectNetworkItem } from '@/ui/Select/SelectNetwork'
import curve from '@curvefi/api'
import { defaultNetworks, DEFAULT_NETWORK_CONFIG } from '@/networks'
import sortBy from 'lodash/sortBy'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  networks: Record<number, NetworkConfig>
  nativeToken: Record<number, { symbol: string; wrappedSymbol: string; address: string; wrappedAddress: string } | null>
  networksIdMapper: Record<string, number>
  visibleNetworksList: Iterable<SelectNetworkItem>
}

// prettier-ignore
export type NetworksSlice = {
  networks: SliceState & {
    fetchNetworks(): Promise<Record<number, NetworkConfig>>
    setNetworksIdMapper(networks: Networks): void
    setVisibleNetworksList(networks: Networks): void
    setNetworkNativeTokens(curve: CurveApi): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  networks: {},
  nativeToken: {},
  networksIdMapper: {},
  visibleNetworksList: [],
}

const sliceKey = 'networks'

const createNetworksSlice = (set: SetState<State>, get: GetState<State>): NetworksSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchNetworks: async () => {
      try {
        const sliceState = get()[sliceKey]

        const resp = await curve.getCurveLiteNetworks()

        const liteNetworks = Object.values(resp).reduce(
          (prev, { chainId, ...config }) => {
            prev[chainId] = {
              ...getBaseNetworksConfig(Number(chainId), config),
              ...DEFAULT_NETWORK_CONFIG,
              chainId,
              isLite: true,
            }
            return prev
          },
          {} as Record<number, NetworkConfig>,
        )

        const networks: Networks = { ...defaultNetworks, ...liteNetworks }
        sliceState.setStateByKey('networks', networks)
        sliceState.setNetworksIdMapper(networks)
        sliceState.setVisibleNetworksList(networks)
        return networks
      } catch (error) {
        console.error(error)
        return defaultNetworks
      }
    },
    setNetworksIdMapper: (networks) => {
      const sliceState = get()[sliceKey]

      sliceState.setStateByKey(
        'networksIdMapper',
        Object.entries(networks).reduce(
          (prev, [chainId, { networkId }]) => {
            prev[networkId] = Number(chainId)
            return prev
          },
          {} as Record<string, number>,
        ),
      )
    },
    setVisibleNetworksList: (networks) => {
      const sliceState = get()[sliceKey]

      const visibleNetworksList = Object.values(networks)
        .filter((networkConfig) => networkConfig.showInSelectNetwork)
        .map((networkConfig) => ({
          label: networkConfig.name,
          chainId: networkConfig.chainId,
          src: networkConfig.logoSrc,
          srcDark: networkConfig.logoSrcDark,
        }))

      sliceState.setStateByKey(
        'visibleNetworksList',
        sortBy(visibleNetworksList, (n) => n.label),
      )
    },
    setNetworkNativeTokens: (curve: CurveApi) => {
      const { networks, ...sliceState } = get()[sliceKey]

      sliceState.setStateByActiveKey('nativeToken', curve.chainId.toString(), curve.constants.NATIVE_TOKEN)

      console.log('native token', { curve })
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, { ...DEFAULT_STATE })
    },
  },
})

export default createNetworksSlice
