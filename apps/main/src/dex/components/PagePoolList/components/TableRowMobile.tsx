import { Dispatch, SetStateAction, useMemo } from 'react'
import { styled } from 'styled-components'
import CampaignRewardsRow from '@/dex/components/CampaignRewardsRow'
import TCellRewards from '@/dex/components/PagePoolList/components/TableCellRewards'
import TableCellRewardsBase from '@/dex/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsCrv from '@/dex/components/PagePoolList/components/TableCellRewardsCrv'
import TableCellRewardsOthers from '@/dex/components/PagePoolList/components/TableCellRewardsOthers'
import TableCellTvl from '@/dex/components/PagePoolList/components/TableCellTvl'
import TableCellVolume from '@/dex/components/PagePoolList/components/TableCellVolume'
import { LazyItem, type TableRowProps } from '@/dex/components/PagePoolList/components/TableRow'
import type { PoolListTableLabel } from '@/dex/components/PagePoolList/types'
import { COLUMN_KEYS } from '@/dex/components/PagePoolList/utils'
import PoolLabel from '@/dex/components/PoolLabel'
import Box from '@ui/Box'
import Button from '@ui/Button'
import type { CampaignRewardsMapper } from '@ui/CampaignRewards/types'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import ListInfoItem, { ListInfoItems } from '@ui/ListInfo'
import { CellInPool } from '@ui/Table'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'

type TableRowMobileProps = Omit<TableRowProps, 'isMdUp'> & {
  showDetail: string
  themeType: ThemeKey
  setShowDetail: Dispatch<SetStateAction<string>>
  tableLabel: PoolListTableLabel
  campaignRewardsMapper: CampaignRewardsMapper
}

const TableRowMobile = ({
  index,
  columnKeys,
  formValues,
  isInPool,
  blockchainId,
  poolData,
  poolDataCachedOrApi,
  poolId,
  rewardsApy,
  searchParams,
  showDetail,
  tableLabel,
  themeType,
  tvlCached,
  tvl,
  volumeCached,
  volume,
  handleCellClick,
  setShowDetail,
  campaignRewardsMapper,
}: TableRowMobileProps) => {
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
      <td>
        <Box grid gridTemplateColumns={isInPool ? 'auto 1fr' : '1fr'}>
          <CellInPool
            as="div"
            isMobile
            isIn={isInPool}
            type="pool"
            tooltip={isInPool ? t`You have a balance in this pool` : ''}
          />
          <MobileLabelContent>
            <PoolLabel
              isVisible
              blockchainId={blockchainId}
              poolData={poolDataCachedOrApi}
              poolListProps={{
                quickViewValue,
                searchText,
                searchTextByTokensAndAddresses,
                searchTextByOther,
                onClick: handleCellClick,
              }}
            />
            <IconButton onClick={() => setShowDetail((prevState) => (prevState === poolId ? '' : poolId))}>
              {isShowDetail ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
            </IconButton>
          </MobileLabelContent>
        </Box>

        <MobileTableContentWrapper className={isShowDetail ? 'show' : ''}>
          <MobileTableContent themeType={themeType}>
            {isShowDetail && (
              <>
                <ListInfoItems>
                  {columnKeys.indexOf(COLUMN_KEYS.volume) !== -1 && (
                    <ListInfoItem title={tableLabel.volume.name}>
                      <TableCellVolume isHighLight={sortBy === 'volume'} volumeCached={volumeCached} volume={volume} />
                    </ListInfoItem>
                  )}
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

                  {!poolData?.gauge.isKilled && (
                    <>
                      {columnKeys.indexOf(COLUMN_KEYS.rewardsLite) !== -1 ? (
                        <ListInfoItem
                          title={t`REWARDS tAPR`}
                          titleNoCap
                          tooltip={t`Token APR based on current prices of tokens and reward rates`}
                        >
                          <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} rewardsApy={rewardsApy} />
                        </ListInfoItem>
                      ) : (
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
                          />
                        </ListInfoItem>
                      )}
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
      </td>
    </LazyItem>
  )
}

const MobileLabelContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px;
  padding-left: var(--spacing-narrow);
  width: 100%;
`

const MobileTableContent = styled.div<{ themeType: ThemeKey }>`
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

export default TableRowMobile
