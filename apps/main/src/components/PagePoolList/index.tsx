import type { PagePoolList, SearchParams } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_FORM_STATUS, getPoolDatasCached, getPoolListActiveKey } from '@/store/createPoolListSlice'
import { REFRESH_INTERVAL } from '@/constants'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

import { getImageBaseUrl, getVolumeTvlStr } from '@/utils/utilsCurvejs'
import { getRewardsApyStr, getUserPoolListStr } from '@/components/PagePoolList/utils'
import { getUserActiveKey } from '@/store/createUserSlice'
import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Table, { Tbody } from '@/ui/Table'
import TableHead from '@/components/PagePoolList/components/TableHead'
import TableHeadMobile from '@/components/PagePoolList/components/TableHeadMobile'
import TableSettings from '@/components/PagePoolList/components/TableSettings/TableSettings'
import TableRowNoResult from '@/components/PagePoolList/components/TableRowNoResult'
import { PoolRow } from '@/components/PagePoolList/components/PoolRow'
import ConnectWallet from '@/components/ConnectWallet'

const PoolList = ({
  rChainId,
  curve,
  searchParams,
  sortSearchTextLast,
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
  const poolDatas = useStore((state) => state.pools.pools[rChainId])
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
  const provider = useStore((state) => state.wallet.getProvider(''))

  const [showDetail, setShowDetail] = useState('')

  const result =
    results[activeKey] ?? activeKey.split('-')[0] === prevActiveKey.split('-')[0] ? results[prevActiveKey] : undefined

  const { signerAddress = '' } = curve ?? {}
  const poolDatasCached = getPoolDatasCached(poolDataMapperCached)
  const poolDatasCachedOrApi = poolDatas ?? poolDatasCached
  const poolDatasLength = (poolDatasCachedOrApi ?? []).length
  const tvlMapperCachedOrApi = useMemo(() => tvlMapper ?? tvlMapperCached ?? {}, [tvlMapper, tvlMapperCached])
  const volumeMapperCachedOrApi = useMemo(
    () => volumeMapper ?? volumeMapperCached ?? {},
    [volumeMapper, volumeMapperCached]
  )

  const rewardsApyMapperStr = useMemo(() => getRewardsApyStr(rewardsApyMapper, {}), [rewardsApyMapper])

  const userPoolListStr = useMemo(() => getUserPoolListStr(userPoolList), [userPoolList])
  const volumeMapperStr = useMemo(() => getVolumeTvlStr(volumeMapper), [volumeMapper])
  const imageBaseUrl = getImageBaseUrl(rChainId)
  const isReady = (poolDatasLength > 0 && volumeMapperStr !== '') || (poolDatasLength === 0 && formStatus.noResult)
  const haveMapperStr = useMemo(() => {
    return Object.keys(tvlMapperCachedOrApi ?? {}).length > 0 && !!`${volumeMapperStr}${rewardsApyMapperStr}`
  }, [rewardsApyMapperStr, tvlMapperCachedOrApi, volumeMapperStr])

  const updateFormValues = useCallback(
    (searchParams: SearchParams) => {
      setFormValues(
        rChainId,
        searchParams,
        sortSearchTextLast,
        poolDatasCachedOrApi,
        rewardsApyMapper,
        volumeMapperCachedOrApi,
        tvlMapperCachedOrApi,
        userPoolList,
        campaignRewardsMapper
      )
    },
    [
      rChainId,
      poolDatasCachedOrApi,
      rewardsApyMapper,
      setFormValues,
      sortSearchTextLast,
      tvlMapperCachedOrApi,
      volumeMapperCachedOrApi,
      userPoolList,
      campaignRewardsMapper,
    ]
  )

  usePageVisibleInterval(
    useCallback(() => {
      if (curve && rewardsApyMapper && Object.keys(rewardsApyMapper).length > 0) {
        fetchPoolsRewardsApy(rChainId, poolDatas)
      }
    }, [curve, fetchPoolsRewardsApy, poolDatas, rChainId, rewardsApyMapper]),
    REFRESH_INTERVAL['11m'],
    isPageVisible
  )

  // init
  useEffect(() => {
    if (!haveMapperStr || !searchParams) return

    updateFormValues(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haveMapperStr, userPoolListStr, searchParams, curve?.signerAddress])

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  const showInPoolColumn = !!curve?.signerAddress
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
        poolDatasCachedOrApi={poolDatasCachedOrApi}
        result={result}
        signerAddress={signerAddress}
        searchParams={searchParams}
        tableLabels={tableLabels}
        updatePath={updatePath}
      />

      {!provider ? (
        <ConnectWalletWrapper>
          <ConnectWallet
            description={t`Connect wallet to view pool list`}
            connectText={t`Connect Wallet`}
            loadingText={t`Connecting`}
          />
        </ConnectWalletWrapper>
      ) : (
        <Table cellPadding={0} cellSpacing={0}>
          {isXSmDown ? (
            <TableHeadMobile showInPoolColumn={showInPoolColumn} />
          ) : (
            <TableHead
              isMdUp={isMdUp}
              isReadyRewardsApy={isReady && rewardsApyMapper && Object.keys(rewardsApyMapper).length > 0}
              isReadyTvl={isReady && tvlMapper && Object.keys(tvlMapper).length > 0}
              isReadyVolume={isReady && volumeMapper && (Object.keys(volumeMapper).length > 0 || formStatus.noResult)}
              searchParams={sortSearchTextLast ? { ...searchParams, sortBy: '' } : searchParams}
              showInPoolColumn={showInPoolColumn}
              tableLabels={tableLabels}
              updatePath={updatePath}
            />
          )}
          <Tbody $borderBottom>
            {formStatus.noResult ? (
              <TableRowNoResult
                colSpan={colSpan}
                searchParams={searchParams}
                signerAddress={signerAddress}
                updatePath={updatePath}
              />
            ) : Array.isArray(result) &&
              Object.keys(poolDataMapperCached ?? {}).length &&
              Object.keys(tvlMapperCached ?? {}).length ? (
              <>
                {result.map((poolId: string, index: number) => (
                  <PoolRow
                    key={poolId}
                    index={index}
                    poolId={poolId}
                    rChainId={rChainId}
                    searchParams={searchParams}
                    imageBaseUrl={imageBaseUrl}
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
      )}
    </>
  )
}

const ConnectWalletWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`

export default PoolList
