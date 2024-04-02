import type { PoolListTableLabel, SearchParams } from '@/components/PagePoolList/types'
import { ROUTE } from '@/constants'
import TableRowMobile from '@/components/PagePoolList/components/TableRowMobile'
import TableRow from '@/components/PagePoolList/components/TableRow'
import React, { useCallback } from 'react'
import useStore from '@/store/useStore'
import { getUserActiveKey } from '@/store/createUserSlice'
import { useNavigate } from 'react-router-dom'

interface PoolRowProps {
  poolId: string,
  rChainId: ChainId,
  searchParams: SearchParams,
  imageBaseUrl: string,
  showInPoolColumn: boolean,
  tableLabels: PoolListTableLabel,
  tokensMapper: TokensMapper,
  showDetail: string,
  setShowDetail: (value: (((prevState: string) => string) | string)) => void,
  curve: CurveApi | null,
}

export function PoolRow({
                       poolId,
                       rChainId,
                       searchParams,
                       imageBaseUrl,
                       showInPoolColumn,
                       tableLabels,
                       tokensMapper,
                       showDetail,
                       setShowDetail,
                       curve,
                     }: PoolRowProps) {
  const navigate = useNavigate()
  const userActiveKey = getUserActiveKey(curve);

  const formValues = useStore((state) => state.poolList.formValues);
  const isMdUp = useStore((state) => state.isMdUp);
  const isXSmDown = useStore((state) => state.isXSmDown);
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId]);
  const poolDatasMapper = useStore((state) => state.pools.poolsMapper[rChainId]);
  const rewardsApyMapper = useStore((state) => state.pools.rewardsApyMapper[rChainId]);
  const tvlMapperCached = useStore((state) => state.storeCache.tvlMapper[rChainId]);
  const tvlMapper = useStore((state) => state.pools.tvlMapper[rChainId]);
  const userPoolList = useStore((state) => state.user.poolList[userActiveKey]);
  const themeType = useStore((state) => state.themeType);
  const volumeMapperCached = useStore((state) => state.storeCache.volumeMapper[rChainId]);
  const volumeMapper = useStore((state) => state.pools.volumeMapper[rChainId]);

  const handleCellClick = useCallback((target: EventTarget, formType?: 'swap' | 'withdraw') => {
    const { nodeName } = target as HTMLElement
    if (nodeName !== 'A') {
      // prevent click-through link from tooltip
      if (formType) {
        navigate(`${poolId}${formType === 'withdraw' ? ROUTE.PAGE_POOL_WITHDRAW : ROUTE.PAGE_SWAP}`)
      } else {
        navigate(`${poolId}${ROUTE.PAGE_POOL_DEPOSIT}`)
      }
    }
  }, [navigate, poolId]);

  const poolDataCached = poolDataMapperCached?.[poolId]
  const poolData = poolDatasMapper?.[poolId]

  const tableRowProps = {
    rChainId,
    formValues,
    searchParams,
    isInPool: userPoolList?.[poolId],
    imageBaseUrl,
    poolId,
    poolData,
    poolDataCachedOrApi: poolData ?? poolDataCached,
    rewardsApy: rewardsApyMapper?.[poolId],
    showInPoolColumn: showInPoolColumn,
    tableLabel: tableLabels,
    tokensMapper,
    tvlCached: tvlMapperCached?.[poolId],
    tvl: tvlMapper?.[poolId],
    volumeCached: volumeMapperCached?.[poolId],
    volume: volumeMapper?.[poolId],
    handleCellClick
  }

  return isXSmDown ? (
    <TableRowMobile
      key={poolId}
      showDetail={showDetail}
      themeType={themeType}
      setShowDetail={setShowDetail}
      {...tableRowProps}
    />
  ) : (
    <TableRow key={poolId} isMdUp={isMdUp} {...tableRowProps} />
  )
}