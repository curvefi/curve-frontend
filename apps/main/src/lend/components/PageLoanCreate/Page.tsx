import { useEffect } from 'react'
import type { Address } from 'viem'
import CampaignRewardsBanner from '@/lend/components/CampaignRewardsBanner'
import { MarketInformationComp } from '@/lend/components/MarketInformationComp'
import { MarketInformationTabs } from '@/lend/components/MarketInformationTabs'
import LoanCreate from '@/lend/components/PageLoanCreate/LoanCreateTabs'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/helpers'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import { MarketDetails } from '@/llamalend/features/market-details'
import { NoPosition } from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { DetailPageStack } from '@/llamalend/widgets/DetailPageStack'
import { isChain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { AppPageFormsWrapper } from '@ui/AppPage'
import Box from '@ui/Box'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId, rFormType } = parseMarketParams(params)

  const { data: market, isSuccess } = useOneWayMarket(rChainId, rMarket)
  const { llamaApi: api = null, connectState } = useConnection()
  const titleMapper = useTitleMapper()
  const { provider, connect } = useWallet()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)

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
    network,
  })

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

  return isSuccess && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <>
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
            <MarketInformationComp pageProps={pageProps} userActiveKey={userActiveKey} type="borrow" page="create" />
          </Stack>
        </Stack>
      </DetailPageStack>
    </>
  ) : (
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

export default Page
