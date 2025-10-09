import type { StoreApi } from 'zustand'
import type { State } from '@/dex/store/useStore'
import { type ChainId, CurveApi, NativeToken, NetworkAliases } from '@/dex/types/main.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  aliases: Record<ChainId, NetworkAliases | undefined>
  nativeToken: Record<ChainId, NativeToken | undefined>
}

export type NetworksSlice = {
  networks: SliceState & {
    setNetworkConfigs(curve: CurveApi): void
  }
}

const DEFAULT_STATE: SliceState = {
  aliases: {},
  nativeToken: {},
}

const sliceKey = 'networks'

const createNetworksSlice = (_: StoreApi<State>['setState'], get: StoreApi<State>['getState']): NetworksSlice => {
  const setStateByActiveKey = <T>(key: StateKey, activeKey: string, value: T): void =>
    get().setAppStateByActiveKey(sliceKey, key, activeKey, value)

  return {
    [sliceKey]: {
      ...DEFAULT_STATE,
      setNetworkConfigs: (curve: CurveApi) => {
        const { ALIASES, NATIVE_TOKEN } = curve.getNetworkConstants()
        setStateByActiveKey('nativeToken', curve.chainId.toString(), { ...NATIVE_TOKEN })
        setStateByActiveKey('aliases', curve.chainId.toString(), { ...ALIASES })
      },
    },
  }
}

export default createNetworksSlice
