'use client'
import { useCallback, useEffect, useState } from 'react'
import CampaignRewardsBanner from '@/lend/components/CampaignRewardsBanner'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import DetailsMarket from '@/lend/components/DetailsMarket'
import LoanCreate from '@/lend/components/PageLoanCreate/index'
import PageTitleBorrowSupplyLinks from '@/lend/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import { useOneWayMarket } from '@/lend/entities/chain'
import usePageOnMount from '@/lend/hooks/usePageOnMount'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { LlamalendApi, type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { scrollToTop } from '@/lend/utils/helpers'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
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
import { isLoading } from '@ui/utils'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useApiStore } from '@ui-kit/shared/useApiStore'

const Page = (params: MarketUrlParams) => {
  const { pageLoaded, routerParams, api } = usePageOnMount()
  const titleMapper = useTitleMapper()
  const { rChainId, rMarket, rFormType, rSubdirectory } = routerParams
  const market = useOneWayMarket(rChainId, rMarket).data
  const rOwmId = market?.id ?? ''
  const isLoadingApi = useApiStore((state) => state.isLoadingLlamalend)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)
  const { provider } = useWallet()

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [isLoaded, setLoaded] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const userActiveKey = helpers.getUserActiveKey(api, market!)

  const fetchInitial = useCallback(
    async (api: LlamalendApi, market: LendMarketTemplate) => {
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
        setInitialLoaded(true)
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchUserLoanExists, fetchAllMarketDetails, fetchUserMarketBalances],
  )

  useEffect(() => {
    setLoaded(false)

    if (pageLoaded && !isLoadingApi && api && market) {
      void fetchInitial(api, market)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isLoadingApi])

  useEffect(() => {
    if (api && market && isPageVisible && initialLoaded) void fetchInitial(api, market)
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

  if (!provider) {
    return (
      <Box display="flex" fillWidth flexJustifyContent="center" margin="var(--spacing-3) 0">
        <ConnectWalletPrompt
          description={t`Connect your wallet to view market`}
          connectText={t`Connect`}
          loadingText={t`Connecting`}
          connectWallet={() => connectWallet()}
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

      <AppPageFormContainer isAdvanceMode={isAdvancedMode}>
        <AppPageFormsWrapper navHeight="var(--header-height)">
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
    </>
  )
}

export default Page
