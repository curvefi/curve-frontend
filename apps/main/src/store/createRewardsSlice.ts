import type { GetState, SetState } from 'zustand'

import type { State } from '@/store/useStore'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {}

const sliceKey = 'rewards'

// prettier-ignore
export type TokensSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {}

const createRewardsSlice = (set: SetState<State>, get: GetState<State>): TokensSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    init: async (chainId: ChainId) => {
      const campaigns = await fetchAndCompileJsonFiles(
        networks[chainId].rewards.campaignsUrl,
        networks[chainId].rewards.baseUrl
      )
      console.log('campaigns', campaigns)
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

async function fetchAndCompileJsonFiles(directoryUrl: string, baseUrl: string): Promise<Record<string, any>> {
  try {
    // Fetch the directory listing
    const response = await fetch(directoryUrl)
    const html = await response.text()

    // Extract the JSON file names from the directory listing
    const jsonFileNames = extractJsonFileNames(html)

    console.log(jsonFileNames)

    // Fetch each JSON file and compile the data
    const jsonFetches = jsonFileNames.map((fileName) => {
      const fileUrl = `${baseUrl}${fileName}`
      const fileFetch = fetch(fileUrl)
      return fileFetch
    })

    const jsonResponses = await Promise.all(jsonFetches)
    console.log('jsonResponses', jsonResponses)
    const jsonResponsesFormatted = jsonResponses.map((res) => res.json())
    console.log('jsonResponsesFormatted', jsonResponsesFormatted)

    return jsonResponsesFormatted
  } catch (error) {
    console.error('Error fetching and compiling JSON files:', error)
    throw error
  }
}

function extractJsonFileNames(html: string): string[] {
  const regex = /href="([^"]+\.json)"/g
  const matches = html.matchAll(regex)
  const fileNames: string[] = []

  for (const match of matches) {
    fileNames.push(match[1])
  }

  return fileNames
}

export default createRewardsSlice
