import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import { DEFAULT_NETWORK_CONFIG } from '@/constants'
import { getBaseNetworksConfig } from '@/ui/utils'
import { SelectNetworkItem } from '@/ui/SelectNetwork/SelectNetwork'
import curve from '@curvefi/api'
import sortBy from 'lodash/sortBy'
import { defaultNetworks } from '@/store/default-networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  aliases: Record<number, NetworkAliases | undefined>
  networks: Record<number, NetworkConfig>
  nativeToken: Record<number, NativeToken | undefined>
  networksIdMapper: Record<string, number>
  visibleNetworksList: SelectNetworkItem[]
}

// prettier-ignore
export type NetworksSlice = {
  networks: SliceState & {
    setNetworksIdMapper(networks: Networks): void
    setVisibleNetworksList(networks: Networks): void
    setNetworkConfigs(curve: CurveApi): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  aliases: {},
  networks: defaultNetworks,
  nativeToken: {},
  networksIdMapper: {},
  visibleNetworksList: [],
}

const sliceKey = 'networks'

const createNetworksSlice = (set: SetState<State>, get: GetState<State>): NetworksSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

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
    setNetworkConfigs: (curve: CurveApi) => {
      const { networks, ...sliceState } = get()[sliceKey]
      const { ALIASES, NATIVE_TOKEN } = curve.getNetworkConstants()

      sliceState.setStateByActiveKey('nativeToken', curve.chainId.toString(), { ...NATIVE_TOKEN })
      sliceState.setStateByActiveKey('aliases', curve.chainId.toString(), { ...ALIASES })
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
