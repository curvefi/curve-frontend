import type { NextPage } from 'next'
import type { DetailInfoTypes } from '@lend/components/PageLoanManage/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { REFRESH_INTERVAL } from '@lend/constants'
import { _getSelectedTab } from '@lend/components/PageLoanManage/utils'
import { helpers } from '@lend/lib/apiLending'
import { scrollToTop } from '@lend/utils/helpers'
import networks from '@lend/networks'
import usePageOnMount from '@lend/hooks/usePageOnMount'
import useStore from '@lend/store/useStore'
import useTitleMapper from '@lend/hooks/useTitleMapper'

import {
  AppPageFormContainer,
  AppPageFormTitleWrapper,
  AppPageFormsWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import DocumentHead from '@lend/layout/DocumentHead'
import DetailsMarket from '@lend/components/DetailsMarket'
import DetailsUserLoan from '@lend/components/DetailsUser/components/DetailsUserLoan'
import LoanMange from '@lend/components/PageLoanManage/index'
import PageTitleBorrowSupplyLinks from '@lend/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import Tabs, { Tab } from '@ui/Tab'
import Box from '@ui/Box'
import ChartOhlcWrapper from '@lend/components/ChartOhlcWrapper'
import {
  PriceAndTradesExpandedContainer,
  PriceAndTradesExpandedWrapper,
  ExpandButton,
  ExpandIcon,
} from '@ui/Chart/styles'
import CampaignRewardsBanner from '@lend/components/CampaignRewardsBanner'
import { ConnectWalletPrompt as ConnectWallet } from '@ui-kit/features/connect-wallet'
import { useOneWayMarket } from '@lend/entities/chain'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Api, PageContentProps } from '@lend/types/lend.types'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, api, routerParams } = usePageOnMount(params, location, navigate)
  const titleMapper = useTitleMapper()
  const { rChainId, rOwmId, rFormType, rSubdirectory } = routerParams

  const market = useOneWayMarket(rChainId, rOwmId).data

  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const marketDetailsView = useStore((state) => state.markets.marketDetailsView)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const provider = useWalletStore((s) => s.provider)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { signerAddress } = api ?? {}
  const { borrowed_token, collateral_token } = market ?? {}

  const [isLoaded, setLoaded] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  // set tabs
  const DETAIL_INFO_TYPES: { key: DetailInfoTypes; label: string }[] = [{ label: t`Market Details`, key: 'market' }]
  if (signerAddress) {
    DETAIL_INFO_TYPES.push({ label: t`Your Details`, key: 'user' })
  }
  const selectedTab = _getSelectedTab(marketDetailsView, signerAddress)

  const fetchInitial = useCallback(
    async (api: Api, market: OneWayMarketTemplate) => {
      const { signerAddress } = api
      // check for an existing loan
      const loanExists = signerAddress ? (await fetchUserLoanExists(api, market, true))?.loanExists : false
      if (loanExists) setMarketsStateKey('marketDetailsView', 'user')
      setLoaded(true)

      // delay fetch rest after form details are fetch first
      setTimeout(() => {
        fetchAllMarketDetails(api, market, true)

        if (signerAddress && loanExists) {
          fetchAllUserMarketDetails(api, market, true)
        }
        setInitialLoaded(true)
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchAllMarketDetails, fetchAllUserMarketDetails, fetchUserLoanExists, setMarketsStateKey],
  )

  // onMount
  useEffect(() => {
    scrollToTop()
  }, [])

  // onMount
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

  const TitleComp = () =>
    market && (
      <AppPageFormTitleWrapper>
        <PageTitleBorrowSupplyLinks params={params} activeKey="borrow" market={market} />
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
    userActiveKey,
    titleMapper,
  }

  return (
    <>
      <DocumentHead title={`${collateral_token?.symbol ?? ''}, ${borrowed_token?.symbol ?? ''} | Manage Loan`} />

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
              {!isMdUp && <TitleComp />}
              {rChainId && rOwmId && <LoanMange {...pageProps} />}
            </AppPageFormsWrapper>

            <AppPageInfoWrapper>
              {isMdUp && <TitleComp />}
              <Box margin="0 0 var(--spacing-2)">
                <CampaignRewardsBanner
                  borrowAddress={market?.addresses?.controller || ''}
                  supplyAddress={market?.addresses?.vault || ''}
                />
              </Box>
              <AppPageInfoTabsWrapper>
                <Tabs>
                  {DETAIL_INFO_TYPES.map(({ key, label }) => (
                    <Tab
                      key={key}
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
