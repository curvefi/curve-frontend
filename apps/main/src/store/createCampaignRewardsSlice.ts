import type { State } from '@/store/useStore'
import type { GetState, SetState } from 'zustand'
import { CampaignRewardsItem, CampaignRewardsPool, CampaignRewardsMapper } from 'ui/src/CampaignRewards/types'
import produce from 'immer'

import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  initiated: boolean
  campaignRewardsMapper: CampaignRewardsMapper
}

const sliceKey = 'campaigns'

// prettier-ignore
export type TokensSlice = {
  [sliceKey]: SliceState & {
    initCampaignRewards(chainId: ChainId): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  initiated: false,
  campaignRewardsMapper: {},
}

const createCampaignsSlice = (set: SetState<State>, get: GetState<State>): TokensSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    initCampaignRewards: async (chainId: ChainId) => {
      const campaigns = await fetchAndCompileJsonFiles(
        networks[chainId].rewards.campaignsUrl,
        networks[chainId].rewards.baseUrl
      )

      let campaignRewardsMapper: CampaignRewardsMapper = {}

      // compile a list of pool/markets using pool/vault address as key
      campaigns.forEach((campaign: CampaignRewardsItem) => {
        campaign.pools.forEach((pool: CampaignRewardsPool) => {
          if (!campaignRewardsMapper[pool.poolAddress.toLowerCase()]) {
            campaignRewardsMapper[pool.poolAddress.toLowerCase()] = []
          }
          campaignRewardsMapper[pool.poolAddress.toLowerCase()].push({
            campaignName: campaign.campaignName,
            platform: campaign.platform,
            description: campaign.description,
            platformImageSrc: `${networks[chainId].rewards.imageBaseUrl}/${campaign.platformImageId}`,
            dashboardLink: campaign.dashboardLink,
            ...pool,
            poolAddress: pool.poolAddress.toLowerCase(),
          })
        })
      })

      // sort pools by multiplier to prepare for pool list sorting
      Object.keys(campaignRewardsMapper).forEach((poolAddress: string) => {
        campaignRewardsMapper[poolAddress].sort((a, b) => +a.multiplier - +b.multiplier)
      })

      set(
        produce((state: State) => {
          state[sliceKey].initiated = true
          state[sliceKey].campaignRewardsMapper = campaignRewardsMapper
        })
      )
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
    // Fetch list of campaigns
    const response = await fetch(directoryUrl)
    const jsonFileNames = await response.json()

    // Fetch each JSON file and compile the data
    const jsonFetches = jsonFileNames.map(async (fileName: { campaign: string }) => {
      const fileUrl = `https://cdn.jsdelivr.net/gh/curvefi/curve-external-reward@latest/campaigns/${fileName.campaign}`
      const fileResponse = await fetch(fileUrl)
      return await fileResponse.json()
    })

    const jsonResponses = await Promise.all(jsonFetches)
    return jsonResponses
  } catch (error) {
    console.error('Error fetching and compiling JSON files:', error)
    throw error
  }
}

export default createCampaignsSlice
