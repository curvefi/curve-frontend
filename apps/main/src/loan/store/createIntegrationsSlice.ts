import Fuse from 'fuse.js'
import { produce } from 'immer'
import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import networks from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { ChainId } from '@/loan/types/loan.types'
import { fulfilledValue, httpFetcher } from '@/loan/utils/helpers'
import {
  type Tag,
  type IntegrationApp,
  type IntegrationsTags,
  type FormValues,
  type FormStatus,
  parseIntegrationsList,
  parseIntegrationsTags,
} from '@ui-kit/features/integrations'

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

export type IntegrationsSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId | ''): Promise<void>
    filterByKey(tag: Tag, integrationApps: IntegrationApp[]): IntegrationApp[]
    filterByNetwork(chainId: ChainId, integrationApps: IntegrationApp[]): IntegrationApp[]
    filterBySearchText(searchText: string, integrationApps: IntegrationApp[]): IntegrationApp[]
    setFormValues(updatedFormValues: FormValues, chainId: ChainId | ''): void

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

const createIntegrationsSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
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
        const integrationsTags = fulfilledValue(integrationsTagsResult)
        get()[sliceKey].setStateByKey('integrationsTags', parseIntegrationsTags(integrationsTags))
      }
    },
    filterByKey: (tag: Tag, integrationApps: IntegrationApp[]) => {
      if (tag !== 'all') {
        return integrationApps.filter(({ tags }) => tags[tag])
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
        let results = lodash.cloneDeep(integrationsList)

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
          results: lodash.sortBy(results, (r) => r.name),
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
      set(
        produce((state: State) => {
          state[sliceKey] = { ...state[sliceKey], ...DEFAULT_STATE }
        }),
      )
    },
  },
})

export default createIntegrationsSlice
