import type { FoldTableLabels, PageMarketList, SearchParams } from '@/components/PageMarketList/types'

import React, { useCallback, useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { _getActiveKey } from '@/store/createMarketListSlice'
import useStore from '@/store/useStore'

import { REFRESH_INTERVAL } from '@/constants'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import MarketListNoResult from '@/components/PageMarketList/components/MarketListNoResult'
import MarketListItemContent from '@/components/PageMarketList/components/MarketListItemContent'
import TableSettings from '@/components/PageMarketList/components/TableSettings/TableSettings'
import usePageVisibleInterval from '@/ui/hooks/usePageVisibleInterval'

const MarketList = (pageProps: PageMarketList) => {
  const { rChainId, isLoaded, searchParams, api, tableLabelsMapper, updatePath } = pageProps
  const navigate = useNavigate()

  const activeKey = _getActiveKey(rChainId, searchParams)
  const prevActiveKey = useStore((state) => state.marketList.activeKey)
  const formStatus = useStore((state) => state.marketList.formStatus)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const loansExistsMapper = useStore((state) => state.user.loansExistsMapper)
  const userMarketsBalances = useStore((state) => state.user.marketsBalancesMapper)
  const results = useStore((state) => state.marketList.result)
  const resultCached = useStore((state) => state.storeCache.marketListResult[activeKey])
  const setFormValues = useStore((state) => state.marketList.setFormValues)

  const [initialLoaded, setInitialLoaded] = useState(false)

  const { signerAddress } = api ?? {}

  const showSignerCell = !!signerAddress
  const showBorrowSignerCell = showSignerCell && Object.values(loansExistsMapper)?.some((l) => l.loanExists)
  const showSupplySignerCell =
    showSignerCell && Object.values(userMarketsBalances)?.some((b) => +b.vaultShares > 0 || +b.gauge > 0)

  // prettier-ignore
  const FOLD_TABLE_LABELS: FoldTableLabels = {
    borrow: [
      { sortIdKey: 'isInMarket', label: tableLabelsMapper.isInMarket.name, className: 'center noPadding', show: showBorrowSignerCell, isNotSortable: true, width: '20px' },
      { sortIdKey: 'tokenCollateral', label: tableLabelsMapper.tokenCollateral.name, className: 'left', width: '140px' },
      { sortIdKey: 'tokenBorrow', label: tableLabelsMapper.tokenBorrow.name, className: 'left', width: '140px' },
      { sortIdKey: 'myHealth', label: tableLabelsMapper.myHealth.name, className: '', show: showBorrowSignerCell, width: '120px' },
      { sortIdKey: 'myDebt', label: tableLabelsMapper.myDebt.name, className: '', show: showBorrowSignerCell, width: '120px' },
      { sortIdKey: 'rateBorrow', label: tableLabelsMapper.rateBorrow.name, className: 'right nowrap' },
      { sortIdKey: 'available', label: tableLabelsMapper.available.name, className: 'right', width: '140px' },
      { sortIdKey: 'totalDebt', label: tableLabelsMapper.totalDebt.name, className: 'right', width: '140px' },
      { sortIdKey: 'cap', label: tableLabelsMapper.cap.name, className: 'right', width: '140px' },
      { sortIdKey: 'cap', label: tableLabelsMapper.utilization.name, className: 'right', width: '140px' },
      { sortIdKey: 'totalCollateralValue', label: tableLabelsMapper.totalCollateralValue.name, className: 'right', width: '220px' },
    ],
    supply: [
      { sortIdKey: 'isInMarket', label: tableLabelsMapper.isInMarket.name, className: 'center noPadding', show: showSupplySignerCell, isNotSortable: true, width: '20px' },
      { sortIdKey: 'tokenSupply', label: tableLabelsMapper.tokenSupply.name, className: 'left', width: '140px' },
      { sortIdKey: 'myVaultShares', label: tableLabelsMapper.myVaultShares.name, className: 'right', show: showSupplySignerCell, width: '240px' },
      { sortIdKey: '', label: t`Total APR`, className: 'right' },
      { sortIdKey: 'totalLiquidity', label: tableLabelsMapper.totalLiquidity.name, className: 'right', width: '160px' },
    ]
  }

  const prevKey = _getPrevKey(activeKey, prevActiveKey)
  const result = results[activeKey] ?? resultCached ?? results[prevKey] ?? undefined

  const updateFormValues = useCallback(
    (shouldRefetch?: boolean) => {
      setFormValues(rChainId, isLoaded ? api : null, shouldRefetch)
    },
    [isLoaded, rChainId, api, setFormValues]
  )

  useEffect(() => {
    if (isLoaded && isPageVisible && initialLoaded) updateFormValues(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  useEffect(() => {
    if (isLoaded) {
      updateFormValues()
      setInitialLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, searchParams])

  usePageVisibleInterval(() => updateFormValues(true), REFRESH_INTERVAL['11m'], isPageVisible && isLoaded)

  const tableLabels = FOLD_TABLE_LABELS[searchParams.filterTypeKey]

  return (
    <>
      {/* MARKET LIST SETTINGS */}
      <TableSettings {...pageProps} />

      {/* MARKET LIST */}
      <MarketListWrapper>
        {formStatus.noResult && !formStatus.isLoading ? (
          <MarketListNoResult searchParams={searchParams} signerAddress={signerAddress} updatePath={updatePath} />
        ) : Array.isArray(result) ? (
          result.map((marketListItem) => (
            <MarketListItemContent
              key={marketListItem.address}
              navigate={navigate}
              pageProps={pageProps}
              marketListItem={marketListItem}
              showBorrowSignerCell={showBorrowSignerCell}
              showSupplySignerCell={showSupplySignerCell}
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
