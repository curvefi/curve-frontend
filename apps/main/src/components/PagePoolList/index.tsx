import type { ColumnKeys, PagePoolList, SearchParams } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

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
import ConnectWallet from '@/components/ConnectWallet'

const PoolList = ({
  rChainId,
  curve,
  isLite,
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
  const provider = useStore((state) => state.wallet.getProvider(''))
  const network = useStore((state) => state.networks.networks[rChainId])

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
  const poolDatasCached = useMemo(() => Object.values(poolDataMapperCached ?? {}), [poolDataMapperCached])

  const isReady = useMemo(() => {
    // volume
    const haveVolumeMapper = typeof volumeMapper !== 'undefined' && Object.keys(volumeMapper).length >= 0
    const volumeCacheOrApi = volumeMapper || volumeMapper || {}
    const haveVolume = haveVolumeMapper || Object.keys(volumeCacheOrApi).length > 0

    // tvl
    const haveTvlMapper = typeof tvlMapper !== 'undefined' && Object.keys(tvlMapper).length >= 0
    const tvlCacheOrApi = tvlMapper || tvlMapperCached || {}
    const haveTvl = haveTvlMapper || Object.keys(tvlCacheOrApi).length > 0

    return isLite ? haveTvl : haveVolume
  }, [isLite, tvlMapper, tvlMapperCached, volumeMapper])

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
        searchParams,
        sortSearchTextLast,
        typeof poolDataMapper !== 'undefined' ? poolDatas : undefined,
        poolDatasCached,
        rewardsApyMapper ?? {},
        volumeMapper ?? {},
        volumeMapperCached ?? {},
        tvlMapper ?? {},
        tvlMapperCached ?? {},
        userPoolList ?? {},
        campaignRewardsMapper,
      )
    },
    [
      campaignRewardsMapper,
      poolDataMapper,
      poolDatas,
      poolDatasCached,
      rChainId,
      rewardsApyMapper,
      setFormValues,
      sortSearchTextLast,
      tvlMapper,
      tvlMapperCached,
      userPoolList,
      volumeMapper,
      volumeMapperCached,
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
    if (!isReady || !searchParams) return

    updateFormValues(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, chainId, signerAddress, searchParams])

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
              columnKeys={columnKeys}
              isLite={isLite}
              isReadyRewardsApy={isReady && rewardsApyMapper && Object.keys(rewardsApyMapper).length > 0}
              isReadyTvl={isReady && tvlMapper && Object.keys(tvlMapper).length > 0}
              isReadyVolume={isReady && volumeMapper && (Object.keys(volumeMapper).length > 0 || formStatus.noResult)}
              searchParams={sortSearchTextLast ? { ...searchParams, sortBy: '' } : searchParams}
              tableLabels={tableLabels}
              updatePath={updatePath}
            />
          )}
          <Tbody $borderBottom>
            {isReady && formStatus.noResult ? (
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
