import type { NextPage } from 'next'

import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { t } from '@lingui/macro'

import { REFRESH_INTERVAL } from '@/constants'
import { helpers } from '@/lib/apiLending'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'
import networks from '@/networks'

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
import ChartOhlcWrapper from '@/components/ChartOhlcWrapper'
import {
  PriceAndTradesExpandedContainer,
  PriceAndTradesExpandedWrapper,
  ExpandButton,
  ExpandIcon,
} from '@/ui/Chart/styles'
import Box from '@/ui/Box'
import CampaignRewardsBanner from '@/components/CampaignRewardsBanner'

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
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)

  const [isLoaded, setLoaded] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const owmDataCachedOrApi = owmData ?? owMDataCached
  const { borrowed_token, collateral_token } = owmDataCachedOrApi?.owm ?? {}
  const userActiveKey = helpers.getUserActiveKey(api, owmDataCachedOrApi)

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

  useEffect(() => {
    if (!isMdUp && chartExpanded) {
      setChartExpanded(false)
    }
  }, [chartExpanded, isMdUp, setChartExpanded])

  useEffect(() => {
    if (chartExpanded) {
      scrollToTop()
    }
  }, [chartExpanded])

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

      {chartExpanded && networks[rChainId].pricesData && (
        <PriceAndTradesExpandedContainer>
          <Box flex padding="0 0 var(--spacing-2)">
            <ExpandButton
              variant={'select'}
              onClick={() => {
                setChartExpanded()
              }}
            >
              {chartExpanded ? 'Minimize' : 'Expand'}
              <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
            </ExpandButton>
          </Box>
          <PriceAndTradesExpandedWrapper variant="secondary">
            <ChartOhlcWrapper rChainId={rChainId} userActiveKey={userActiveKey} rOwmId={rOwmId} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}

      <AppPageFormContainer isAdvanceMode={isAdvanceMode}>
        <AppPageFormsWrapper navHeight={navHeight}>
          {(!isMdUp || !isAdvanceMode) && <TitleComp />}
          {rChainId && rOwmId && <LoanCreate {...pageProps} />}
        </AppPageFormsWrapper>

        {isAdvanceMode && rChainId && rOwmId && (
          <AppPageInfoWrapper>
            {isMdUp && <TitleComp />}
            <Box margin="0 0 var(--spacing-2)">
              <CampaignRewardsBanner poolAddress={owmDataCachedOrApi?.owm?.addresses?.controller || ''} />
            </Box>
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
