import { styled } from 'styled-components'
import CampaignRewardsRow from '@/dex/components/CampaignRewardsRow'
import TCellRewards from '@/dex/components/PagePoolList/components/TableCellRewards'
import TableCellRewardsBase from '@/dex/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsOthers from '@/dex/components/PagePoolList/components/TableCellRewardsOthers'
import TableCellTvl from '@/dex/components/PagePoolList/components/TableCellTvl'
import TableCellVolume from '@/dex/components/PagePoolList/components/TableCellVolume'
import { ROUTE } from '@/dex/constants'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import Button from '@mui/material/Button'
import ListInfoItem, { ListInfoItems } from '@ui/ListInfo'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import type { Address } from '@ui-kit/utils'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

const tableLabel = {
  volume: { name: t`24h Volume` },
  tvl: { name: t`TVL` },
  rewardsCrv: { name: `CRV ${t`tAPR`}` },
  rewardsOther: { name: `${t`Other`} ${t`tAPR`}` },
  rewardsBase: { name: `${t`Base`} ${t`vAPY`}` },
}

export const PoolMobileExpandedPanel: ExpandedPanel<PoolListItem> = ({ row, table }) => {
  const { original: poolData } = row
  const {
    pool: { id: poolId, address },
    network,
  } = poolData
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network as Chain,
    address: address as Address,
  })
  const path = getPath({ network }, `${ROUTE.PAGE_POOLS}/${poolId}`)
  const sortBy = table.getState().sorting[0]?.id
  const { volume, tvl, rewards: rewards } = poolData

  const hasRewardsCrv = useNetworkFromUrl()
  const hasVolume = table.getColumn(PoolColumnId.Volume)?.getIsVisible()
  return (
    <>
      <ListInfoItems>
        {hasVolume && (
          <ListInfoItem title={tableLabel.volume.name}>
            <TableCellVolume isHighLight={sortBy === 'volume'} volume={volume} />
          </ListInfoItem>
        )}
        <ListInfoItem title={tableLabel.tvl.name}>
          <TableCellTvl isHighLight={sortBy === 'tvl'} tvl={tvl} />
        </ListInfoItem>

        <ListInfoItem title={t`BASE vAPY`} titleNoCap>
          <TableCellRewardsBase base={rewards?.base} isHighlight={sortBy === 'rewardsBase'} poolData={poolData} />
        </ListInfoItem>

        {!poolData?.gauge.isKilled && (
          <>
            {hasRewardsCrv ? (
              <ListInfoItem
                title={t`REWARDS tAPR`}
                titleNoCap
                titleDescription={`(${tableLabel.rewardsCrv.name} + ${tableLabel.rewardsOther.name})`}
                tooltip={t`Token APR based on current prices of tokens and reward rates`}
              >
                <TCellRewards
                  poolData={poolData}
                  isHighlightBase={sortBy === 'rewardsBase'}
                  isHighlightCrv={sortBy === 'rewardsCrv'}
                  isHighlightOther={sortBy === 'rewardsOther'}
                  rewardsApy={rewards}
                />
              </ListInfoItem>
            ) : (
              <ListInfoItem
                title={t`REWARDS tAPR`}
                titleNoCap
                tooltip={t`Token APR based on current prices of tokens and reward rates`}
              >
                <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} rewardsApy={rewards} />
              </ListInfoItem>
            )}
            {campaigns.length > 0 && (
              <ListInfoItem title={t`Additional external rewards`}>
                <CampaignRewardsRow rewardItems={campaigns} mobile />
              </ListInfoItem>
            )}
          </>
        )}
      </ListInfoItems>

      <MobileTableActions>
        <Button component={RouterLink} href={path + ROUTE.PAGE_SWAP}>{t`Deposit`}</Button>
        <Button component={RouterLink} href={path + ROUTE.PAGE_POOL_WITHDRAW}>{t`Withdraw`}</Button>
        <Button component={RouterLink} href={path + ROUTE.PAGE_POOL_DEPOSIT}>{t`Swap`}</Button>
      </MobileTableActions>
    </>
  )
}

const MobileTableActions = styled.div`
  margin: 0.3rem 0;
  > button:not(:last-of-type) {
    border-right: 1px solid rgba(255, 255, 255, 0.25);
  }
`
