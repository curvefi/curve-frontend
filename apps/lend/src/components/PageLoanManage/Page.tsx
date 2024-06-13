import type { NextPage } from 'next'
import type { DetailInfoTypes } from '@/components/PageLoanManage/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { REFRESH_INTERVAL } from '@/constants'
import { _getSelectedTab } from '@/components/PageLoanManage/utils'
import { helpers } from '@/lib/apiLending'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import {
  AppPageFormContainer,
  AppPageFormTitleWrapper,
  AppPageFormsWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@/ui/AppPage'
import DocumentHead from '@/layout/DocumentHead'
import DetailsMarket from 'components/DetailsMarket'
import DetailsUserLoan from '@/components/DetailsUser/components/DetailsUserLoan'
import LoanMange from '@/components/PageLoanManage/index'
import PageTitleBorrowSupplyLinks from '@/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import Tabs, { Tab } from '@/ui/Tab'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, api, routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId, rOwmId, rFormType, rSubdirectory } = routerParams

  const owmDataCache = useStore((state) => state.storeCache.owmDatasMapper[rChainId]?.[rOwmId])
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const owmDataCachedOrApi = owmData ?? owmDataCache
  const userActiveKey = helpers.getUserActiveKey(api, owmDataCachedOrApi)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const marketDetailsView = useStore((state) => state.markets.marketDetailsView)
  const navHeight = useStore((state) => state.layout.navHeight)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)

  const { signerAddress } = api ?? {}
  const { borrowed_token, collateral_token } = owmDataCachedOrApi?.owm ?? {}

  const [isLoaded, setLoaded] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  // set tabs
  const DETAIL_INFO_TYPES: { key: DetailInfoTypes; label: string }[] = [{ label: t`Market Details`, key: 'market' }]
  if (signerAddress) {
    DETAIL_INFO_TYPES.push({ label: t`Your Details`, key: 'user' })
  }
  const selectedTab = _getSelectedTab(marketDetailsView, signerAddress)

  const fetchInitial = useCallback(
    async (api: Api, owmData: OWMData) => {
      const { signerAddress } = api
      // check for an existing loan
      const loanExists = signerAddress ? (await fetchUserLoanExists(api, owmData, true))?.loanExists : false
      if (loanExists) setMarketsStateKey('marketDetailsView', 'user')
      setLoaded(true)

      // delay fetch rest after form details are fetch first
      setTimeout(() => {
        fetchAllMarketDetails(api, owmData, true)

        if (signerAddress && loanExists) {
          fetchAllUserMarketDetails(api, owmData, true)
        }
        setInitialLoaded(true)
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchAllMarketDetails, fetchAllUserMarketDetails, fetchUserLoanExists, setMarketsStateKey]
  )

  // onMount
  useEffect(() => {
    scrollToTop()
  }, [])

  // onMount
  useEffect(() => {
    setLoaded(false)
    if (pageLoaded && !isLoadingApi && api && owmData) {
      fetchInitial(api, owmData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isLoadingApi])

  useEffect(() => {
    if (api && owmData && isPageVisible && initialLoaded) fetchInitial(api, owmData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  const TitleComp = () => (
    <AppPageFormTitleWrapper>
      <PageTitleBorrowSupplyLinks
        rChainId={rChainId}
        rOwmId={rOwmId}
        params={params}
        activeKey="borrow"
        owmDataCachedOrApi={owmDataCachedOrApi}
      />
    </AppPageFormTitleWrapper>
  )

  const pageProps: PageContentProps = {
    params,
    rChainId,
    rOwmId,
    rFormType,
    rSubdirectory,
    isLoaded,
    api,
    owmData,
    owmDataCachedOrApi,
    userActiveKey,
    borrowed_token: owmDataCachedOrApi?.owm?.borrowed_token,
    collateral_token: owmDataCachedOrApi?.owm?.collateral_token,
  }

  return (
    <>
      <DocumentHead title={`${collateral_token?.symbol ?? ''}, ${borrowed_token?.symbol ?? ''} | Manage Loan`} />
      <AppPageFormContainer isAdvanceMode={isAdvanceMode}>
        <AppPageFormsWrapper navHeight={navHeight}>
          {!isMdUp && <TitleComp />}
          {rChainId && rOwmId && <LoanMange {...pageProps} />}
        </AppPageFormsWrapper>

        <AppPageInfoWrapper>
          {isMdUp && <TitleComp />}
          <AppPageInfoTabsWrapper>
            <Tabs>
              {DETAIL_INFO_TYPES.map(({ key, label }) => (
                <Tab
                  key={key}
                  testId={key}
                  className={selectedTab === key ? 'active' : ''}
                  variant="secondary"
                  disabled={selectedTab === key}
                  onClick={() => setMarketsStateKey('marketDetailsView', key)}
                >
                  {label}
                </Tab>
              ))}
            </Tabs>
          </AppPageInfoTabsWrapper>

          <AppPageInfoContentWrapper variant="secondary">
            {rChainId && rOwmId && (
              <>
                {selectedTab === 'user' && <DetailsUserLoan {...pageProps} />}
                {selectedTab === 'market' && <DetailsMarket {...pageProps} type="borrow" />}
              </>
            )}
          </AppPageInfoContentWrapper>
        </AppPageInfoWrapper>
      </AppPageFormContainer>
    </>
  )
}

export default Page
