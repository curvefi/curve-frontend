import type { FormValues, SearchParams } from '@/components/PagePoolList/types'

import { useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'

import PoolLabel from '@/components/PoolLabel'
import TCellRewards from '@/components/PagePoolList/components/TableCellRewards'
import TableCellVolume from '@/components/PagePoolList/components/TableCellVolume'
import TableCellTvl from '@/components/PagePoolList/components/TableCellTvl'
import TableCellInPool from '@/components/PagePoolList/components/TableCellInPool'
import TableCellRewardsBase from '@/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsCrv from '@/components/PagePoolList/components/TableCellRewardsCrv'
import TableCellRewardsGauge from '@/components/PagePoolList/components/TableCellRewardsGauge'
import TableCellRewardsOthers from '@/components/PagePoolList/components/TableCellRewardsOthers'

const TableRow = ({
  className,
  formValues,
  isMdUp,
  isInPool,
  imageBaseUrl,
  poolData,
  poolDataCachedOrApi,
  rewardsApy,
  searchParams,
  showInPoolColumn,
  tokensMapper,
  tvlCached,
  tvl,
  volumeCached,
  volume,
  handleCellClick,
}: {
  className?: string
  formValues: FormValues
  isMdUp: boolean
  isInPool: boolean
  imageBaseUrl: string
  poolData: PoolData | undefined
  poolDataCachedOrApi: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
  searchParams: SearchParams
  showInPoolColumn: boolean
  tokensMapper: TokensMapper
  tvlCached: Tvl | undefined
  tvl: Tvl | undefined
  volumeCached: Volume | undefined
  volume: Volume | undefined
  handleCellClick(target: EventTarget, formType?: 'swap' | 'withdraw'): void
}) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })

  const { searchTextByTokensAndAddresses, searchTextByOther } = formValues
  const { searchText, sortBy } = searchParams
  const isVisible = !!entry?.isIntersecting

  return (
    <Item
      ref={ref}
      className={`${className} row--info ${isVisible ? '' : 'pending'}`}
      onClick={({ target }) => handleCellClick(target)}
    >
      {showInPoolColumn && (
        <TCellInPool className={`row-in-pool ${isInPool ? 'active' : ''} `}>
          {isInPool ? <TableCellInPool /> : null}
        </TCellInPool>
      )}
      <td>
        <PoolLabel
          isVisible={isVisible}
          imageBaseUrl={imageBaseUrl}
          poolData={poolDataCachedOrApi}
          poolListProps={{
            searchText: searchText,
            searchTextByTokensAndAddresses,
            searchTextByOther,
            onClick: handleCellClick,
          }}
          tokensMapper={tokensMapper}
        />
      </td>
      {isMdUp ? (
        <>
          <td className="right">
            <TableCellRewardsBase base={rewardsApy?.base} isHighlight={sortBy === 'rewardsBase'} poolData={poolData} />
          </td>
          <td className="right">
            <TableCellRewardsCrv isHighlight={sortBy === 'rewardsCrv'} poolData={poolData} rewardsApy={rewardsApy} />
            <TableCellRewardsOthers isHighlight={sortBy === 'rewardsOther'} rewardsApy={rewardsApy} />
            <TableCellRewardsGauge gauge={poolData?.pool?.gauge} searchText={searchText} />
          </td>
        </>
      ) : (
        <td className="right">
          <TCellRewards
            poolData={poolData}
            isHighlightBase={sortBy === 'rewardsBase'}
            isHighlightCrv={sortBy === 'rewardsCrv'}
            isHighlightOther={sortBy === 'rewardsOther'}
            rewardsApy={rewardsApy}
            searchText={Object.keys(searchTextByOther).length > 0 ? searchText : ''}
          />
        </td>
      )}
      <td className="right">
        <TableCellVolume isHighLight={sortBy === 'volume'} volumeCached={volumeCached} volume={volume} />
      </td>
      <td className="right">
        <TableCellTvl isHighLight={sortBy === 'tvl'} tvlCached={tvlCached} tvl={tvl} />
      </td>
    </Item>
  )
}

TableRow.defaultProps = {
  className: '',
}

export const TCellInPool = styled.td`
  &.active {
    color: var(--box--primary--color);
    background-color: var(--table_detail_row--active--background-color);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    border-bottom: none;
  }
`

export const Item = styled.tr`
  &.pending {
    height: 3.25rem;
  }

  :hover {
    background-color: var(--table_row--hover--color);
  }
`

export default TableRow
