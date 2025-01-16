import type { GetState, SetState } from 'zustand'
import type { State } from '@/lend/store/useStore'
import type { FilterKey, FormStatus, FormValues } from '@/lend/components/PageIntegrations/types'
import type { IntegrationApp, IntegrationsTags } from '@ui/Integration/types'

import Fuse from 'fuse.js'
import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'

import { fulfilledValue, httpFetcher } from '@/lend/utils/helpers'
import networks from '@/lend/networks'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_VALUES: FormValues = {
  filterKey: 'all',
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

// prettier-ignore
export type IntegrationsSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId | ''): Promise<void>
    filterByKey(filterKey: FilterKey, integrationApps: IntegrationApp[]): IntegrationApp[]
    filterByNetwork(chainId: ChainId, integrationApps: IntegrationApp[]): IntegrationApp[]
    filterBySearchText(searchText: string, integrationApps: IntegrationApp[]): IntegrationApp[]
    setFormValues(updatedFormValues: FormValues, chainId: ChainId | ''): void

    // helpers
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

const createIntegrationsSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    init: async (chainId: ChainId) => {
      const storedTags = get()[sliceKey].integrationsTags
      const storedList = get()[sliceKey].integrationsList

      const parsedChainId = chainId || 1

      if (storedList === null) {
        const [integrationsListResult] = await Promise.allSettled([
          httpFetcher(networks[parsedChainId]?.integrations.listUrl),
        ])
        const integrationsList = fulfilledValue(integrationsListResult)
        get()[sliceKey].setStateByKey('integrationsList', parseIntegrationsList(integrationsList))
      }

      if (storedTags === null) {
        const [integrationsTagsResult] = await Promise.allSettled([
          httpFetcher(networks[parsedChainId]?.integrations.tagsUrl),
        ])
        let integrationsTags = fulfilledValue(integrationsTagsResult)
        get()[sliceKey].setStateByKey('integrationsTags', parseIntegrationsTags(integrationsTags))
      }
    },
    filterByKey: (filterKey: FilterKey, integrationApps: IntegrationApp[]) => {
      if (filterKey !== 'all') {
        return integrationApps.filter(({ tags }) => tags[filterKey])
      }
      return integrationApps
    },
    filterByNetwork: (chainId: ChainId, integrationApps: IntegrationApp[]) => {
      const networkId = networks[chainId]?.id

      if (networkId) {
        return integrationApps.filter(({ networks }) => networks[networkId])
      }
      return integrationApps
    },
    filterBySearchText: (searchText: string, integrationApps: IntegrationApp[]) => {
      const fuse = new Fuse<IntegrationApp>(integrationApps, {
        ignoreLocation: true,
        threshold: 0.01,
        keys: [{ name: 'name', getFn: (a) => a.name }],
      })

      return fuse.search(searchText).map((r) => r.item)
    },
    setFormValues: (updatedFormValues: FormValues, chainId: ChainId | '') => {
      get()[sliceKey].setStateByKeys({
        formStatus: { ...DEFAULT_FORM_STATUS, isLoading: true },
        formValues: updatedFormValues,
        results: [],
      })

      const { searchText, filterKey } = updatedFormValues
      const integrationsList = get()[sliceKey].integrationsList

      if (integrationsList) {
        let results = cloneDeep(integrationsList)

        if (chainId) {
          results = get()[sliceKey].filterByNetwork(chainId, results)
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
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

function parseIntegrationsTags(integrationsTags: { id: FilterKey; displayName: string }[]) {
  const parsedIntegrationsTags: IntegrationsTags = {}
  const INTEGRATIONS_TAGS_COLORS = ['#F60000', '#FF8C00', '#FFEE00', '#4DE94C', '#3783FF', '#4815AA', '#ee82ee']

  if (Array.isArray(integrationsTags)) {
    for (const idx in integrationsTags) {
      const t = integrationsTags[idx]
      if (t.id !== 'crvusd') {
        const color = t.id === 'all' ? '' : INTEGRATIONS_TAGS_COLORS[+idx - 1]
        parsedIntegrationsTags[t.id] = { ...t, color }

        if (t.id !== 'all' && color === '') {
          console.warn(`missing integrations tag color for ${t.id}`)
        }
      }
    }
  }

  return parsedIntegrationsTags
}

// remove all non crvusd integrations
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
      if (tags.indexOf('crvusd') !== -1) {
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
  }

  return sortBy(parsedIntegrationsList, (a) => a.name)
}

export default createIntegrationsSlice
