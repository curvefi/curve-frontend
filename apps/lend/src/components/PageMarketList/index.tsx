import type { FoldTableLabels, PageMarketList, SearchParams } from '@/components/PageMarketList/types'

import React, { useCallback, useEffect } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { _getActiveKey } from '@/store/createMarketListSlice'
import useStore from '@/store/useStore'

import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import MarketListNoResult from '@/components/PageMarketList/components/MarketListNoResult'
import MarketListItemContent from '@/components/PageMarketList/components/MarketListItemContent'
import TableSettings from '@/components/PageMarketList/components/TableSettings/TableSettings'

const MarketList = (pageProps: PageMarketList) => {
  const { rChainId, isLoaded, searchParams, api, tableLabelsMapper, updatePath } = pageProps
  const navigate = useNavigate()

  const activeKey = _getActiveKey(rChainId, searchParams)
  const prevActiveKey = useStore((state) => state.marketList.activeKey)
  const formStatus = useStore((state) => state.marketList.formStatus)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const results = useStore((state) => state.marketList.result)
  const resultCached = useStore((state) => state.storeCache.marketListResult[activeKey])
  const setFormValues = useStore((state) => state.marketList.setFormValues)

  const { signerAddress } = api ?? {}

  const showSignerCell = !!signerAddress

  // prettier-ignore
  const FOLD_TABLE_LABELS: FoldTableLabels = {
    borrow: [
      { sortIdKey: 'isInMarket', label: tableLabelsMapper.isInMarket.name, className: 'center noPadding', show: showSignerCell, isNotSortable: true, width: '20px' },
      { sortIdKey: 'name', label: tableLabelsMapper.name.name, className: 'left' },
      { sortIdKey: 'myHealth', label: tableLabelsMapper.myHealth.name, className: '', show: showSignerCell, width: '100px' },
      { sortIdKey: 'myDebt', label: tableLabelsMapper.myDebt.name, className: '', show: showSignerCell, width: '120px' },
      { sortIdKey: 'tokenCollateral', label: tableLabelsMapper.tokenCollateral.name, className: 'center', width: '100px' },
      { sortIdKey: 'tokenBorrow', label: tableLabelsMapper.tokenBorrow.name, className: 'center', width: '100px' },
      { sortIdKey: 'rateBorrow', label: tableLabelsMapper.rateBorrow.name, className: 'center', width: '110px' },
      { sortIdKey: 'available', label: tableLabelsMapper.available.name, className: 'right', width: '140px' },
      { sortIdKey: 'totalDebt', label: tableLabelsMapper.totalDebt.name, className: 'right', width: '120px' },
      { sortIdKey: 'cap', label: tableLabelsMapper.cap.name, className: 'right', width: '140px' },
    ],
    supply: [
      { sortIdKey: 'isInMarket', label: tableLabelsMapper.isInMarket.name, className: 'center noPadding', show: showSignerCell, isNotSortable: true, width: '20px' },
      { sortIdKey: 'name', label: tableLabelsMapper.name.name, className: 'left' },
      { sortIdKey: 'myVaultShares', label: tableLabelsMapper.myVaultShares.name, className: 'right', show: showSignerCell, width: '210px' },
      { sortIdKey: 'tokenSupply', label: tableLabelsMapper.tokenSupply.name, className: 'center', width: '100px' },
      { sortIdKey: 'rateLend', label: tableLabelsMapper.rateLend.name, className: 'center', width: '110px' },
      { sortIdKey: '', label: t`Rewards APR`, buttons: [{ sortIdKey: 'rewardsCRV', label: tableLabelsMapper.rewardsCRV.name }, { sortIdKey: 'rewardsOthers', label: tableLabelsMapper.rewardsOthers.name }], className: 'right', width: '240px' },
      { sortIdKey: 'totalLiquidity', label: tableLabelsMapper.totalLiquidity.name, className: 'right', width: '110px' },
    ]
  }

  const prevKey = _getPrevKey(activeKey, prevActiveKey)
  const result = results[activeKey] ?? resultCached ?? results[prevKey] ?? undefined

  const updateFormValues = useCallback(
    (searchParams: SearchParams, shouldRefetch?: boolean) => {
      setFormValues(rChainId, isLoaded ? api : null, searchParams, shouldRefetch)
    },
    [isLoaded, rChainId, api, setFormValues]
  )

  useEffect(() => {
    if (isLoaded) updateFormValues(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, searchParams])

  useEffect(() => {
    if (isPageVisible) updateFormValues(searchParams, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  const tableLabels = FOLD_TABLE_LABELS[searchParams.filterTypeKey]

  return (
    <>
      {/* MARKET LIST SETTINGS */}
      <TableSettings {...pageProps} />

      {/* MARKET LIST */}
      <MarketListWrapper>
        {formStatus.noResult && !formStatus.isLoading ? (
          <MarketListNoResult searchParams={searchParams} updatePath={updatePath} />
        ) : Array.isArray(result) ? (
          result.map((marketListItem) => (
            <MarketListItemContent
              key={marketListItem.address}
              navigate={navigate}
              pageProps={pageProps}
              marketListItem={marketListItem}
              showSignerCell={showSignerCell}
              tableLabels={tableLabels}
            />
          ))
        ) : (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        )}
      </MarketListWrapper>
    </>
  )
}

const MarketListWrapper = styled.div`
  width: 100%;
  padding-bottom: var(--spacing-wide);
`

function _getPrevKey(activeKey: string, prevActiveKey: string) {
  return activeKey.split('-')[0] === prevActiveKey.split('-')[0] ? prevActiveKey : ''
}

export default MarketList
