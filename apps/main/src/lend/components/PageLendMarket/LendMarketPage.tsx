import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import { CampaignRewardsBanner } from '@/lend/components/CampaignRewardsBanner'
import { MarketInformationComp } from '@/lend/components/MarketInformationComp'
import { MarketInformationTabs } from '@/lend/components/MarketInformationTabs'
import { LoanCreateTabs } from '@/lend/components/PageLendMarket/LoanCreateTabs'
import { ManageLoanTabs } from '@/lend/components/PageLendMarket/ManageLoanTabs'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useBorrowPositionDetails } from '@/lend/hooks/useBorrowPositionDetails'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import { useTitleMapper } from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/helpers'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import { MarketDetails } from '@/llamalend/features/market-details'
import { BorrowPositionDetails, NoPosition } from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { isChain } from '@curvefi/prices-api'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

const { Spacing } = SizesAndSpaces

export const LendMarketPage = () => {
  const { isHydrated } = useCurve()
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)

  const { data: market, isSuccess } = useOneWayMarket(chainId, rMarket)
  const { llamaApi: api = null, provider } = useCurve()
  const titleMapper = useTitleMapper()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)

  const marketId = market?.id ?? '' // todo: use market?.id directly everywhere since we pass the market too!
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)

  const marketDetails = useMarketDetails({ chainId, market, marketId })
  const network = networks[chainId]
  const {
    data: userCollateralEvents,
    isLoading: collateralEventsIsLoading,
    isError: collateralEventsIsError,
  } = useUserCollateralEvents({
    app: 'lend',
    chain: isChain(network.id) ? network.id : undefined,
    controllerAddress: market?.addresses?.controller as Address,
    userAddress,
    collateralToken: market?.collateral_token,
    borrowToken: market?.borrowed_token,
    network,
  })
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId,
    userAddress,
  })

  const [isLoaded, setLoaded] = useState(false)

  const borrowPositionDetails = useBorrowPositionDetails({ chainId, market: market, marketId })

  useEffect(() => {
    // delay fetch rest after form details are fetched first
    const timer = setTimeout(async () => {
      if (!api || !market || !isPageVisible) return
      await fetchAllMarketDetails(api, market, true)
      if (api.signerAddress) {
        await fetchUserMarketBalances(api, market, true)
        if (loanExists) {
          void fetchAllUserMarketDetails(api, market, true)
        }
      }
    }, REFRESH_INTERVAL['3s'])
    return () => clearTimeout(timer)
  }, [
    api,
    fetchAllMarketDetails,
    fetchUserMarketBalances,
    fetchAllUserMarketDetails,
    isPageVisible,
    market,
    loanExists,
  ])

  useEffect(() => {
    if (api && market && isPageVisible) {
      if (loanExists) setMarketsStateKey('marketDetailsView', 'user')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true)
    }
  }, [api, isPageVisible, loanExists, market, setMarketsStateKey])

  const pageProps = {
    params,
    rChainId: chainId,
    rOwmId: marketId,
    userAddress,
    isLoaded,
    api,
    market,
    userActiveKey,
    titleMapper,
  }
  const showPageHeader = useIntegratedLlamaHeader()

  return isSuccess && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <>
      {showPageHeader && (
        <PageHeader
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id as Chain}
          availableLiquidity={marketDetails.availableLiquidity}
          borrowRate={marketDetails.borrowRate}
          supplyRate={marketDetails.supplyRate}
        />
      )}
      <DetailPageLayout
        formTabs={
          chainId &&
          marketId &&
          !isLoanExistsLoading &&
          (loanExists ? (
            <ManageLoanTabs position={borrowPositionDetails} {...pageProps} />
          ) : (
            <LoanCreateTabs {...pageProps} params={params} />
          ))
        }
      >
        <CampaignRewardsBanner
          chainId={chainId}
          borrowAddress={market?.addresses?.controller || ''}
          supplyAddress={market?.addresses?.vault || ''}
        />
        <MarketInformationTabs currentTab={'borrow'} hrefs={{ borrow: '', supply: getVaultPathname(params, marketId) }}>
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
          {!showPageHeader && <MarketDetails {...marketDetails} />}
          <MarketInformationComp pageProps={pageProps} type="borrow" loanExists={loanExists} />
        </Stack>
      </DetailPageLayout>
    </>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
