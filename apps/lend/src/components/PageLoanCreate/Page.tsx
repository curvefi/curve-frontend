import type { NextPage } from 'next'

import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { t } from '@lingui/macro'

import { REFRESH_INTERVAL } from '@lend/constants'
import { helpers } from '@lend/lib/apiLending'
import { scrollToTop } from '@lend/utils/helpers'
import networks from '@lend/networks'
import usePageOnMount from '@lend/hooks/usePageOnMount'
import useStore from '@lend/store/useStore'
import useTitleMapper from '@lend/hooks/useTitleMapper'

import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentHeader,
  AppPageInfoContentWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import DocumentHead from '@lend/layout/DocumentHead'
import LoanCreate from '@lend/components/PageLoanCreate/index'
import DetailsMarket from 'components/DetailsMarket'
import PageTitleBorrowSupplyLinks from '@lend/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import ChartOhlcWrapper from '@lend/components/ChartOhlcWrapper'
import {
  ExpandButton,
  ExpandIcon,
  PriceAndTradesExpandedContainer,
  PriceAndTradesExpandedWrapper,
} from '@ui/Chart/styles'
import Box from '@ui/Box'
import CampaignRewardsBanner from '@lend/components/CampaignRewardsBanner'
import ConnectWallet from '@lend/components/ConnectWallet'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useOneWayMarket } from '@lend/entities/chain'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Api, PageContentProps } from '@lend/types/lend.types'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, routerParams, api } = usePageOnMount(params, location, navigate)
  const titleMapper = useTitleMapper()
  const { rChainId, rOwmId, rFormType, rSubdirectory } = routerParams

  const market = useOneWayMarket(rChainId, rOwmId).data
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const provider = useStore((state) => state.wallet.getProvider(''))

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [isLoaded, setLoaded] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const { borrowed_token, collateral_token } = market ?? {}
  const userActiveKey = helpers.getUserActiveKey(api, market!)

  const fetchInitial = useCallback(
    async (api: Api, market: OneWayMarketTemplate) => {
      const { signerAddress } = api

      if (signerAddress) {
        await fetchUserLoanExists(api, market, true)
      }
      setLoaded(true)

      // delay fetch rest after form details are fetch first
      setTimeout(() => {
        fetchAllMarketDetails(api, market, true)

        if (signerAddress) {
          fetchUserMarketBalances(api, market, true)
        }
        setInitialLoaded(true)
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchUserLoanExists, fetchAllMarketDetails, fetchUserMarketBalances],
  )

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    setLoaded(false)

    if (pageLoaded && !isLoadingApi && api && market) {
      fetchInitial(api, market)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isLoadingApi])

  useEffect(() => {
    if (api && market && isPageVisible && initialLoaded) fetchInitial(api, market)
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
      {market && <PageTitleBorrowSupplyLinks params={params} activeKey="borrow" market={market} />}
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
    market,
    titleMapper,
    userActiveKey,
  }

  return (
    <>
      <DocumentHead title={`${collateral_token?.symbol ?? ''}, ${borrowed_token?.symbol ?? ''} | Create Loan`} />

      {provider ? (
        <>
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

          <AppPageFormContainer isAdvanceMode={isAdvancedMode}>
            <AppPageFormsWrapper navHeight="var(--header-height)">
              {(!isMdUp || !isAdvancedMode) && <TitleComp />}
              {rChainId && rOwmId && <LoanCreate {...pageProps} />}
            </AppPageFormsWrapper>

            {isAdvancedMode && rChainId && rOwmId && (
              <AppPageInfoWrapper>
                {isMdUp && <TitleComp />}
                <Box margin="0 0 var(--spacing-2)">
                  <CampaignRewardsBanner
                    borrowAddress={market?.addresses?.controller || ''}
                    supplyAddress={market?.addresses?.vault || ''}
                  />
                </Box>
                <AppPageInfoContentWrapper variant="secondary">
                  <AppPageInfoContentHeader>Market Details</AppPageInfoContentHeader>
                  <DetailsMarket {...pageProps} type="borrow" />
                </AppPageInfoContentWrapper>
              </AppPageInfoWrapper>
            )}
          </AppPageFormContainer>
        </>
      ) : (
        <Box display="flex" fillWidth flexJustifyContent="center" margin="var(--spacing-3) 0">
          <ConnectWallet
            description={t`Connect your wallet to view market`}
            connectText={t`Connect`}
            loadingText={t`Connecting`}
          />
        </Box>
      )}
    </>
  )
}

export default Page
