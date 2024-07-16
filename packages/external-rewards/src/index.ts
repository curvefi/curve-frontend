import { default as campaignList } from './campaign-list.json'
import * as campaignsJsons from './campaigns'

const parsedCampaignsJsons: { [key: string]: any } = campaignsJsons
const campaigns = campaignList
  .map(({ campaign }) => {
    const campaignName = campaign.split('.')?.[0]
    if (!campaignName || !(campaignName in parsedCampaignsJsons)) return null
    return parsedCampaignsJsons[campaignName]
  })
  .filter((campaign) => campaign !== null)

export default campaigns
