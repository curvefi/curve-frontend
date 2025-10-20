import Fuse from 'fuse.js'
import { produce } from 'immer'
import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import { httpFetcher } from '@/dex/lib/utils'
import type { State } from '@/dex/store/useStore'
import type { FilterKey, FormStatus, FormValues } from '@/dex/types/integrations.types'
import type { ChainId } from '@/dex/types/main.types'
import type { IntegrationApp, IntegrationsTags } from '@ui/Integration/types'
import { fetchNetworks, getNetworks } from '../entities/networks'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep, sortBy } = lodash

export const DEFAULT_FORM_VALUES: FormValues = {
  filterKey: 'all',
  filterNetworkId: '',
  searchText: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isLoading: false,
  noResult: false,
}

type SliceState = {
  formStatus: FormStatus
  formValues: FormValues
  integrationsList: IntegrationApp[] | null
  integrationsTags: IntegrationsTags | null
  results: IntegrationApp[] | null
}

const sliceKey = 'integrations'

export type IntegrationsSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId | ''): Promise<void>
    filterByKey(filterKey: FilterKey, integrationApps: IntegrationApp[]): IntegrationApp[]
    filterByNetwork(filterNetworkId: string, integrationApps: IntegrationApp[]): IntegrationApp[]
    filterBySearchText(searchText: string, integrationApps: IntegrationApp[]): IntegrationApp[]
    setFormValues(updatedFormValues: FormValues): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  integrationsList: null,
  integrationsTags: null,
  results: null,
}

const createIntegrationsSlice = (
  set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): IntegrationsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    init: async (chainId: ChainId) => {
      const state = get()
      const { integrationsList: storedList, integrationsTags: storedTags, setStateByKey } = state[sliceKey]

      const parsedChainId = chainId || 1
      const networks = fetchNetworks()

      if (storedList === null) {
        try {
          const integrationsList = await httpFetcher((await networks)[parsedChainId]?.integrations.listUrl)
          const parsedIntegrationsList = parseIntegrationsList(integrationsList)
          setStateByKey('integrationsList', parsedIntegrationsList)
        } catch (error) {
          console.error(error)
          setStateByKey('integrationsList', [])
        }
      }

      if (storedTags === null) {
        try {
          const integrationsTags = await httpFetcher((await networks)[parsedChainId]?.integrations.tagsUrl)
          setStateByKey('integrationsTags', parseIntegrationsTags(integrationsTags))
        } catch (error) {
          console.error(error)
          setStateByKey('integrationsTags', [])
        }
      }
    },
    filterByKey: (filterKey: FilterKey, integrationApps: IntegrationApp[]) => {
      if (filterKey !== 'all') {
        return integrationApps.filter(({ tags }) => tags[filterKey])
      }
      return integrationApps
    },
    filterByNetwork: (filterNetworkId: string, integrationApps: IntegrationApp[]) => {
      const networkId = getNetworks()[+filterNetworkId]?.id
      return networkId ? integrationApps.filter(({ networks }) => networks[networkId]) : integrationApps
    },
    filterBySearchText: (searchText: string, integrationApps: IntegrationApp[]) => {
      const fuse = new Fuse<IntegrationApp>(integrationApps, {
        ignoreLocation: true,
        threshold: 0.01,
        keys: [{ name: 'name', getFn: (a) => a.name }],
      })

      return fuse.search(searchText).map((r) => r.item)
    },
    setFormValues: (updatedFormValues: FormValues) => {
      get()[sliceKey].setStateByKeys({
        formStatus: { ...DEFAULT_FORM_STATUS, isLoading: true },
        formValues: updatedFormValues,
        results: [],
      })

      const { searchText, filterKey, filterNetworkId } = updatedFormValues
      const integrationsList = get()[sliceKey].integrationsList

      if (integrationsList) {
        let results = cloneDeep(integrationsList)

        if (filterNetworkId) {
          results = get()[sliceKey].filterByNetwork(filterNetworkId, results)
        }

        if (searchText) {
          results = get()[sliceKey].filterBySearchText(searchText, results)
        }

        if (filterKey) {
          results = get()[sliceKey].filterByKey(filterKey, results)
        }

        get()[sliceKey].setStateByKeys({
          formStatus: { ...DEFAULT_FORM_STATUS, noResult: results.length === 0 },
          results: sortBy(results, (r) => r.name),
        })
      }
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
      set(
        produce((state: State) => {
          state[sliceKey] = { ...state[sliceKey], ...DEFAULT_STATE }
        }),
      )
    },
  },
})

function parseIntegrationsTags(integrationsTags: { id: FilterKey; displayName: string }[]) {
  const parsedIntegrationsTags: IntegrationsTags = {}
  const INTEGRATIONS_TAGS_COLORS = ['#F60000', '#FF8C00', '#FFEE00', '#4DE94C', '#3783FF', '#4815AA', '#ee82ee']

  if (Array.isArray(integrationsTags)) {
    const filteredIntegrationsTags = integrationsTags.filter((t) => t.id !== 'crvusd')
    for (const idx in filteredIntegrationsTags) {
      const t = filteredIntegrationsTags[idx]
      const color = t.id === 'all' ? '' : INTEGRATIONS_TAGS_COLORS[+idx - 1]
      parsedIntegrationsTags[t.id] = { ...t, color }

      if (t.id !== 'all' && color === '') {
        console.warn(`missing integrations tag color for ${t.id}`)
      }
    }
  }

  return parsedIntegrationsTags
}

function parseIntegrationsList(
  integrationsList: {
    appUrl: string | null
    description: string
    imageId: string
    name: string
    networks: string[]
    tags: string[]
    twitterUrl: string | null
  }[],
) {
  const parsedIntegrationsList: IntegrationApp[] = []

  if (Array.isArray(integrationsList)) {
    for (const { networks, tags, ...rest } of integrationsList) {
      const parsedNetworks: { [network: string]: boolean } = {}
      for (const n of networks) {
        parsedNetworks[n] = true
      }
      const parsedTags: { [tag: string]: boolean } = {}
      for (const n of tags) {
        if (n !== 'crvusd') {
          parsedTags[n] = true
        }
      }
      parsedIntegrationsList.push({ ...rest, networks: parsedNetworks, tags: parsedTags })
    }
  }

  return sortBy(parsedIntegrationsList, (a) => a.name)
}

export default createIntegrationsSlice
