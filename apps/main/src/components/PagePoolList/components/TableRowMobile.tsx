import type { PoolListTableLabel } from '@/components/PagePoolList/types'
import type { Theme } from '@/store/createGlobalSlice'
import type { CampaignRewardsMapper } from '@/ui/CampaignRewards/types'

import { t } from '@lingui/macro'
import React, { FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'

import { LazyItem, TableRowProps, TCellInPool } from '@/components/PagePoolList/components/TableRow'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import PoolLabel from '@/components/PoolLabel'
import TCellRewards from '@/components/PagePoolList/components/TableCellRewards'
import TableCellInPool from '@/components/PagePoolList/components/TableCellInPool'
import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import ListInfoItem, { ListInfoItems } from '@/ui/ListInfo'
import TableCellVolume from '@/components/PagePoolList/components/TableCellVolume'
import TableCellTvl from '@/components/PagePoolList/components/TableCellTvl'
import TableCellRewardsBase from '@/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsCrv from '@/components/PagePoolList/components/TableCellRewardsCrv'
import TableCellRewardsOthers from '@/components/PagePoolList/components/TableCellRewardsOthers'
import CampaignRewardsRow from '@/components/CampaignRewardsRow'

type TableRowMobileProps = Omit<TableRowProps, 'isMdUp'> & {
  showDetail: string
  themeType: Theme
  setShowDetail: React.Dispatch<React.SetStateAction<string>>
  tableLabel: PoolListTableLabel
  campaignRewardsMapper: CampaignRewardsMapper
}

const TableRowMobile: FunctionComponent<TableRowMobileProps> = ({
  index,
  formValues,
  isInPool,
  imageBaseUrl,
  poolData,
  poolDataCachedOrApi,
  poolId,
  rewardsApy,
  searchParams,
  showDetail,
  tableLabel,
  themeType,
  tokensMapper,
  tvlCached,
  tvl,
  volumeCached,
  volume,
  handleCellClick,
  setShowDetail,
  campaignRewardsMapper,
}) => {
  const { searchTextByTokensAndAddresses, searchTextByOther } = formValues
  const { searchText, sortBy } = searchParams
  const isShowDetail = showDetail === poolId

  const quickViewValue = useMemo(() => {
    if (sortBy && !showDetail) {
      if (sortBy === 'rewardsBase') {
        return (
          <TableCellRewardsBase base={rewardsApy?.base} isHighlight={sortBy === 'rewardsBase'} poolData={poolData} />
        )
      } else if (sortBy === 'rewardsCrv') {
        return <TableCellRewardsCrv poolData={poolData} isHighlight={sortBy === 'rewardsCrv'} rewardsApy={rewardsApy} />
      } else if (sortBy === 'rewardsOther') {
        return <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} rewardsApy={rewardsApy} />
      } else if (sortBy === 'volume') {
        return formatNumber(volume?.value, { notation: 'compact', currency: 'USD' })
      } else if (sortBy === 'tvl') {
        return formatNumber(tvl?.value, { notation: 'compact', currency: 'USD' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetail, sortBy])

  return (
    <LazyItem id={`${index}`} className="row--info">
      <TCell>
        <MobileLabelWrapper flex>
          <TCellInPool as="div" className={`row-in-pool ${isInPool ? 'active' : ''} `}>
            {isInPool ? <TableCellInPool /> : null}
          </TCellInPool>
          <MobileLabelContent>
            <PoolLabel
              isVisible
              imageBaseUrl={imageBaseUrl}
              poolData={poolDataCachedOrApi}
              poolListProps={{
                quickViewValue,
                searchText,
                searchTextByTokensAndAddresses,
                searchTextByOther,
                onClick: handleCellClick,
              }}
              tokensMapper={tokensMapper}
            />
            <IconButton
              onClick={() =>
                setShowDetail((prevState) => {
                  return prevState === poolId ? '' : poolId
                })
              }
            >
              {isShowDetail ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
            </IconButton>
          </MobileLabelContent>
        </MobileLabelWrapper>

        <MobileTableContentWrapper className={isShowDetail ? 'show' : ''}>
          <MobileTableContent themeType={themeType}>
            {isShowDetail && (
              <>
                <ListInfoItems>
                  <ListInfoItem title={tableLabel.volume.name}>
                    <TableCellVolume isHighLight={sortBy === 'volume'} volumeCached={volumeCached} volume={volume} />
                  </ListInfoItem>
                  <ListInfoItem title={tableLabel.tvl.name}>
                    <TableCellTvl isHighLight={sortBy === 'tvl'} tvlCached={tvlCached} tvl={tvl} />
                  </ListInfoItem>

                  <ListInfoItem title={t`BASE vAPY`} titleNoCap>
                    <TableCellRewardsBase
                      base={rewardsApy?.base}
                      isHighlight={sortBy === 'rewardsBase'}
                      poolData={poolData}
                    />
                  </ListInfoItem>

                  {!poolData?.isGaugeKilled && (
                    <>
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
                          rewardsApy={rewardsApy}
                          searchText={Object.keys(searchTextByOther).length > 0 ? searchText : ''}
                        />
                      </ListInfoItem>
                      {poolData && campaignRewardsMapper[poolData.pool.address] && (
                        <ListInfoItem title={t`Additional external rewards`}>
                          <CampaignRewardsRow rewardItems={campaignRewardsMapper[poolData.pool.address]} mobile />
                        </ListInfoItem>
                      )}
                    </>
                  )}
                </ListInfoItems>

                <MobileTableActions>
                  <Button variant="filled" onClick={({ target }) => handleCellClick(target)}>
                    {t`Deposit`}
                  </Button>
                  <Button variant="filled" onClick={({ target }) => handleCellClick(target, 'withdraw')}>
                    {t`Withdraw`}
                  </Button>
                  <Button variant="filled" onClick={({ target }) => handleCellClick(target, 'swap')}>
                    {t`Swap`}
                  </Button>
                </MobileTableActions>
              </>
            )}
          </MobileTableContent>
        </MobileTableContentWrapper>
      </TCell>
    </LazyItem>
  )
}

const MobileLabelWrapper = styled(Box)`
  .row-in-pool {
    align-items: center;
    display: inline-flex;
    min-width: 1rem;
  }
`

const MobileLabelContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px;
  width: 100%;
`

const MobileTableContent = styled.div<{ themeType: Theme }>`
  display: grid;
  min-height: 150px;
  padding: ${({ themeType }) => (themeType === 'chad' ? '1rem 0.75rem 0.75rem' : '1rem 1rem 0.75rem 1rem')};
`

const MobileTableActions = styled.div`
  margin: 0.3rem 0;
  > button:not(:last-of-type) {
    border-right: 1px solid rgba(255, 255, 255, 0.25);
  }
`

const MobileTableContentWrapper = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);

  &.show {
    max-height: 100rem;
    transition: max-height 1s ease-in-out;
  }
`

const TCell = styled.td`
  border-bottom: 1px solid var(--border-400);
`

export default TableRowMobile
