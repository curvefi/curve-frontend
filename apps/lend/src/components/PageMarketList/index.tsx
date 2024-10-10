import type { PageMarketList, TableLabel } from '@/components/PageMarketList/types'

import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { FilterType } from '@/components/PageMarketList/utils'
import { _getActiveKey } from '@/store/createMarketListSlice'
import useStore from '@/store/useStore'

import { REFRESH_INTERVAL } from '@/constants'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import MarketListNoResult from '@/components/PageMarketList/components/MarketListNoResult'
import MarketListItemContent from '@/components/PageMarketList/components/MarketListItemContent'
import TableSettings from '@/components/PageMarketList/components/TableSettings/TableSettings'
import usePageVisibleInterval from '@/ui/hooks/usePageVisibleInterval'

const MarketList = (pageProps: PageMarketList) => {
  const { rChainId, isLoaded, searchParams, api, updatePath } = pageProps

  const activeKey = _getActiveKey(rChainId, searchParams)
  const prevActiveKey = useStore((state) => state.marketList.activeKey)
  const initialLoaded = useStore((state) => state.marketList.initialLoaded)
  const formStatus = useStore((state) => state.marketList.formStatus)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const loansExistsMapper = useStore((state) => state.user.loansExistsMapper)
  const userMarketsBalances = useStore((state) => state.user.marketsBalancesMapper)
  const results = useStore((state) => state.marketList.result)
  const resultCached = useStore((state) => state.storeCache.marketListResult[activeKey])
  const setFormValues = useStore((state) => state.marketList.setFormValues)
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  const { signerAddress } = api ?? {}

  const showSignerCell = !!signerAddress
  const showBorrowSignerCell = showSignerCell && Object.values(loansExistsMapper)?.some((l) => l.loanExists)
  const showSupplySignerCell =
    showSignerCell && Object.values(userMarketsBalances)?.some((b) => +b.vaultShares > 0 || +b.gauge > 0)

  // prettier-ignore
  const TABLE_LABELS: { borrow: TableLabel[]; supply: TableLabel[] } = {
    [FilterType.borrow]: [
      { sortIdKey: 'isInMarket', className: 'center noPadding', show: showBorrowSignerCell, isNotSortable: true, width: '20px' },
      { sortIdKey: 'tokenCollateral', className: 'left', width: '200px' },
      { sortIdKey: 'tokenBorrow', className: 'left' },
      { sortIdKey: 'leverage', className: 'left', width: '120px' },
      { sortIdKey: 'myHealth', className: '', show: showBorrowSignerCell, width: '100px' },
      { sortIdKey: 'myDebt', className: '', show: showBorrowSignerCell, width: '140px' },
      { sortIdKey: 'rateBorrow', className: 'right nowrap', width: '100px' },
      { sortIdKey: 'utilization', className: 'right', width: '150px' },
      { sortIdKey: 'totalCollateralValue', className: 'right', width: isAdvanceMode ? '220px' : '150px' },
    ],
    [FilterType.supply]: [
      { sortIdKey: 'isInMarket', className: 'center noPadding', show: showSupplySignerCell, isNotSortable: true, width: '20px' },
      { sortIdKey: 'tokenSupply', className: 'left', width: '140px' },
      { sortIdKey: 'tokenCollateral', className: 'left', width: '140px' },
      { sortIdKey: 'leverage', className: 'left', width: '120px' },
      { sortIdKey: 'myVaultShares', className: 'right', show: showSupplySignerCell, width: '240px' },
      { sortIdKey: 'totalApr', className: 'right', ...(showSupplySignerCell ? {} : { width: '160px' }) },
      { sortIdKey: 'totalLiquidity', className: 'right', width: '160px' },
    ],
  }

  const parsedResult =
    results[activeKey] ?? resultCached ?? (activeKey.charAt(0) === prevActiveKey.charAt(0) && results[prevActiveKey])

  const updateFormValues = useCallback(
    (shouldRefetch?: boolean) => {
      setFormValues(rChainId, isLoaded ? api : null, shouldRefetch)
    },
    [isLoaded, rChainId, api, setFormValues]
  )

  useEffect(() => {
    if (isLoaded && isPageVisible && initialLoaded) updateFormValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (isLoaded && isPageVisible && !initialLoaded) {
      updateFormValues(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isPageVisible])

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  usePageVisibleInterval(() => updateFormValues(true), REFRESH_INTERVAL['5m'], isPageVisible && isLoaded)

  const tableLabels = TABLE_LABELS[searchParams.filterTypeKey]

  return (
    <>
      {/* MARKET LIST SETTINGS */}
      <TableSettings
        {...pageProps}
        showBorrowSignerCell={showBorrowSignerCell}
        showSupplySignerCell={showSupplySignerCell}
        tableLabelsSelector={TABLE_LABELS}
        tableLabels={tableLabels}
      />

      {/* MARKET LIST */}
      <MarketListWrapper>
        {formStatus.noResult && !formStatus.isLoading ? (
          <MarketListNoResult searchParams={searchParams} signerAddress={signerAddress} updatePath={updatePath} />
        ) : Array.isArray(parsedResult) ? (
          parsedResult.map((marketListItem, idx) => (
            <MarketListItemContent
              key={marketListItem.address}
              idx={idx}
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

export default MarketList
