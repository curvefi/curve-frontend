import type { NextPage } from 'next'

import React, { useCallback, useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { REFRESH_INTERVAL } from '@/constants'
import { helpers } from '@/lib/apiLending'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import {
  PageFormContainer,
  PageFormTitleContent,
  PageFormTitleWrapper,
  PageFormsWrapper,
  PageInfoContentHeader,
  PageInfoContentWrapper,
  PageInfoWrapper,
} from '@/components/SharedPageStyles/styles'
import DocumentHead from '@/layout/DocumentHead'
import LoanCreate from '@/components/PageLoanCreate/index'
import DetailsMarket from 'components/DetailsMarket'
import PageTitleBorrowSupplyLinks from '@/components/SharedPageStyles/PageTitleBorrowSupplyLinks'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams, api } = usePageOnMount(params, location, navigate)
  const { rChainId, rOwmId, rFormType, rSubdirectory } = routerParams

  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const owMDataCached = useStore((state) => state.storeCache.owmDatasMapper[rChainId]?.[rOwmId])
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const navHeight = useStore((state) => state.layout.navHeight)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)

  const [isLoaded, setLoaded] = useState(false)

  const owmDataCachedOrApi = owmData ?? owMDataCached
  const { displayName } = owmDataCachedOrApi ?? {}

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
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchUserLoanExists, fetchAllMarketDetails, fetchUserMarketBalances]
  )

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    setLoaded(false)

    if (!isLoadingApi && api && owmData) {
      fetchInitial(api, owmData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingApi])

  const TitleComp = () => (
    <PageFormTitleWrapper>
      <PageTitleBorrowSupplyLinks
        rChainId={rChainId}
        rOwmId={rOwmId}
        params={params}
        activeKey="borrow"
        owmDataCachedOrApi={owmDataCachedOrApi}
      />
      <PageFormTitleContent>{displayName}</PageFormTitleContent>
    </PageFormTitleWrapper>
  )

  const pageProps: PageContentProps = {
    rChainId,
    rOwmId,
    rFormType,
    rSubdirectory,
    isLoaded,
    api,
    owmData,
    owmDataCachedOrApi,
    userActiveKey: helpers.getUserActiveKey(api, owmData),
    borrowed_token: owmDataCachedOrApi?.owm?.borrowed_token,
    collateral_token: owmDataCachedOrApi?.owm?.collateral_token,
  }

  return (
    <>
      <DocumentHead title={`${displayName}: borrow`} />
      <PageFormContainer isAdvanceMode={isAdvanceMode}>
        <PageFormsWrapper navHeight={navHeight}>
          {(!isMdUp || !isAdvanceMode) && <TitleComp />}
          {rChainId && rOwmId && <LoanCreate {...pageProps} />}
        </PageFormsWrapper>

        {isAdvanceMode && rChainId && rOwmId && (
          <PageInfoWrapper>
            {isMdUp && <TitleComp />}
            <PageInfoContentWrapper variant="secondary">
              <PageInfoContentHeader>Market Details</PageInfoContentHeader>
              <DetailsMarket {...pageProps} type="borrow" />
            </PageInfoContentWrapper>
          </PageInfoWrapper>
        )}
      </PageFormContainer>
    </>
  )
}

export default Page
