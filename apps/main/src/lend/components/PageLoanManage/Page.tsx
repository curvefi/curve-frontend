import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import CampaignRewardsBanner from '@/lend/components/CampaignRewardsBanner'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import { MarketInformationComp } from '@/lend/components/MarketInformationComp'
import { MarketInformationTabs } from '@/lend/components/MarketInformationTabs'
import LoanMange from '@/lend/components/PageLoanManage/index'
import type { DetailInfoTypes } from '@/lend/components/PageLoanManage/types'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useBorrowPositionDetails } from '@/lend/hooks/useBorrowPositionDetails'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getVaultPathname, parseMarketParams, scrollToTop } from '@/lend/utils/helpers'
import { DetailPageStack } from '@/llamalend/components/DetailPageStack'
import { MarketDetails } from '@/llamalend/features/market-details'
import { BorrowPositionDetails, NoPosition } from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import type { Chain } from '@curvefi/prices-api'
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
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId, rFormType } = parseMarketParams(params)
  const { llamaApi: api = null, connectState } = useConnection()
  const titleMapper = useTitleMapper()
  const market = useOneWayMarket(rChainId, rMarket).data
  const rOwmId = market?.id ?? ''
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const { provider, connect } = useWallet()

  const { signerAddress } = api ?? {}

  const { data: loanExists } = useLoanExists({
    chainId: rChainId,
    marketId: market?.id,
    userAddress: signerAddress,
  })

  const [isLoaded, setLoaded] = useState(false)

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
  const {
    data: userCollateralEvents,
    isLoading: collateralEventsIsLoading,
    isError: collateralEventsIsError,
  } = useUserCollateralEvents({
    app: 'lend',
    chainId: rChainId,
    chain: networks[rChainId].id as Chain,
    controllerAddress: market?.addresses?.controller as Address,
    userAddress: signerAddress,
    collateralToken: market?.collateral_token,
    borrowToken: market?.borrowed_token,
    scanTxPath: networks[rChainId].scanTxPath,
  })

  // set tabs
  const DETAIL_INFO_TYPES: { key: DetailInfoTypes; label: string }[] = [{ label: t`Market Details`, key: 'market' }]
  if (signerAddress) {
    DETAIL_INFO_TYPES.push({ label: t`Your Details`, key: 'user' })
  }

  useEffect(() => {
    if (api && market && isPageVisible) {
      if (loanExists) setMarketsStateKey('marketDetailsView', 'user')
      setLoaded(true)
    }
  }, [api, isPageVisible, loanExists, market, setMarketsStateKey])

  useEffect(() => {
    // delay fetch rest after form details are fetched first
    const timer = setTimeout(async () => {
      if (!api || !market || !isPageVisible || !isLoaded) return
      void fetchAllMarketDetails(api, market, true)
      if (api.signerAddress && loanExists) {
        void fetchAllUserMarketDetails(api, market, true)
      }
    }, REFRESH_INTERVAL['3s'])
    return () => clearTimeout(timer)
  }, [api, fetchAllMarketDetails, fetchAllUserMarketDetails, isLoaded, isPageVisible, loanExists, market])

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

      <DetailPageStack>
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
            {userCollateralEvents?.events && userCollateralEvents.events.length > 0 && (
              <Stack
                paddingLeft={Spacing.md}
                paddingRight={Spacing.md}
                paddingBottom={Spacing.md}
                sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
              >
                <UserPositionHistory
                  events={userCollateralEvents.events}
                  isLoading={collateralEventsIsLoading}
                  isError={collateralEventsIsError}
                />
              </Stack>
            )}
          </MarketInformationTabs>
          <Stack>
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
      </DetailPageStack>
    </>
  )
}

export default Page
