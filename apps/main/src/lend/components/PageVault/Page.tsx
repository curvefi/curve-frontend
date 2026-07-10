import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { SupplyPositionDetails } from '@/llamalend/features/market-position-details'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { useUserBalances } from '@/llamalend/queries/user/user-balances.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { useLlamalendMobileFormDrawer } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const { isInitialized } = useCurve()
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const network = networks[chainId]
  const { address: userAddress } = useConnection()
  const isMobileFormDrawer = useLlamalendMobileFormDrawer()

  useLendPageTitle(market?.collateral_token?.symbol, t`Supply`)

  const isLoading = !isInitialized || isMarketLoading
  const apiMarket = useLlamaMarket(
    {
      rMarket,
      network: params.network,
      userAddress,
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    !isLoading && !market, // only enable API data when wallet is disconnected
  )
  const supplied = +(useUserBalances({ marketId: market?.id, chainId, userAddress }).data?.totalShares ?? 0)

  const error = marketError ?? apiMarket.error
  return error ? (
    <ErrorPage
      title={t`Error`}
      subtitle={error.message}
      error={error}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : (
    <MarketContextProvider
      network={network}
      marketQuery={marketQuery}
      apiMarket={apiMarket}
      marketType={LlamaMarketType.Lend}
    >
      <DetailPageLayout
        formTabs={{
          content: (market ?? apiMarket.data) && <VaultTabs />,
          placement: isMobileFormDrawer ? 'mobile-drawer' : 'inline',
        }}
        header={<MarketPageHeader isLoading={isLoading} />}
      >
        <MarketBanners
          chainId={chainId}
          market={market}
          rewardsBanner={<CampaignRewardsBanner chainId={chainId} market={market} />}
        />
        {market && supplied > 0 && <SupplyPositionDetails />}
        <MarketInformationComposite rateType={MarketRateType.Supply} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
