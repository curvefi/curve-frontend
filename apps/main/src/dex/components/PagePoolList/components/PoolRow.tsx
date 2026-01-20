import { useCallback, useMemo } from 'react'
import { TableRowProps, TableRow } from '@/dex/components/PagePoolList/components/TableRow'
import { TableRowMobile } from '@/dex/components/PagePoolList/components/TableRowMobile'
import type {
  ColumnKeys,
  PoolListTableLabel,
  SearchParams,
  SearchTermMapper,
} from '@/dex/components/PagePoolList/types'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { parseSearchTermMapper } from '@/dex/hooks/useSearchTermMapper'
import { getUserActiveKey } from '@/dex/store/createUserSlice'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, ChainId } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { TrSearchedTextResult } from '@ui/Table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'

interface PoolRowProps {
  poolId: string
  index: number
  isCrvRewardsEnabled: boolean
  rChainId: ChainId
  columnKeys: ColumnKeys[]
  searchParams: SearchParams
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

export const PoolRow = ({
  poolId,
  index,
  isCrvRewardsEnabled,
  rChainId,
  columnKeys,
  searchParams,
  showInPoolColumn,
  tableLabels,
  searchTermMapper,
  showDetail,
  setShowDetail,
  curve,
}: PoolRowProps) => {
  const push = useNavigate()
  const userActiveKey = getUserActiveKey(curve)

  const isMobile = useIsMobile()
  const poolDataCached = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[poolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[poolId])
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[poolId])
  const searchedByAddresses = useStore((state) => state.poolList.searchedByAddresses[poolId])
  const tvlCached = useStore((state) => state.storeCache.tvlMapper[rChainId]?.[poolId])
  const tvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[poolId])
  const isInPool = useStore((state) => state.user.poolList[userActiveKey]?.[poolId])
  const volumeCached = useStore((state) => state.storeCache.volumeMapper[rChainId]?.[poolId])
  const volume = useStore((state) => state.pools.volumeMapper[rChainId]?.[poolId])
  const { data: network } = useNetworkByChain({ chainId: rChainId })

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
      push(getPath({ network: network.id }, `${ROUTE.PAGE_POOLS}/${poolId}${ROUTES[formType ?? 'deposit']}`))
    },
    [push, network.id, poolId],
  )

  const tableRowProps: Omit<TableRowProps, 'isMdUp'> = {
    index,
    isCrvRewardsEnabled,
    searchParams,
    isInPool,
    blockchainId: network.networkId,
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
  }

  return (
    <>
      {isMobile ? (
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
          isMobile={isMobile}
          result={searchedByAddresses}
          searchTermMapper={parsedSearchTermMapper}
          network={network}
        />
      )}
    </>
  )
}
