import { useEffect } from 'react'
import type { Address } from 'viem'
import CampaignRewardsBanner from '@/lend/components/CampaignRewardsBanner'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import { MarketInformationComp } from '@/lend/components/MarketInformationComp'
import { MarketInformationTabs } from '@/lend/components/MarketInformationTabs'
import LoanCreate from '@/lend/components/PageLoanCreate/index'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams, scrollToTop } from '@/lend/utils/helpers'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import { DetailPageStack } from '@/llamalend/components/DetailPageStack'
import { MarketDetails } from '@/llamalend/features/market-details'
import { NoPosition } from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { isChain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { AppPageFormsWrapper } from '@ui/AppPage'
import Box from '@ui/Box'
import {
  ExpandButton,
  ExpandIcon,
  PriceAndTradesExpandedContainer,
  PriceAndTradesExpandedWrapper,
} from '@ui/Chart/styles'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useNavigate, useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId, rFormType } = parseMarketParams(params)

  const { data: market, isSuccess } = useOneWayMarket(rChainId, rMarket)
  const { llamaApi: api = null, connectState } = useConnection()
  const titleMapper = useTitleMapper()
  const { provider, connect } = useWallet()
  const push = useNavigate()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)
  const setChartExpanded = useStore((state) => state.ohlcCharts.setChartExpanded)

  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const rOwmId = market?.id ?? ''
  const { signerAddress } = api ?? {}

  const marketDetails = useMarketDetails({
    chainId: rChainId,
    llamma: market,
    llammaId: rOwmId,
  })
  const network = networks[rChainId]
  const {
    data: userCollateralEvents,
    isLoading: collateralEventsIsLoading,
    isError: collateralEventsIsError,
  } = useUserCollateralEvents({
    app: 'lend',
    chain: isChain(network.id) ? network.id : undefined,
    controllerAddress: market?.addresses?.controller as Address,
    userAddress: signerAddress,
    collateralToken: market?.collateral_token,
    borrowToken: market?.borrowed_token,
    scanTxPath: network.scanTxPath,
  })

  useEffect(() => {
    if (isSuccess && !market) {
      console.warn(`Market ${rMarket} not found. Redirecting to market list.`)
      push(getCollateralListPathname(params))
    }
  }, [isSuccess, market, params, push, rMarket])

  useEffect(() => {
    // delay fetch rest after form details are fetched first
    const timer = setTimeout(async () => {
      if (!api || !market || !isPageVisible) return
      await fetchAllMarketDetails(api, market, true)
      if (api.signerAddress) {
        await fetchUserMarketBalances(api, market, true)
      }
    }, REFRESH_INTERVAL['3s'])
    return () => clearTimeout(timer)
  }, [api, fetchAllMarketDetails, fetchUserMarketBalances, isPageVisible, market])

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

  useLendPageTitle(market?.collateral_token?.symbol, 'Create')

  const pageProps: PageContentProps = {
    params,
    rChainId,
    rOwmId,
    rFormType,
    api,
    market,
    titleMapper,
    userActiveKey,
    isLoaded: true,
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
      {chartExpanded && network.pricesData && (
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
      <DetailPageStack>
        <AppPageFormsWrapper data-testid="form-wrapper">
          {rChainId && rOwmId && <LoanCreate {...pageProps} params={params} />}
        </AppPageFormsWrapper>
        <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
          <CampaignRewardsBanner
            chainId={rChainId}
            borrowAddress={market?.addresses?.controller || ''}
            supplyAddress={market?.addresses?.vault || ''}
          />
          <MarketInformationTabs currentTab={'borrow'} hrefs={positionDetailsHrefs}>
            <Stack padding={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <NoPosition type="borrow" />
              {userCollateralEvents?.events && userCollateralEvents.events.length > 0 && (
                <UserPositionHistory
                  events={userCollateralEvents.events}
                  isLoading={collateralEventsIsLoading}
                  isError={collateralEventsIsError}
                />
              )}
            </Stack>
          </MarketInformationTabs>
          <Stack>
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
      </DetailPageStack>
    </>
  )
}

export default Page
