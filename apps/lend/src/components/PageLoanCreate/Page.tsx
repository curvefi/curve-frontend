import type { NextPage } from 'next'

import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { REFRESH_INTERVAL } from '@/constants'
import { helpers } from '@/lib/apiLending'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import {
  AppPageFormContainer,
  AppPageFormTitleWrapper,
  AppPageFormsWrapper,
  AppPageInfoContentHeader,
  AppPageInfoContentWrapper,
  AppPageInfoWrapper,
} from '@/ui/AppPage'
import DocumentHead from '@/layout/DocumentHead'
import LoanCreate from '@/components/PageLoanCreate/index'
import DetailsMarket from 'components/DetailsMarket'
import PageTitleBorrowSupplyLinks from '@/components/SharedPageStyles/PageTitleBorrowSupplyLinks'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, routerParams, api } = usePageOnMount(params, location, navigate)
  const { rChainId, rOwmId, rFormType, rSubdirectory } = routerParams

  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const owMDataCached = useStore((state) => state.storeCache.owmDatasMapper[rChainId]?.[rOwmId])
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const navHeight = useStore((state) => state.layout.navHeight)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)

  const [isLoaded, setLoaded] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const owmDataCachedOrApi = owmData ?? owMDataCached
  const { borrowed_token, collateral_token } = owmDataCachedOrApi?.owm ?? {}

  const fetchInitial = useCallback(
    async (api: Api, owmData: OWMData) => {
      const { signerAddress } = api

      if (signerAddress) {
        await fetchUserLoanExists(api, owmData, true)
      }
      setLoaded(true)

      // delay fetch rest after form details are fetch first
      setTimeout(() => {
        fetchAllMarketDetails(api, owmData, true)

        if (signerAddress) {
          fetchUserMarketBalances(api, owmData, true)
        }
        setInitialLoaded(true)
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchUserLoanExists, fetchAllMarketDetails, fetchUserMarketBalances]
  )

  useEffect(() => {
    scrollToTop()
  }, [])

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
    userActiveKey: helpers.getUserActiveKey(api, owmData),
    borrowed_token,
    collateral_token,
  }

  return (
    <>
      <DocumentHead title={`${collateral_token?.symbol ?? ''}, ${borrowed_token?.symbol ?? ''} | Create Loan`} />
      <AppPageFormContainer isAdvanceMode={isAdvanceMode}>
        <AppPageFormsWrapper navHeight={navHeight}>
          {(!isMdUp || !isAdvanceMode) && <TitleComp />}
          {rChainId && rOwmId && <LoanCreate {...pageProps} />}
        </AppPageFormsWrapper>

        {isAdvanceMode && rChainId && rOwmId && (
          <AppPageInfoWrapper>
            {isMdUp && <TitleComp />}
            <AppPageInfoContentWrapper variant="secondary">
              <AppPageInfoContentHeader>Market Details</AppPageInfoContentHeader>
              <DetailsMarket {...pageProps} type="borrow" />
            </AppPageInfoContentWrapper>
          </AppPageInfoWrapper>
        )}
      </AppPageFormContainer>
    </>
  )
}

export default Page
