import { stellarAddressDisplay } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { PoolQuery } from '@/stellar/queries/query-types'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { notFalsy } from '@primitives/objects.utils'
import { RewardIcon } from '@ui/components/RewardIcon'
import { getPointsCampaignRows } from '@ui/features/points-campaigns/points-campaigns.utils'
import { PointsCampaignsTable } from '@ui/features/points-campaigns/PointsCampaignsTable'
import { CampaignTooltipContent } from '@ui/features/pool-list/cells/RewardIcons'
import type { YieldBreakdownRow } from '@ui/features/pools/yield-breakdown/types'
import { YieldBreakdown } from '@ui/features/pools/yield-breakdown/YieldBreakdownCard'
import { constQ } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { usePoolCampaigns } from './usePoolCampaigns'

export const PoolCampaigns = ({ network, pool }: PoolQuery) => {
  const campaigns = usePoolCampaigns({ network }).data[pool] ?? []
  const points = getPointsCampaignRows(campaigns)
  const rows = campaigns.flatMap<YieldBreakdownRow>(campaign => {
    const { reward, symbol, platform, platformImageId } = campaign
    return notFalsy(
      reward?.type === 'apr' && {
        source: {
          icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
          iconPosition: 'left',
          primary: symbol,
        },
        address: reward.address,
        displayAddress: stellarAddressDisplay.shortenAddress(reward.address),
        explorerUrl: stellarAddressDisplay.scanAddressPath(STELLAR_NETWORKS[network].chainId, reward.address),
        rateTooltip: { title: <CampaignTooltipContent campaign={campaign} showRate={false} />, clickable: true },
        price: reward.price,
        rate: reward.value,
      },
    )
  })

  return (
    <>
      {!!rows.length && (
        <YieldBreakdown
          rows={constQ(rows)}
          total={constQ(rows.reduce((total, row) => total + (row.rate ?? 0), 0))}
          maxBoostTotal={constQ(0)}
        />
      )}
      {points.length > 0 && (
        <Card size="small">
          <CardHeader title={t`Points Campaigns`} />
          <PointsCampaignsTable rows={points} />
        </Card>
      )}
    </>
  )
}
