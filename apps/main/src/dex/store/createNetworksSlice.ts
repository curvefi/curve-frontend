import sortBy from 'lodash/sortBy'
import type { StoreApi } from 'zustand'
import { defaultNetworks, getNetworks } from '@/dex/lib/networks'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi, NativeToken, NetworkAliases, NetworkConfig, Networks } from '@/dex/types/main.types'
import type { ChainOption } from '@ui-kit/features/switch-chain'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  aliases: Record<number, NetworkAliases | undefined>
  networks: Record<number, NetworkConfig>
  nativeToken: Record<number, NativeToken | undefined>
  networksIdMapper: Record<string, number>
  visibleNetworksList: ChainOption<ChainId>[]
}

export type NetworksSlice = {
  networks: SliceState & {
    fetchNetworks(): Promise<Record<number, NetworkConfig>>
    setNetworkConfigs(curve: CurveApi): void
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

const createNetworksSlice = (_: StoreApi<State>['setState'], get: StoreApi<State>['getState']): NetworksSlice => {
  const setStateByActiveKey = <T>(key: StateKey, activeKey: string, value: T): void =>
    get().setAppStateByActiveKey(sliceKey, key, activeKey, value)

  const setStateByKey = <T>(key: StateKey, value: T): void => get().setAppStateByKey(sliceKey, key, value)

  const setNetworksIdMapper = (networks: Networks): void =>
    setStateByKey(
      'networksIdMapper',
      Object.entries(networks).reduce(
        (prev, [chainId, { networkId }]) => {
          prev[networkId] = Number(chainId)
          return prev
        },
        {} as Record<string, number>,
      ),
    )

  const setVisibleNetworksList = (networks: Networks): void => {
    const visibleNetworksList = Object.values(networks)
      .filter((networkConfig) => networkConfig.showInSelectNetwork)
      .map((networkConfig) => ({
        label: networkConfig.name,
        chainId: networkConfig.chainId,
        src: networkConfig.logoSrc,
        srcDark: networkConfig.logoSrcDark,
        isTestnet: networkConfig.isTestnet,
      }))

    setStateByKey(
      'visibleNetworksList',
      sortBy(visibleNetworksList, (n) => n.label),
    )
  }

  return {
    [sliceKey]: {
      ...DEFAULT_STATE,
      fetchNetworks: async () => {
        try {
          const networks = await getNetworks()
          setStateByKey('networks', networks)
          setNetworksIdMapper(networks)
          setVisibleNetworksList(networks)
          return networks
        } catch (error) {
          console.error(error)
          return defaultNetworks
        }
      },
      setNetworkConfigs: (curve: CurveApi) => {
        const { ALIASES, NATIVE_TOKEN } = curve.getNetworkConstants()
        setStateByActiveKey('nativeToken', curve.chainId.toString(), { ...NATIVE_TOKEN })
        setStateByActiveKey('aliases', curve.chainId.toString(), { ...ALIASES })
      },
    },
  }
}

export default createNetworksSlice
