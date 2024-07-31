import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import Chip from '@/ui/Typography/Chip'
import TokenLabel from '@/components/TokenLabel'
import CampaignRewardsRow from '@/components/CampaignRewardsRow'
import Box from '@/ui/Box'

const CellToken = ({
  hideIcon,
  rChainId,
  isVisible = true,
  owmDataCachedOrApi,
  showLeverageIcon,
  type,
  module,
  ...props
}: ChipProps & {
  hideIcon?: boolean
  rChainId: ChainId
  isVisible?: boolean
  owmDataCachedOrApi: OWMDataCacheOrApi
  showLeverageIcon?: boolean
  type: 'collateral' | 'borrowed'
  module: 'borrow' | 'supply'
}) => {
  const { collateral_token, borrowed_token } = owmDataCachedOrApi?.owm ?? {}
  const campaignRewardsBorrow = useCampaignRewardsMapper()[owmDataCachedOrApi?.owm?.addresses?.controller || '']
  const campaignRewardsSupply = useCampaignRewardsMapper()[owmDataCachedOrApi?.owm?.addresses?.vault || '']

  const token = type === 'collateral' ? collateral_token : borrowed_token

  return hideIcon ? (
    <>
      <Chip {...props}>{token?.symbol}</Chip>
      {campaignRewardsBorrow && type === 'collateral' && module === 'borrow' && (
        <CampaignRewardsRow rewardItems={campaignRewardsBorrow} />
      )}
      {campaignRewardsSupply && type === 'borrowed' && module === 'supply' && (
        <CampaignRewardsRow rewardItems={campaignRewardsSupply} />
      )}
    </>
  ) : (
    <Box flex>
      <TokenLabel
        isDisplayOnly
        showLeverageIcon={showLeverageIcon}
        isVisible={isVisible}
        rChainId={rChainId}
        token={token}
      />
      {campaignRewardsBorrow && type === 'collateral' && module === 'borrow' && (
        <CampaignRewardsRow rewardItems={campaignRewardsBorrow} />
      )}
      {campaignRewardsSupply && type === 'borrowed' && module === 'supply' && (
        <CampaignRewardsRow rewardItems={campaignRewardsSupply} />
      )}
    </Box>
  )
}

export default CellToken
