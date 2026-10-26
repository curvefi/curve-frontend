import { groupBy } from 'lodash'
import type { Address } from '@primitives/address.utils'
import type { CampaignRewards } from './types'

export const groupCampaignsByAddress = (formatAddress: (address: string) => Address) => (rewards: CampaignRewards[]) =>
  groupBy(
    rewards.map(reward => ({ ...reward, address: formatAddress(reward.address) })),
    reward => reward.address,
  )
