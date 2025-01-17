import type { ColumnKeys, PoolListTableLabel, SearchParams, SearchTermMapper } from '@/components/PagePoolList/types'
import { ROUTE } from '@/constants'
import TableRowMobile from '@/components/PagePoolList/components/TableRowMobile'
import TableRow, { TableRowProps } from '@/components/PagePoolList/components/TableRow'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import useStore from '@/store/useStore'
import { getUserActiveKey } from '@/store/createUserSlice'
import { useNavigate } from 'react-router-dom'
import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'
import { parseSearchTermMapper } from '@/hooks/useSearchTermMapper'
import { TrSearchedTextResult } from 'ui/src/Table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { CurveApi, ChainId } from '@/types/main.types'

interface PoolRowProps {
  poolId: string
  index: number
  isLite: boolean
  rChainId: ChainId
  columnKeys: ColumnKeys[]
  searchParams: SearchParams
  imageBaseUrl: string
  showInPoolColumn: boolean
  tableLabels: PoolListTableLabel
  searchTermMapper: SearchTermMapper
  showDetail: string
  setShowDetail: (value: ((prevState: string) => string) | string) => void
  curve: CurveApi | null
}

const ROUTES = {
  swap: ROUTE.PAGE_SWAP,
  withdraw: ROUTE.PAGE_POOL_WITHDRAW,
  deposit: ROUTE.PAGE_POOL_DEPOSIT,
}

export const PoolRow: FunctionComponent<PoolRowProps> = ({
  poolId,
  index,
  isLite,
  rChainId,
  columnKeys,
  searchParams,
  imageBaseUrl,
  showInPoolColumn,
  tableLabels,
  searchTermMapper,
  showDetail,
  setShowDetail,
  curve,
}) => {
  const navigate = useNavigate()
  const userActiveKey = getUserActiveKey(curve)

  const formValues = useStore((state) => state.poolList.formValues)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const poolDataCached = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[poolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[poolId])
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[poolId])
  const searchedByAddresses = useStore((state) => state.poolList.searchedByAddresses[poolId])
  const tvlCached = useStore((state) => state.storeCache.tvlMapper[rChainId]?.[poolId])
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[poolId])
  const isInPool = useStore((state) => state.user.poolList[userActiveKey]?.[poolId])
  const volumeCached = useStore((state) => state.storeCache.volumeMapper[rChainId]?.[poolId])
  const volume = useStore((state) => state.pools.volumeMapper[rChainId]?.[poolId])
  const network = useStore((state) => state.networks.networks[rChainId])
  const campaignRewardsMapper = useCampaignRewardsMapper()

  const theme = useUserProfileStore((state) => state.theme)

  const poolDataCachedOrApi = poolData ?? poolDataCached

  const parsedSearchTermMapper = useMemo(
    () => parseSearchTermMapper(searchedByAddresses, searchTermMapper, poolDataCachedOrApi),
    [poolDataCachedOrApi, searchTermMapper, searchedByAddresses],
  )

  const handleCellClick = useCallback(
    (target: EventTarget, formType?: 'swap' | 'withdraw') => {
      const { nodeName } = target as HTMLElement
      if (nodeName === 'A') {
        return // prevent click-through link from tooltip
      }
      navigate(`${poolId}${ROUTES[formType ?? 'deposit']}`)
    },
    [navigate, poolId],
  )

  const tableRowProps: Omit<TableRowProps, 'isMdUp'> = {
    index,
    isLite,
    formValues,
    searchParams,
    isInPool,
    imageBaseUrl,
    poolId,
    columnKeys,
    poolData,
    poolDataCachedOrApi,
    rewardsApy,
    showInPoolColumn,
    tvlCached,
    tvl,
    volumeCached,
    volume,
    handleCellClick,
    campaignRewardsMapper,
  }

  return (
    <>
      {isXSmDown ? (
        <TableRowMobile
          tableLabel={tableLabels}
          showDetail={showDetail}
          themeType={theme}
          setShowDetail={setShowDetail}
          {...tableRowProps}
        />
      ) : (
        <TableRow {...tableRowProps} />
      )}

      {searchedByAddresses && Object.keys(searchedByAddresses).length > 0 && (
        <TrSearchedTextResult
          colSpan={10}
          id={poolId}
          isMobile={isXSmDown}
          result={searchedByAddresses}
          searchTermMapper={parsedSearchTermMapper}
          scanAddressPath={network.scanAddressPath}
        />
      )}
    </>
  )
}
