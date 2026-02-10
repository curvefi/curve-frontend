import { useEffect, useState } from 'react'
import { CampaignRewardsBanner } from '@/lend/components/CampaignRewardsBanner'
import { MarketInformationComp } from '@/lend/components/MarketInformationComp'
import { MarketInformationTabs } from '@/lend/components/MarketInformationTabs'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useMarketDetails } from '@/lend/hooks/useMarketDetails'
import { useSupplyPositionDetails } from '@/lend/hooks/useSupplyPositionDetails'
import { useTitleMapper } from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, getLoanPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { MarketDetails } from '@/llamalend/features/market-details'
import { NoPosition, SupplyPositionDetails } from '@/llamalend/features/market-position-details'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { PageHeader } from '@/llamalend/widgets/page-header/PageHeader'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { useMarketPageHeader } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

const { Spacing } = SizesAndSpaces

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId } = parseMarketParams(params)
  const { llamaApi: api = null, provider, isHydrated } = useCurve()
  const titleMapper = useTitleMapper()
  const { data: market, isSuccess } = useOneWayMarket(rChainId, rMarket)
  const network = networks[rChainId]

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)

  const rOwmId = market?.id ?? ''
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const { signerAddress } = api ?? {}
  const [isLoaded, setLoaded] = useState(false)

  const { data: loanExists } = useLoanExists({
    chainId: rChainId,
    marketId: market?.id,
    userAddress: signerAddress,
  })

  const supplyPositionDetails = useSupplyPositionDetails({
    chainId: rChainId,
    market,
    marketId: rOwmId,
  })
  const marketDetails = useMarketDetails({
    chainId: rChainId,
    market: market,
    marketId: rOwmId,
  })

  useEffect(() => {
    if (api && market && isPageVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true)
      const timer = setTimeout(
        () =>
          Promise.all([
            fetchAllMarketDetails(api, market, true),
            api.signerAddress &&
              (loanExists ? fetchAllUserMarketDetails(api, market, true) : fetchUserMarketBalances(api, market, true)),
          ]),
        REFRESH_INTERVAL['3s'],
      )
      return () => clearTimeout(timer)
    }
  }, [
    api,
    fetchAllMarketDetails,
    fetchAllUserMarketDetails,
    fetchUserMarketBalances,
    isPageVisible,
    loanExists,
    market,
  ])

  useLendPageTitle(market?.collateral_token?.symbol, t`Supply`)

  const pageProps: PageContentProps = {
    params,
    rChainId,
    rOwmId,
    isLoaded,
    api,
    market,
    userActiveKey: userActiveKey,
    titleMapper,
  }

  const positionDetailsHrefs = { borrow: getLoanPathname(params, rOwmId), supply: '' }
  const hasSupplyPosition = (supplyPositionDetails.shares.value ?? 0) > 0
  const showPageHeader = useMarketPageHeader()

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
      <DetailPageLayout formTabs={rChainId && rOwmId && <VaultTabs {...pageProps} params={params} />}>
        <CampaignRewardsBanner
          chainId={rChainId}
          borrowAddress={market?.addresses?.controller || ''}
          supplyAddress={market?.addresses?.vault || ''}
        />
        <MarketInformationTabs currentTab="supply" hrefs={positionDetailsHrefs}>
          {hasSupplyPosition ? (
            <SupplyPositionDetails {...supplyPositionDetails} />
          ) : (
            <Stack padding={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <NoPosition type="supply" />
            </Stack>
          )}
        </MarketInformationTabs>
        <Stack>
          <MarketDetails {...marketDetails} />
          <MarketInformationComp loanExists={loanExists} pageProps={pageProps} type="supply" />
        </Stack>
      </DetailPageLayout>
    </>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
