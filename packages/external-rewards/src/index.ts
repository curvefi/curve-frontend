import { default as campaignList } from './campaign-list.json'
import * as campaignsJsons from './campaigns'

const parsedCampaignsJsons: { [key: string]: any } = campaignsJsons
const campaigns = campaignList
  .map(({ campaign }) => {
    const campaignName = campaign.split('.')?.[0]
    if (!campaignName || !(campaignName in parsedCampaignsJsons)) return null

    const dateFilteredCampaign = {
      ...parsedCampaignsJsons[campaignName],
      pools: parsedCampaignsJsons[campaignName].pools.filter((pool: any) => {
        const currentTime = Date.now() / 1000

        // allow campaigns with no set period
        if (pool.campaignStart === '0' || pool.campaignEnd === '0') {
          return true
        }

        // check if current time is within the campaign period
        const startTime = new Date(+pool.campaignStart).getTime()
        const endTime = new Date(+pool.campaignEnd).getTime()
        return currentTime >= startTime && currentTime <= endTime
      }),
    }

    return dateFilteredCampaign
  })
  .filter((campaign) => campaign !== null)

export default campaigns
