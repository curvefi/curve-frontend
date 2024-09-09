import type { PoolListTableLabel, SearchParams } from '@/components/PagePoolList/types'
import { ROUTE } from '@/constants'
import TableRowMobile from '@/components/PagePoolList/components/TableRowMobile'
import TableRow, { TableRowProps } from '@/components/PagePoolList/components/TableRow'
import React, { FunctionComponent, useCallback } from 'react'
import useStore from '@/store/useStore'
import { getUserActiveKey } from '@/store/createUserSlice'
import { useNavigate } from 'react-router-dom'
import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'
import { useLiquidityMapping, usePools, useVolumeMapping } from '@/entities/pool/lib/pool-info'

interface PoolRowProps {
  poolId: string
  index: number
  rChainId: ChainId
  searchParams: SearchParams
  imageBaseUrl: string
  showInPoolColumn: boolean
  tableLabels: PoolListTableLabel
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
  rChainId,
  searchParams,
  imageBaseUrl,
  showInPoolColumn,
  tableLabels,
  showDetail,
  setShowDetail,
  curve,
}) => {
  const navigate = useNavigate()
  const userActiveKey = getUserActiveKey(curve)

  const formValues = useStore((state) => state.poolList.formValues)
  const isMdUp = useStore((state) => state.isMdUp)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const poolDatasMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const rewardsApyMapper = useStore((state) => state.pools.rewardsApyMapper[rChainId])
  const userPoolList = useStore((state) => state.user.poolList[userActiveKey])
  const themeType = useStore((state) => state.themeType)
  const campaignRewardsMapper = useCampaignRewardsMapper()

  const poolDatas = usePools(rChainId)
  const tvlMapper = useLiquidityMapping(rChainId, poolDatas)
  const volumeMapper = useVolumeMapping(rChainId, poolDatas)

  const handleCellClick = useCallback(
    (target: EventTarget, formType?: 'swap' | 'withdraw') => {
      const { nodeName } = target as HTMLElement
      if (nodeName === 'A') {
        return // prevent click-through link from tooltip
      }
      navigate(`${poolId}${ROUTES[formType ?? 'deposit']}`)
    },
    [navigate, poolId]
  )

  const poolData = poolDatasMapper?.[poolId]

  const tableRowProps: Omit<TableRowProps, 'isMdUp'> = {
    index,
    formValues,
    searchParams,
    isInPool: userPoolList?.[poolId],
    imageBaseUrl,
    poolId,
    poolData,
    rewardsApy: rewardsApyMapper?.[poolId],
    showInPoolColumn: showInPoolColumn,
    tvl: tvlMapper?.[poolId],
    volume: volumeMapper?.[poolId],
    handleCellClick,
    campaignRewardsMapper,
  }

  return isXSmDown ? (
    <TableRowMobile
      tableLabel={tableLabels}
      showDetail={showDetail}
      themeType={themeType}
      setShowDetail={setShowDetail}
      {...tableRowProps}
    />
  ) : (
    <TableRow isMdUp={isMdUp} {...tableRowProps} />
  )
}
