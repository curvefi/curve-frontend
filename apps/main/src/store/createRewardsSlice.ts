import type { GetState, SetState } from 'zustand'

import type { State } from '@/store/useStore'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  rewardsMapper: RewardsPoolMapper
}

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

const DEFAULT_STATE: SliceState = {
  rewardsMapper: {
    ['0xeeda34a377dd0ca676b9511ee1324974fa8d980d']: [
      {
        platform: 'Puffer Finance',
        description: 'Puffer boosted pool.',
        imageId: 'puffer-finance.png',
        tags: ['points'],
        poolId: 'factory-stable-ng-113',
        campaignStart: '0',
        campaignEnd: '1770000000',
        poolAddress: '0xeeda34a377dd0ca676b9511ee1324974fa8d980d',
        gaugeAddress: '0xf4fa0c7833e778fb9fb392ec36217e17c9133976',
        network: 'ethereum',
        dashboardLink: 'https://quest.puffer.fi/defi',
        multiplier: '2',
      },
    ],
    ['0xdb74dfdd3bb46be8ce6c33dc9d82777bcfc3ded5']: [
      {
        platform: 'Ether.fi',
        description: 'Ether.fi boosted pool.',
        imageId: 'etherfi.png',
        tags: ['points'],
        poolId: 'factory-stable-ng-157',
        campaignStart: '0',
        campaignEnd: '1770000000',
        poolAddress: '0xdb74dfdd3bb46be8ce6c33dc9d82777bcfc3ded5',
        gaugeAddress: '0xf4fa0c7833e778fb9fb392ec36217e17c9133976',
        network: 'ethereum',
        dashboardLink: 'https://app.ether.fi/defi',
        multiplier: '3',
      },
      {
        platform: 'Eigenlayer',
        description: 'Eigenlayer boosted pool.',
        imageId: 'eigenlayer.png',
        tags: ['points'],
        poolId: 'factory-stable-ng-157',
        campaignStart: '0',
        campaignEnd: '1770000000',
        poolAddress: '0xdb74dfdd3bb46be8ce6c33dc9d82777bcfc3ded5',
        gaugeAddress: '0xf4fa0c7833e778fb9fb392ec36217e17c9133976',
        network: 'ethereum',
        dashboardLink: 'https://app.eigenlayer.xyz/restake',
        multiplier: '1',
      },
    ],
  },
}

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
