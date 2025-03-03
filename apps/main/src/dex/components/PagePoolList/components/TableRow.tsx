import type { ColumnKeys, FormValues, SearchParams } from '@/dex/components/PagePoolList/types'
import type { CampaignRewardsMapper } from 'ui/src/CampaignRewards/types'
import { t } from '@ui-kit/lib/i18n'
import { Fragment, HTMLAttributes, useEffect, useRef, useState } from 'react'
import { COLUMN_KEYS } from '@/dex/components/PagePoolList/utils'
import useIntersectionObserver from '@ui/hooks/useIntersectionObserver'
import { Td, Tr, CellInPool } from '@ui/Table'
import Box from '@ui/Box'
import CampaignRewardsRow from '@/dex/components/CampaignRewardsRow'
import PoolLabel from '@/dex/components/PoolLabel'
import TCellRewards from '@/dex/components/PagePoolList/components/TableCellRewards'
import TableCellVolume from '@/dex/components/PagePoolList/components/TableCellVolume'
import TableCellTvl from '@/dex/components/PagePoolList/components/TableCellTvl'
import TableCellRewardsBase from '@/dex/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsCrv from '@/dex/components/PagePoolList/components/TableCellRewardsCrv'
import TableCellRewardsOthers from '@/dex/components/PagePoolList/components/TableCellRewardsOthers'
import { RewardsApy, PoolData, PoolDataCache, Tvl, Volume } from '@/dex/types/main.types'

export type TableRowProps = {
  index: number
  isLite: boolean
  poolId: string
  formValues: FormValues
  isInPool: boolean
  blockchainId: string
  columnKeys: ColumnKeys[]
  poolData: PoolData | undefined
  poolDataCachedOrApi: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
  searchParams: SearchParams
  showInPoolColumn: boolean
  campaignRewardsMapper: CampaignRewardsMapper
  tvlCached: { value: string } | undefined
  tvl: Tvl | undefined
  volumeCached: { value: string } | undefined
  volume: Volume | undefined
  handleCellClick(target: EventTarget, formType?: 'swap' | 'withdraw'): void
}

const TableRow = ({
  index,
  poolId,
  formValues,
  isInPool,
  blockchainId,
  columnKeys,
  poolData,
  poolDataCachedOrApi,
  rewardsApy,
  searchParams,
  showInPoolColumn,
  campaignRewardsMapper,
  tvlCached,
  tvl,
  volumeCached,
  volume,
  handleCellClick,
}: TableRowProps) => {
  const { searchTextByTokensAndAddresses, searchTextByOther } = formValues
  const { searchText, sortBy } = searchParams

  return (
    <LazyItem id={`${poolId}-${index}`} className="row--info" onClick={({ target }) => handleCellClick(target)}>
      {columnKeys.map((columnKey, idx) => (
        <Fragment key={`tRow${columnKey}${idx}`}>
          {columnKey === COLUMN_KEYS.inPool && (
            <CellInPool isIn={isInPool} type="pool" tooltip={t`You have a balance in this pool`} />
          )}
          {columnKey === COLUMN_KEYS.poolName && (
            <Td $first={!showInPoolColumn}>
              <PoolLabel
                isVisible
                blockchainId={blockchainId}
                poolData={poolDataCachedOrApi}
                poolListProps={{
                  searchText: searchText,
                  searchTextByTokensAndAddresses,
                  searchTextByOther,
                  onClick: handleCellClick,
                }}
              />
            </Td>
          )}
          {columnKey === COLUMN_KEYS.rewardsLite && (
            <Td className="right">
              <Box flex flexColumn style={{ gap: 'var(--spacing-1)' }}>
                {rewardsApy && (
                  <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} rewardsApy={rewardsApy} />
                )}
                {poolData && campaignRewardsMapper[poolData.pool.address] && (
                  <CampaignRewardsRow rewardItems={campaignRewardsMapper[poolData.pool.address]} />
                )}
              </Box>
            </Td>
          )}
          {columnKey === COLUMN_KEYS.rewardsDesktop && (
            <>
              <Td className="right">
                <TableCellRewardsBase
                  base={rewardsApy?.base}
                  isHighlight={sortBy === 'rewardsBase'}
                  poolData={poolData}
                />
              </Td>
              <Td className="right">
                <Box flex flexColumn style={{ gap: 'var(--spacing-1)' }}>
                  {rewardsApy && (
                    <TableCellRewardsCrv
                      isHighlight={sortBy === 'rewardsCrv'}
                      poolData={poolData}
                      rewardsApy={rewardsApy}
                    />
                  )}
                  {rewardsApy && (
                    <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} rewardsApy={rewardsApy} />
                  )}
                  {poolData && campaignRewardsMapper[poolData.pool.address] && (
                    <CampaignRewardsRow rewardItems={campaignRewardsMapper[poolData.pool.address]} />
                  )}
                </Box>
              </Td>
            </>
          )}
          {columnKey === COLUMN_KEYS.rewardsMobile && (
            <Td className="right">
              <Box flex flexColumn style={{ gap: 'var(--spacing-1)' }}>
                <TCellRewards
                  poolData={poolData}
                  isHighlightBase={sortBy === 'rewardsBase'}
                  isHighlightCrv={sortBy === 'rewardsCrv'}
                  isHighlightOther={sortBy === 'rewardsOther'}
                  rewardsApy={rewardsApy}
                />
                {poolData && campaignRewardsMapper[poolData.pool.address] && (
                  <CampaignRewardsRow rewardItems={campaignRewardsMapper[poolData.pool.address]} />
                )}
              </Box>
            </Td>
          )}
          {columnKey === COLUMN_KEYS.volume && (
            <Td className="right">
              <TableCellVolume isHighLight={sortBy === 'volume'} volumeCached={volumeCached} volume={volume} />
            </Td>
          )}
          {columnKey === COLUMN_KEYS.tvl && (
            <Td className="right" $last>
              <TableCellTvl isHighLight={sortBy === 'tvl'} tvlCached={tvlCached} tvl={tvl} />
            </Td>
          )}
        </Fragment>
      ))}
    </LazyItem>
  )
}

/**
 * Component to lazy load the <Item> table row when it is visible in the viewport.
 */
export const LazyItem = ({ children, id, style, ...props }: HTMLAttributes<HTMLTableRowElement>) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const { isIntersecting: isVisible } = useIntersectionObserver(ref) ?? {}

  // when rendered items might get larger. So we have that in the state to avoid stuttering
  const [height, setHeight] = useState<string>('88px') // default height on desktop
  useEffect(() => {
    if (isVisible && ref.current) {
      setHeight(`${ref.current.clientHeight}px`)
    }
  }, [isVisible])

  return (
    <Tr ref={ref} id={id} style={{ ...style, ...(!isVisible && { height }) }} {...props}>
      {isVisible && children}
    </Tr>
  )
}

export default TableRow
