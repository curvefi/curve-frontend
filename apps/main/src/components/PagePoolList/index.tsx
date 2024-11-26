import type { ColumnKeys, PagePoolList, SearchParams } from '@/components/PagePoolList/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { COLUMN_KEYS } from '@/components/PagePoolList/utils'
import { DEFAULT_FORM_STATUS, getPoolListActiveKey } from '@/store/createPoolListSlice'
import { REFRESH_INTERVAL } from '@/constants'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'
import { getUserActiveKey } from '@/store/createUserSlice'
import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Table, { Tbody } from '@/ui/Table'
import TableHead from '@/components/PagePoolList/components/TableHead'
import TableHeadMobile from '@/components/PagePoolList/components/TableHeadMobile'
import TableSettings from '@/components/PagePoolList/components/TableSettings/TableSettings'
import TableRowNoResult from '@/components/PagePoolList/components/TableRowNoResult'
import { PoolRow } from '@/components/PagePoolList/components/PoolRow'
import { useApiTvlMapping, useApiPoolMapping, useApiVolumeMapping } from '@/entities/pool'
import { useTvl } from 'lend/src/entities/chain'

const PoolList = ({
  rChainId,
  curve,
  isLite,
  searchParams,
  searchTermMapper,
  tableLabels,
  updatePath,
}: PagePoolList) => {
  const campaignRewardsMapper = useCampaignRewardsMapper()
  const activeKey = getPoolListActiveKey(rChainId, searchParams)
  const prevActiveKey = useStore((state) => state.poolList.activeKey)
  const formStatus = useStore((state) => state.poolList.formStatus[activeKey] ?? DEFAULT_FORM_STATUS)
  const isMdUp = useStore((state) => state.isMdUp)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const results = useStore((state) => state.poolList.result)
  const rewardsApyMapper = useStore((state) => state.pools.rewardsApyMapper[rChainId])
  const showHideSmallPools = useStore((state) => state.poolList.showHideSmallPools)
  const tvlMapperCached = useStore((state) => state.storeCache.tvlMapper[rChainId])
  const tvlMapper = useStore((state) => state.pools.tvlMapper[rChainId])
  const userActiveKey = getUserActiveKey(curve)
  const userPoolList = useStore((state) => state.user.poolList[userActiveKey])
  const volumeMapperCached = useStore((state) => state.storeCache.volumeMapper[rChainId])
  const volumeMapper = useStore((state) => state.pools.volumeMapper[rChainId])
  const fetchPoolsRewardsApy = useStore((state) => state.pools.fetchPoolsRewardsApy)
  const setFormValues = useStore((state) => state.poolList.setFormValues)
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)
  const network = useStore((state) => state.networks.networks[rChainId])

  const poolMappingApi = useApiPoolMapping(rChainId)
  const tvlMappingApi = useApiTvlMapping(rChainId)
  const volumeMappingApi = useApiVolumeMapping(rChainId)

  const [showDetail, setShowDetail] = useState('')

  const result = useMemo(
    () =>
      (results[activeKey] ?? activeKey.split('-')[0] === prevActiveKey.split('-')[0])
        ? results[prevActiveKey]
        : undefined,
    [activeKey, prevActiveKey, results],
  )

  const { chainId, signerAddress = '' } = curve ?? {}
  const showInPoolColumn = !!signerAddress

  const poolDatas = useMemo(() => Object.values(poolDataMapper ?? {}), [poolDataMapper])
  const poolDatasCached = useMemo(() => Object.values(poolDataMapperCached ?? poolMappingApi ?? {}), [poolDataMapperCached, poolMappingApi])

  const isReady = useMemo(() => {
    const haveVolume = Object.keys(volumeMapper ?? volumeMappingApi ?? {}).length >= 0
    const haveTvl = Object.keys(tvlMapper ?? tvlMapperCached ?? tvlMappingApi ?? {}).length >= 0
    return haveTvl && (isLite || haveVolume)
  }, [volumeMapper, volumeMappingApi, tvlMapper, tvlMapperCached, tvlMappingApi, isLite])

  const isReadyWithApiData = useMemo(() => {
    const haveVolume = Object.keys(volumeMapper ?? {}).length >= 0
    const haveTvl = Object.keys(tvlMapper ?? {}).length >= 0
    return haveTvl && (isLite || haveVolume)
  }, [isLite, tvlMapper, volumeMapper])

  const columnKeys = useMemo(() => {
    let keys: ColumnKeys[] = []
    if (showInPoolColumn) keys.push(COLUMN_KEYS.inPool)
    keys.push(COLUMN_KEYS.poolName)

    if (isLite) {
      return keys.concat([COLUMN_KEYS.rewardsLite, COLUMN_KEYS.tvl])
    }

    isMdUp ? keys.push(COLUMN_KEYS.rewardsDesktop) : keys.push(COLUMN_KEYS.rewardsMobile)
    return keys.concat([COLUMN_KEYS.volume, COLUMN_KEYS.tvl])
  }, [isLite, isMdUp, showInPoolColumn])

  const updateFormValues = useCallback(
    (searchParams: SearchParams) => {
      setFormValues(
        rChainId,
        isLite,
        searchParams,
        typeof poolDataMapper !== 'undefined' ? poolDatas : undefined,
        poolDatasCached,
        rewardsApyMapper ?? {},
        volumeMapper ?? {},
        volumeMapperCached ?? volumeMappingApi ?? {},
        tvlMapper ?? {},
        tvlMapperCached ?? tvlMappingApi ?? {},
        userPoolList ?? {},
        campaignRewardsMapper,
      )
    },
    [
      isLite,
      campaignRewardsMapper,
      poolDataMapper,
      poolDatas,
      poolDatasCached,
      rChainId,
      rewardsApyMapper,
      setFormValues,
      tvlMapper,
      tvlMapperCached,
      tvlMappingApi,
      userPoolList,
      volumeMapper,
      volumeMapperCached,
      volumeMappingApi,
    ],
  )

  usePageVisibleInterval(
    useCallback(() => {
      if (curve && rewardsApyMapper && Object.keys(rewardsApyMapper).length > 0) {
        fetchPoolsRewardsApy(rChainId, poolDatas)
      }
    }, [curve, fetchPoolsRewardsApy, poolDatas, rChainId, rewardsApyMapper]),
    REFRESH_INTERVAL['11m'],
    isPageVisible,
  )

  // init
  useEffect(() => {
    if ((!isReady && !isReadyWithApiData) || !searchParams) return

    updateFormValues(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isReadyWithApiData, chainId, signerAddress, searchParams])

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  let colSpan = isMdUp ? 7 : 4
  if (showHideSmallPools) {
    colSpan++
  }

  return (
    <>
      <TableSettings
        isReady={isReady}
        activeKey={activeKey}
        rChainId={rChainId}
        isLite={isLite}
        poolDatasCachedOrApi={poolDatas ?? poolDatasCached}
        result={result}
        signerAddress={signerAddress}
        searchParams={searchParams}
        tableLabels={tableLabels}
        updatePath={updatePath}
      />

      <Table cellPadding={0} cellSpacing={0}>
        {isXSmDown ? (
          <TableHeadMobile showInPoolColumn={showInPoolColumn} />
        ) : (
          <TableHead
            columnKeys={columnKeys}
            isLite={isLite}
            isReadyRewardsApy={!!rewardsApyMapper}
            isReadyTvl={!!tvlMapper}
            isReadyVolume={Object.keys(volumeMapper ?? volumeMappingApi ?? {}).length > 0}
            searchParams={searchParams}
            tableLabels={tableLabels}
            updatePath={updatePath}
          />
        )}
        <Tbody $borderBottom>
          {isReadyWithApiData && formStatus.noResult ? (
            <TableRowNoResult
              colSpan={colSpan}
              searchParams={searchParams}
              signerAddress={signerAddress}
              updatePath={updatePath}
            />
          ) : isReady && Array.isArray(result) ? (
            <>
              {result.map((poolId: string, index: number) => (
                <PoolRow
                  key={poolId}
                  index={index}
                  columnKeys={columnKeys}
                  isLite={isLite}
                  poolId={poolId}
                  rChainId={rChainId}
                  searchParams={searchParams}
                  imageBaseUrl={network?.imageBaseUrl ?? ''}
                  showInPoolColumn={showInPoolColumn}
                  tableLabels={tableLabels}
                  searchTermMapper={searchTermMapper}
                  showDetail={showDetail}
                  setShowDetail={setShowDetail}
                  curve={curve}
                />
              ))}
            </>
          ) : (
            <tr>
              <td colSpan={colSpan}>
                <SpinnerWrapper>
                  <Spinner />
                </SpinnerWrapper>
              </td>
            </tr>
          )}
        </Tbody>
      </Table>
    </>
  )
}

export default PoolList
