'use client'
import { useCallback, useEffect, useState } from 'react'
import CampaignRewardsBanner from '@/lend/components/CampaignRewardsBanner'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import DetailsMarket from '@/lend/components/DetailsMarket'
import DetailsUserLoan from '@/lend/components/DetailsUser/components/DetailsUserLoan'
import { MarketInformationComp } from '@/lend/components/MarketInformationComp'
import { MarketInformationTabs } from '@/lend/components/MarketInformationTabs'
import LoanMange from '@/lend/components/PageLoanManage/index'
import type { DetailInfoTypes } from '@/lend/components/PageLoanManage/types'
import { _getSelectedTab } from '@/lend/components/PageLoanManage/utils'
import PageTitleBorrowSupplyLinks from '@/lend/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useBorrowPositionDetails } from '@/lend/hooks/useBorrowPositionDetails'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { Api, type MarketUrlParams, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { getVaultPathname, parseMarketParams, scrollToTop } from '@/lend/utils/helpers'
import Stack from '@mui/material/Stack'
import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import {
  ExpandButton,
  ExpandIcon,
  PriceAndTradesExpandedContainer,
  PriceAndTradesExpandedWrapper,
} from '@ui/Chart/styles'
import Tabs, { Tab } from '@ui/Tab'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { MarketDetails } from '@ui-kit/features/market-details'
import { BorrowPositionDetails } from '@ui-kit/features/market-position-details'
import { NoPosition } from '@ui-kit/features/market-position-details/NoPosition'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const Page = (params: MarketUrlParams) => {
  const { rMarket, rChainId, rFormType } = parseMarketParams(params)
  const { llamaApi: api = null, connectState } = useConnection()
  const titleMapper = useTitleMapper()
  const market = useOneWayMarket(rChainId, rMarket).data
  const rOwmId = market?.id ?? ''
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const marketDetailsView = useStore((state) => state.markets.marketDetailsView)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey])?.loanExists
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const { provider, connect } = useWallet()

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { signerAddress } = api ?? {}

  const [isLoaded, setLoaded] = useState(false)
  const [isBeta] = useBetaFlag()

  const borrowPositionDetails = useBorrowPositionDetails({
    chainId: rChainId,
    market: market ?? undefined,
    marketId: rOwmId,
  })
  const marketDetails = useMarketDetails({
    chainId: rChainId,
    llamma: market,
    llammaId: rOwmId,
  })

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
        void fetchAllMarketDetails(api, market, true)

        if (signerAddress && loanExists) {
          void fetchAllUserMarketDetails(api, market, true)
        }
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchAllMarketDetails, fetchAllUserMarketDetails, fetchUserLoanExists, setMarketsStateKey],
  )

  useEffect(() => {
    if (api && market && isPageVisible) void fetchInitial(api, market)
  }, [api, fetchInitial, isPageVisible, market])

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

  const pageProps = {
    params,
    rChainId,
    rOwmId,
    rFormType,
    isLoaded,
    api,
    market,
    userActiveKey,
    titleMapper,
  }

  const positionDetailsHrefs = {
    borrow: '',
    supply: getVaultPathname(params, rOwmId, 'deposit'),
  }

  if (!provider) {
    return (
      <Box display="flex" fillWidth flexJustifyContent="center" margin="var(--spacing-3) 0">
        <ConnectWalletPrompt
          description={t`Connect your wallet to view market`}
          connectText={t`Connect`}
          loadingText={t`Connecting`}
          connectWallet={() => connect()}
          isLoading={isLoading(connectState)}
        />
      </Box>
    )
  }

  return (
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

      {!isBeta ? (
        <AppPageFormContainer isAdvanceMode={isAdvancedMode}>
          <AppPageFormsWrapper>
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
      ) : (
        // New design layout, only in beta for now
        <Stack
          sx={(theme) => ({
            marginRight: Spacing.md,
            marginLeft: Spacing.md,
            marginTop: Spacing.xl,
            marginBottom: Spacing.xxl,
            gap: Spacing.xl,
            // 961px, matches old Action card breakpoint
            [theme.breakpoints.up(961)]: {
              flexDirection: 'row', // 1100px
            },
          })}
        >
          <AppPageFormsWrapper>{rChainId && rOwmId && <LoanMange {...pageProps} />}</AppPageFormsWrapper>
          <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
            <CampaignRewardsBanner
              borrowAddress={market?.addresses?.controller || ''}
              supplyAddress={market?.addresses?.vault || ''}
            />
            <MarketInformationTabs currentTab={'borrow'} hrefs={positionDetailsHrefs}>
              {loanExists ? (
                <BorrowPositionDetails {...borrowPositionDetails} />
              ) : (
                <Stack padding={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
                  <NoPosition type="borrow" />
                </Stack>
              )}
            </MarketInformationTabs>
            <MarketDetails {...marketDetails} />
            <MarketInformationComp
              pageProps={pageProps}
              chartExpanded={chartExpanded}
              userActiveKey={userActiveKey}
              type="borrow"
              loanExists={loanExists}
            />
          </Stack>
        </Stack>
      )}
    </>
  )
}

export default Page
