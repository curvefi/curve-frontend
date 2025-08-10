'use client'
import { useCallback, useEffect, useState } from 'react'
import CampaignRewardsBanner from '@/lend/components/CampaignRewardsBanner'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import DetailsMarket from '@/lend/components/DetailsMarket'
import { MarketInformationComp } from '@/lend/components/MarketInformationComp'
import { MarketInformationTabs } from '@/lend/components/MarketInformationTabs'
import LoanCreate from '@/lend/components/PageLoanCreate/index'
import PageTitleBorrowSupplyLinks from '@/lend/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { Api, type MarketUrlParams, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams, scrollToTop } from '@/lend/utils/helpers'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentHeader,
  AppPageInfoContentWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import {
  ExpandButton,
  ExpandIcon,
  PriceAndTradesExpandedContainer,
  PriceAndTradesExpandedWrapper,
} from '@ui/Chart/styles'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { MarketDetails } from '@ui-kit/features/market-details'
import { NoPosition } from '@ui-kit/features/market-position-details/NoPosition'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const Page = (params: MarketUrlParams) => {
  const { rMarket, rChainId, rFormType } = parseMarketParams(params)

  const { data: market, isSuccess } = useOneWayMarket(rChainId, rMarket)
  const { llamaApi: api = null, connectState } = useConnection()
  const titleMapper = useTitleMapper()
  const { provider, connect } = useWallet()
  const [isLoaded, setLoaded] = useState(false)
  const push = useNavigate()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)
  const setChartExpanded = useStore((state) => state.ohlcCharts.setChartExpanded)
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const rOwmId = market?.id ?? ''
  const [isBeta] = useBetaFlag()

  const marketDetails = useMarketDetails({
    chainId: rChainId,
    llamma: market,
    llammaId: rOwmId,
  })

  const fetchInitial = useCallback(
    async (api: Api, market: OneWayMarketTemplate) => {
      const { signerAddress } = api

      if (signerAddress) {
        await fetchUserLoanExists(api, market, true)
      }
      setLoaded(true)

      // delay fetch rest after form details are fetch first
      setTimeout(() => {
        void fetchAllMarketDetails(api, market, true)

        if (signerAddress) {
          void fetchUserMarketBalances(api, market, true)
        }
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchUserLoanExists, fetchAllMarketDetails, fetchUserMarketBalances],
  )

  useEffect(() => {
    if (isSuccess && !market) {
      console.warn(`Market ${rMarket} not found. Redirecting to market list.`)
      push(getCollateralListPathname(params))
    }
  }, [isSuccess, market, params, push, rMarket])

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
    isLoaded,
    api,
    market,
    titleMapper,
    userActiveKey,
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
            {(!isMdUp || !isAdvancedMode) && <TitleComp />}
            {rChainId && rOwmId && <LoanCreate {...pageProps} params={params} />}
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
          <AppPageFormsWrapper>
            {rChainId && rOwmId && <LoanCreate {...pageProps} params={params} />}
          </AppPageFormsWrapper>
          <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
            <CampaignRewardsBanner
              borrowAddress={market?.addresses?.controller || ''}
              supplyAddress={market?.addresses?.vault || ''}
            />
            <MarketInformationTabs currentTab={'borrow'} hrefs={positionDetailsHrefs}>
              <Stack padding={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
                <NoPosition type="borrow" />
              </Stack>
            </MarketInformationTabs>
            <MarketDetails {...marketDetails} />
            <MarketInformationComp
              pageProps={pageProps}
              chartExpanded={chartExpanded}
              userActiveKey={userActiveKey}
              type="borrow"
              page="create"
            />
          </Stack>
        </Stack>
      )}
    </>
  )
}

export default Page
