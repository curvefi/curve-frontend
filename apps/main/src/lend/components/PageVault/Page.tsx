import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { MarketOverviewCard } from '@/llamalend/features/market-advanced-information'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { SupplyPositionDetails } from '@/llamalend/features/market-position-details'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { useUserBalances } from '@/llamalend/queries/user/user-balances.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { getMarketSections, MarketSection, MarketSectionNav } from '@/llamalend/widgets/market-section-nav'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { useLlamaMarketDetailPageV2, useMarketMobileFormDrawer } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { MarketType, MarketRateType } from '@ui-kit/types/market'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

const MARKET_SECTIONS = {
  withPosition: getMarketSections({ rateType: MarketRateType.Supply }),
  withoutPosition: getMarketSections({ rateType: MarketRateType.Supply, hasPosition: false }),
}

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const { isInitialized } = useCurve()
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const network = networks[chainId]
  const { address: userAddress } = useConnection()
  const isMobileFormDrawer = useMarketMobileFormDrawer()
  const isMarketDetailPageV2 = useLlamaMarketDetailPageV2()

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
  const hasPosition = !!market && supplied > 0
  const sections = hasPosition ? MARKET_SECTIONS.withPosition : MARKET_SECTIONS.withoutPosition

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
      marketType={MarketType.Lend}
    >
      <DetailPageLayout
        formTabs={{
          content: (market ?? apiMarket.data) && <VaultTabs />,
          placement: isMobileFormDrawer ? 'mobile-drawer' : 'inline',
        }}
        header={
          <MarketPageHeader
            isLoading={isLoading}
            primaryRateType={MarketRateType.Supply}
            metricsBelowTitle={isMarketDetailPageV2}
          />
        }
        pageNavigation={isMarketDetailPageV2 ? <MarketSectionNav sections={sections} /> : undefined}
      >
        <MarketBanners
          chainId={chainId}
          market={market}
          rewardsBanner={<CampaignRewardsBanner chainId={chainId} market={market} />}
        />
        {isMarketDetailPageV2 ? (
          <>
            {hasPosition && (
              <MarketSection id="position-details" ariaLabel={t`Position details`}>
                <SupplyPositionDetails positionLabel={t`Your position`} />
              </MarketSection>
            )}
            <MarketSection id="market-overview" ariaLabel={t`Overview`}>
              <MarketOverviewCard />
            </MarketSection>
          </>
        ) : (
          hasPosition && <SupplyPositionDetails positionLabel={t`Supply Details`} />
        )}
        <MarketInformationComposite rateType={MarketRateType.Supply} isMarketDetailPageV2={isMarketDetailPageV2} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
