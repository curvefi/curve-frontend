import type { State } from '@/dex/store/useStore'
import type { GetState, SetState } from 'zustand'
import { CampaignRewardsItem, CampaignRewardsPool, CampaignRewardsMapper } from '@ui/CampaignRewards/types'
import produce from 'immer'

import campaigns from '@/shared/external-rewards'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  initiated: boolean
  campaignRewardsMapper: CampaignRewardsMapper
}

const sliceKey = 'campaigns'

// prettier-ignore
export type CampaignRewardsSlice = {
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

const createCampaignsSlice = (set: SetState<State>, get: GetState<State>): CampaignRewardsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    initCampaignRewards: (chainId: ChainId) => {
      let campaignRewardsMapper: CampaignRewardsMapper = {}
      const {
        networks: { networks },
      } = get()
      const network = networks[chainId].id

      // compile a list of pool/markets using pool/vault address as key
      campaigns.forEach((campaign: CampaignRewardsItem) => {
        campaign.pools.forEach((pool: CampaignRewardsPool) => {
          if (pool.network.toLowerCase() === network.toLowerCase()) {
            if (!campaignRewardsMapper[pool.address.toLowerCase()]) {
              campaignRewardsMapper[pool.address.toLowerCase()] = []
            }

            campaignRewardsMapper[pool.address.toLowerCase()].push({
              campaignName: campaign.campaignName,
              platform: campaign.platform,
              platformImageSrc: `${networks[chainId].rewards.imageBaseUrl}/${campaign.platformImageId}`,
              dashboardLink: campaign.dashboardLink,
              ...pool,
              description: pool.description !== 'null' ? pool.description : campaign.description,
              address: pool.address.toLowerCase(),
              lock: pool.lock === 'true',
            })
          }
        })
      })

      // sort pools by multiplier to prepare for pool list sorting
      Object.keys(campaignRewardsMapper).forEach((address: string) => {
        campaignRewardsMapper[address].sort((a, b) => +a.multiplier - +b.multiplier)
      })

      set(
        produce((state: State) => {
          state[sliceKey].initiated = true
          state[sliceKey].campaignRewardsMapper = campaignRewardsMapper
        }),
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

export default createCampaignsSlice
