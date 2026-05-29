import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useSupplyPositionDetails } from '@/lend/hooks/useSupplyPositionDetails'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { SupplyPositionDetails } from '@/llamalend/features/market-position-details'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { MarketRateType } from '@ui-kit/types/market'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId } = parseMarketParams(params)
  const { llamaApi: api = null, provider, isHydrated } = useCurve()
  const { data: market, isSuccess } = useLendMarket(rChainId, rMarket)
  const network = networks[rChainId]

  const isPageVisible = useLayoutStore(state => state.isPageVisible)
  // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
  const fetchAllMarketDetails = useStore(state => state.markets.fetchAll)
  // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
  const fetchAllUserMarketDetails = useStore(state => state.user.fetchAll)
  // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
  const fetchUserMarketBalances = useStore(state => state.user.fetchUserMarketBalances)

  const marketId = market?.id ?? ''
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const { address: userAddress } = useConnection()
  // eslint-disable-next-line @eslint-react/use-state -- Existing violation before enabling this rule.
  const [isLoaded, setLoaded] = useState(false)

  const { data: loanExists } = useLoanExists({
    chainId: rChainId,
    marketId: market?.id,
    userAddress,
  })

  const supplyPositionDetails = useSupplyPositionDetails({
    chainId: rChainId,
    market,
    marketId,
    userAddress,
  })
  useEffect(() => {
    if (api && market && isPageVisible) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setLoaded(true)
      const timer = setTimeout(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
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
    marketId,
    userAddress,
    isLoaded,
    api,
    market,
    userActiveKey,
  }

  const hasSupplyPosition = (supplyPositionDetails.shares.value ?? 0) > 0

  return isSuccess && !market ? (
    <ErrorPage
      title="404"
      subtitle={`${t`Market`} ${rMarket} ${t`Not Found`}`}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : provider ? (
    <DetailPageLayout
      formTabs={rChainId && marketId && <VaultTabs {...pageProps} params={params} />}
      header={
        <PageHeader
          chainId={rChainId}
          marketId={marketId}
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id}
        />
      }
    >
      <MarketBanners
        chainId={rChainId}
        market={market}
        rewardsBanner={<CampaignRewardsBanner chainId={rChainId} market={market} />}
      />
      {hasSupplyPosition && <SupplyPositionDetails {...supplyPositionDetails} />}
      <MarketInformationComposite pageProps={pageProps} rateType={MarketRateType.Supply} />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
