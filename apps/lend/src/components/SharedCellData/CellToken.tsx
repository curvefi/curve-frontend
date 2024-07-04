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
  ...props
}: ChipProps & {
  hideIcon?: boolean
  rChainId: ChainId
  isVisible?: boolean
  owmDataCachedOrApi: OWMDataCacheOrApi
  showLeverageIcon?: boolean
  type: 'collateral' | 'borrowed'
}) => {
  const { collateral_token, borrowed_token } = owmDataCachedOrApi?.owm ?? {}
  const campaignRewards = useCampaignRewardsMapper()[owmDataCachedOrApi?.owm?.addresses?.controller || '']

  const token = type === 'collateral' ? collateral_token : borrowed_token

  return hideIcon ? (
    <>
      <Chip {...props}>{token?.symbol}</Chip>
      {campaignRewards && type === 'collateral' && <CampaignRewardsRow rewardItems={campaignRewards} />}
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
      {campaignRewards && type === 'collateral' && <CampaignRewardsRow rewardItems={campaignRewards} />}
    </Box>
  )
}

export default CellToken
