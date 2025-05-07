import CampaignRewardsRow from '@/lend/components/CampaignRewardsRow'
import TokenLabel from '@/lend/components/TokenLabel'
import useCampaignRewardsMapper from '@/lend/hooks/useCampaignRewardsMapper'
import { ChainId } from '@/lend/types/lend.types'
import { OneWayMarketTemplate } from '@/lend/types/lend.types'
import Box from '@ui/Box'
import Chip from '@ui/Typography/Chip'

const CellToken = ({
  hideIcon,
  rChainId,
  isVisible = true,
  market,
  showLeverageIcon,
  type,
  module,
}: {
  hideIcon?: boolean
  rChainId: ChainId
  isVisible?: boolean
  market?: OneWayMarketTemplate
  showLeverageIcon?: boolean
  type: 'collateral' | 'borrowed'
  module: 'borrow' | 'supply'
}) => {
  const { collateral_token, borrowed_token, addresses } = market ?? {}
  const campaignRewardsBorrow = useCampaignRewardsMapper()[addresses?.controller || '']
  const campaignRewardsSupply = useCampaignRewardsMapper()[addresses?.vault || '']

  const token = type === 'collateral' ? collateral_token : borrowed_token

  return hideIcon ? (
    <>
      <Chip>{token?.symbol}</Chip>
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
