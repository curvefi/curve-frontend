import type { FilterKey, PagePoolList, PoolListFilter, SearchParams } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFocusRing } from '@react-aria/focus'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import {
  DEFAULT_FORM_STATUS,
  DEFAULT_SEARCH_PARAMS,
  getPoolDatasCached,
  getPoolListActiveKey,
} from '@/store/createPoolListSlice'
import { REFRESH_INTERVAL, ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

import { getImageBaseUrl, getVolumeTvlStr } from '@/utils/utilsCurvejs'
import { getRewardsApyStr, getUserPoolListStr } from '@/components/PagePoolList/utils'
import { getUserActiveKey } from '@/store/createUserSlice'
import networks from '@/networks'
import useTokensMapper from '@/hooks/useTokensMapper'

import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import Checkbox from '@/ui/Checkbox'
import DialogSortDesktop from '@/components/PagePoolList/components/DialogSort/DialogSortDesktop'
import DialogSortMobile from '@/components/PagePoolList/components/DialogSort/DialogSortMobile'
import SearchInput from '@/ui/SearchInput'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Table from '@/ui/Table'
import TableHead from '@/components/PagePoolList/components/TableHead'
import TableHeadMobile from '@/components/PagePoolList/components/TableHeadMobile'
import TableRow from '@/components/PagePoolList/components/TableRow'
import TableRowMobile from '@/components/PagePoolList/components/TableRowMobile'
import TableButtonFilters from '@/ui/TableButtonFilters'
import TableButtonFiltersMobile from '@/ui/TableButtonFiltersMobile'

const PoolList = ({ rChainId, curve, searchParams, tableLabels, updatePath }: PagePoolList) => {
  const navigate = useNavigate()
  const settingsRef = useRef<HTMLDivElement>(null)
  const { isFocusVisible, focusProps } = useFocusRing()

  const { tokensMapper } = useTokensMapper(rChainId)
  const activeKey = getPoolListActiveKey(rChainId, searchParams)
  const prevActiveKey = useStore((state) => state.poolList.activeKey)
  const formStatus = useStore((state) => state.poolList.formStatus[activeKey] ?? DEFAULT_FORM_STATUS)
  const formValues = useStore((state) => state.poolList.formValues)
  const isMdUp = useStore((state) => state.isMdUp)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])
  const poolDatasMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const poolDatas = useStore((state) => state.pools.pools[rChainId])
  const results = useStore((state) => state.poolList.result)
  const resultRewardsCrvCount = useStore((state) => state.poolList.resultRewardsCrvCount)
  const resultRewardsOtherCount = useStore((state) => state.poolList.resultRewardsOtherCount)
  const rewardsApyMapperCached = useStore((state) => state.storeCache.rewardsApyMapper[rChainId])
  const rewardsApyMapper = useStore((state) => state.pools.rewardsApyMapper[rChainId])
  const showHideSmallPools = useStore((state) => state.poolList.showHideSmallPools)
  const tvlMapperCached = useStore((state) => state.storeCache.tvlMapper[rChainId])
  const tvlMapper = useStore((state) => state.pools.tvlMapper[rChainId])
  const userActiveKey = getUserActiveKey(curve)
  const userPoolList = useStore((state) => state.user.poolList[userActiveKey])
  const userPoolListLoaded = useStore((state) => state.user.poolListLoaded)
  const userPoolListError = useStore((state) => state.user.poolListError)
  const themeType = useStore((state) => state.themeType)
  const volumeMapperCached = useStore((state) => state.storeCache.volumeMapper[rChainId])
  const volumeMapper = useStore((state) => state.pools.volumeMapper[rChainId])
  const fetchPoolsRewardsApy = useStore((state) => state.pools.fetchPoolsRewardsApy)
  const fetchMissingPoolsRewardsApy = useStore((state) => state.pools.fetchMissingPoolsRewardsApy)
  const setFormValues = useStore((state) => state.poolList.setFormValues)

  const [showDetail, setShowDetail] = useState('')

  const result =
    results[activeKey] ?? activeKey.split('-')[0] === prevActiveKey.split('-')[0] ? results[prevActiveKey] : undefined
  const haveSigner = !!curve?.signerAddress
  const poolDatasCached = getPoolDatasCached(poolDataMapperCached)
  const poolDatasCachedOrApi = poolDatas ?? poolDatasCached
  const poolDatasLength = (poolDatasCachedOrApi ?? []).length
  const rewardsApyMapperCachedOrApi = useMemo(
    () => rewardsApyMapper ?? rewardsApyMapperCached ?? {},
    [rewardsApyMapper, rewardsApyMapperCached]
  )
  const tvlMapperCachedOrApi = useMemo(() => tvlMapper ?? tvlMapperCached ?? {}, [tvlMapper, tvlMapperCached])
  const volumeMapperCachedOrApi = useMemo(
    () => volumeMapper ?? volumeMapperCached ?? {},
    [volumeMapper, volumeMapperCached]
  )

  const rewardsApyMapperStr = useMemo(
    () => getRewardsApyStr(rewardsApyMapper, rewardsApyMapperCached),
    [rewardsApyMapper, rewardsApyMapperCached]
  )

  const userPoolListStr = useMemo(() => getUserPoolListStr(userPoolList), [userPoolList])
  const volumeMapperStr = useMemo(() => getVolumeTvlStr(volumeMapper), [volumeMapper])
  const imageBaseUrl = getImageBaseUrl(rChainId)
  const isReady = (poolDatasLength > 0 && volumeMapperStr !== '') || (poolDatasLength === 0 && formStatus.noResult)

  const FILTERS: PoolListFilter[] = useMemo(
    () => [
      { key: 'all', label: t`ALL` },
      { key: 'usd', label: 'USD' },
      { key: 'btc', label: 'BTC' },
      { key: 'kava', label: 'KAVA' },
      { key: 'eth', label: 'ETH' },
      { key: 'crvusd', label: t`crvUSD` },
      { key: 'tricrypto', label: t`Tricrypto` },
      { key: 'crypto', label: t`Crypto` },
      { key: 'stableng', label: t`Stable NG` },
      { key: 'user', label: t`My Pools` },
    ],
    []
  )

  const updateFormValues = useCallback(
    (searchParams: SearchParams) => {
      setFormValues(
        rChainId,
        searchParams,
        poolDatasCachedOrApi,
        rewardsApyMapperCachedOrApi,
        volumeMapperCachedOrApi,
        tvlMapperCachedOrApi,
        userPoolList
      )
    },
    [
      rChainId,
      poolDatasCachedOrApi,
      rewardsApyMapperCachedOrApi,
      setFormValues,
      tvlMapperCachedOrApi,
      volumeMapperCachedOrApi,
      userPoolList,
    ]
  )

  usePageVisibleInterval(
    () => {
      if (curve && rewardsApyMapper && Object.keys(rewardsApyMapper).length > 0) {
        fetchPoolsRewardsApy(rChainId, poolDatas)
      }
    },
    REFRESH_INTERVAL['11m'],
    isPageVisible
  )

  // init
  useEffect(() => {
    updateFormValues(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvlMapperCachedOrApi, volumeMapperStr, userPoolListStr, rewardsApyMapperStr, searchParams, curve?.signerAddress])

  const showInPoolColumn = !!curve?.signerAddress
  let colSpan = isMdUp ? 7 : 4
  if (showHideSmallPools) {
    colSpan++
  }

  const parsedFilters = useMemo(() => {
    let filters = FILTERS.filter((f) => {
      return networks[rChainId].poolFilters.indexOf(f.key) !== -1
    })

    if (!haveSigner) {
      filters = filters.filter((f) => f.key !== 'user')
    }

    if (Array.isArray(filters)) {
      const parsedFilters: { [key: string]: { id: string; displayName: string } } = {}
      for (const { key, label } of filters) {
        parsedFilters[key] = { id: key, displayName: label }
      }

      return parsedFilters
    }
  }, [FILTERS, haveSigner, rChainId])

  return (
    <>
      <SearchWrapper>
        <SearchInput
          id="inpSearchPool"
          placeholder={t`Search by pool name, pool address, token name or token address`}
          className={isFocusVisible ? 'focus-visible' : ''}
          {...focusProps}
          value={searchParams.searchText}
          handleInputChange={(val) => updatePath({ searchText: val })}
          handleSearchClose={() => updatePath({ searchText: '' })}
        />
      </SearchWrapper>
      <Box ref={settingsRef} grid gridRowGap={2}>
        <TableFilterSettings>
          {!isXSmDown && parsedFilters && (
            <TableButtonFilters
              disabled={false}
              filters={parsedFilters}
              filterKey={searchParams.filterKey}
              isLoading={!isReady || formStatus.isLoading}
              resultsLength={result?.length}
              updateRouteFilterKey={(filterKey) => updatePath({ filterKey: filterKey as FilterKey })}
            />
          )}
          <Box>
            <Box flex gridColumnGap={2}>
              {!isXSmDown && (
                <DialogSortDesktop searchParams={searchParams} tableLabels={tableLabels} updatePath={updatePath} />
              )}
              {networks[rChainId].showHideSmallPoolsCheckbox ||
              (typeof poolDatasCachedOrApi !== 'undefined' && poolDatasLength > 10) ? (
                <Checkbox
                  isDisabled={searchParams.filterKey === 'user'}
                  isSelected={searchParams.filterKey === 'user' ? false : searchParams.hideSmallPools}
                  onChange={(val) => {
                    updatePath({ hideSmallPools: val })
                    fetchMissingPoolsRewardsApy(rChainId, poolDatas)
                  }}
                >
                  {t`Hide very small pools`}
                </Checkbox>
              ) : null}
            </Box>
            {isXSmDown && parsedFilters && (
              <Box flex gridColumnGap={2} margin="1rem 0 0 0.25rem">
                <TableButtonFiltersMobile
                  filters={parsedFilters}
                  filterKey={searchParams.filterKey}
                  updateRouteFilterKey={(filterKey) => updatePath({ filterKey: filterKey as FilterKey })}
                />
                <DialogSortMobile searchParams={searchParams} tableLabels={tableLabels} updatePath={updatePath} />
              </Box>
            )}
          </Box>
        </TableFilterSettings>
      </Box>
      <StyledTable cellPadding={0} cellSpacing={0}>
        {isXSmDown ? (
          <TableHeadMobile showInPoolColumn={showInPoolColumn} />
        ) : (
          <TableHead
            isMdUp={isMdUp}
            isReadyRewardsApy={isReady && rewardsApyMapper && Object.keys(rewardsApyMapper).length > 0}
            isReadyTvl={isReady && tvlMapper && Object.keys(tvlMapper).length > 0}
            isReadyVolume={isReady && volumeMapper && (Object.keys(volumeMapper).length > 0 || formStatus.noResult)}
            resultRewardsCrvCount={resultRewardsCrvCount}
            resultRewardsOtherCount={resultRewardsOtherCount}
            searchParams={searchParams}
            showInPoolColumn={showInPoolColumn}
            tableLabels={tableLabels}
            updatePath={updatePath}
          />
        )}
        <tbody>
          {formStatus.noResult ? (
            <tr>
              <TableRowNotFound colSpan={colSpan}>
                {searchParams.filterKey === 'user' && userPoolListLoaded && !!userPoolListError ? (
                  <>{t`Sorry, we are unable to load your pools.`}</>
                ) : searchParams.searchText.length > 0 ? (
                  searchParams.filterKey === 'all' ? (
                    <>
                      {t`Didn't find what you're looking for?`}{' '}
                      <ExternalLink $noStyles href="https://t.me/curvefi">
                        {t`Join the Telegram`}
                      </ExternalLink>
                    </>
                  ) : (
                    <>
                      {t`No pool found for "${searchParams.searchText}". Feel free to search other tabs, or`}{' '}
                      <Button variant="text" onClick={() => updatePath(DEFAULT_SEARCH_PARAMS)}>
                        {t`view all pools.`}
                      </Button>
                    </>
                  )
                ) : (
                  <>{t`No pool found in this category`}</>
                )}
              </TableRowNotFound>
            </tr>
          ) : Array.isArray(result) &&
            Object.keys(poolDataMapperCached ?? {}).length &&
            Object.keys(volumeMapperCached ?? {}).length &&
            Object.keys(tvlMapperCached ?? {}).length ? (
            <>
              {result.map((poolId: string) => {
                const handleCellClick = (target: EventTarget, formType?: 'swap' | 'withdraw') => {
                  const { nodeName } = target as HTMLElement
                  if (nodeName !== 'A') {
                    // prevent click-through link from tooltip
                    if (formType) {
                      navigate(`${poolId}${formType === 'withdraw' ? ROUTE.PAGE_POOL_WITHDRAW : ROUTE.PAGE_SWAP}`)
                    } else {
                      navigate(`${poolId}${ROUTE.PAGE_POOL_DEPOSIT}`)
                    }
                  }
                }

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
                  handleCellClick,
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
              })}
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
        </tbody>
      </StyledTable>
    </>
  )
}

const TableRowNotFound = styled.td`
  padding: var(--spacing-5);
  text-align: center;
`

const SearchWrapper = styled(Box)`
  display: grid;
  margin: 1rem 1rem 0 1rem;
  padding-top: 1rem;
  height: var(--header-height);

  background-color: var(--box--secondary--background-color);

  grid-template-columns: 1fr;
`

const TableFilterSettings = styled(Box)`
  align-items: flex-start;
  display: grid;
  margin: 1rem;
  grid-row-gap: var(--spacing-2);

  @media (min-width: ${breakpoints.lg}rem) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

const StyledTable = styled(Table)`
  background-color: var(--table--background-color);

  th,
  th button {
    align-items: flex-end;
    vertical-align: bottom;
    font-size: var(--font-size-2);
    font-family: var(--table_head--font);
    font-weight: bold;
  }

  thead {
    border-bottom: 1px solid var(--border-400);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    tr.row--info {
      border-bottom: 1px solid var(--border-400);
    }

    tr.row--info td,
    th {
      padding: 0.75rem;
      height: 1px;
      line-height: 1;

      &.row-in-pool {
        padding-left: 0.375rem; //6px
        padding-right: 0.375rem; //6px
        padding-top: inherit;
        padding-bottom: inherit;
      }

      &.center {
        text-align: center;
      }

      &.left {
        justify-content: left;
        text-align: left;
      }

      &.right {
        justify-content: right;
        text-align: right;

        > div,
        > div button {
          justify-content: right;
          text-align: right;
        }
      }
    }

    tr.row--info td:not(.row-in-pool),
    th {
      &:first-of-type {
        padding-left: 1rem;
      }

      &:last-of-type {
        padding-right: 1rem;
      }
    }
  }
`

export default PoolList
