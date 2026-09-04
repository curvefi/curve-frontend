import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import {
  MarketEmptyPosition,
  SupplyPositionDetails,
  SupplyPositionDetailsCard,
} from '@/llamalend/features/market-position-details'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { useUserBalances } from '@/llamalend/queries/user/user-balances.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { getMarketSections } from '@/llamalend/widgets/market-section-nav'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useParams } from '@evm-ui/hooks/router'
import { useMarketMobileFormDrawer, useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { ErrorPage } from '@evm-ui/pages/ErrorPage'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { DetailPageSection as MarketSection } from '@evm-ui/widgets/DetailPageLayout/DetailPageSection'
import { t } from '@ui/lib/i18n'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

const MARKET_SECTIONS = getMarketSections({ rateType: MarketRateType.Supply })

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const { isInitialized } = useCurve()
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const network = networks[chainId]
  const { address: userAddress } = useConnection()
  const isMobileFormDrawer = useMarketMobileFormDrawer()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()

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
        header={<MarketPageHeader isLoading={isLoading} rateType={MarketRateType.Supply} />}
        {...(isNewLlamaMarketDetailPage && { sections: MARKET_SECTIONS })}
      >
        <MarketBanners
          chainId={chainId}
          market={market}
          rewardsBanner={<CampaignRewardsBanner chainId={chainId} market={market} />}
        />
        <MarketSection id="position-details">
          {hasPosition ? (
            <SupplyPositionDetails />
          ) : (
            <SupplyPositionDetailsCard>
              <MarketEmptyPosition type={MarketRateType.Supply} />
            </SupplyPositionDetailsCard>
          )}
        </MarketSection>
        <MarketInformationComposite rateType={MarketRateType.Supply} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
