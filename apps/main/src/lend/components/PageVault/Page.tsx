import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details/PositionDetailsComposite'
import { useUserSupplyEvents } from '@/llamalend/features/user-position-history/hooks/useUserSupplyEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getTokens, getVaultToken } from '@/llamalend/llama.utils'
import { useUserBalances } from '@/llamalend/queries/user/user-balances.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { getMarketSections } from '@/llamalend/widgets/market-section-nav/getMarketSections'
import { MarketPageHeader } from '@/llamalend/widgets/page-header/MarketPageHeader'
import { useMarketMobileFormDrawer, useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { MarketRateType, MarketType } from '@evm-ui/types/market'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { DetailPageSection as MarketSection } from '@ui/features/layout/DetailPageLayout/DetailPageSection'
import { PageState } from '@ui/features/layout/PageState'
import { mapQuery } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { useLendMarket } from '../../hooks/useLendMarket'
import { MarketCampaignRewardsBanner } from '../MarketCampaignRewardsBanner'

const MARKET_SECTIONS = getMarketSections({ rateType: MarketRateType.Supply })

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { marketId: rMarket, chainId } = parseMarketParams(params)
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market } = marketQuery
  const network = networks[chainId]
  const { address: userAddress } = useConnection()
  const isMobileFormDrawer = useMarketMobileFormDrawer()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()

  useLendPageTitle(market?.collateral_token?.symbol, t`Supply`)

  const { query, apiMarket } = useLlamaMarket(
    {
      rMarket,
      network: params.network,
      userAddress,
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    marketQuery,
  )
  const hasPosition = mapQuery(
    useUserBalances({ marketId: mapQuery(marketQuery, m => m?.id), chainId, userAddress }),
    balances => +(balances.totalShares ?? 0) > 0,
  )
  const events = useUserSupplyEvents({
    chainId,
    userAddress,
    tokens: getTokens(market, apiMarket.data) ?? {},
    vaultToken: getVaultToken(market, apiMarket.data),
  })

  return (
    <PageState
      query={query}
      notFound={t`Market Not Found`}
      continueUrl={getCollateralListPathname(params)}
      userAddress={userAddress}
    >
      <MarketContextProvider
        network={network}
        marketQuery={marketQuery}
        apiMarket={apiMarket}
        marketType={MarketType.Lend}
      >
        <DetailPageLayout
          formTabs={{
            content: query.data && <VaultTabs />,
            placement: isMobileFormDrawer ? 'mobile-drawer' : 'inline',
          }}
          header={<MarketPageHeader />}
          {...(isNewLlamaMarketDetailPage && { sections: MARKET_SECTIONS })}
        >
          <MarketBanners
            chainId={chainId}
            market={market}
            rewardsBanner={<MarketCampaignRewardsBanner chainId={chainId} market={market} />}
          />
          <MarketSection id="position-details">
            <PositionDetailsComposite type={MarketRateType.Supply} hasPosition={hasPosition} events={events} />
          </MarketSection>
          <MarketInformationComposite rateType={MarketRateType.Supply} />
        </DetailPageLayout>
      </MarketContextProvider>
    </PageState>
  )
}
