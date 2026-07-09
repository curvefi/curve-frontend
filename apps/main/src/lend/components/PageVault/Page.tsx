import { useRef } from 'react'
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
import { useUserShares } from '@/llamalend/queries/user/user-balances.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import {
  MarketSection,
  MarketSectionNav,
  type MarketSectionOption,
} from '@/llamalend/widgets/market-section-nav'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import Stack from '@mui/material/Stack'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
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
  const positionDetailsRef = useRef<HTMLElement | null>(null)
  const historicalRatesRef = useRef<HTMLElement | null>(null)
  const advancedDetailsRef = useRef<HTMLElement | null>(null)
  const faqsRef = useRef<HTMLElement | null>(null)

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
  const supplied = +(useUserShares({ marketId: market?.id, chainId, userAddress }).data?.value ?? 0)

  const error = marketError ?? apiMarket.error
  const hasSupplyPosition = !!market && supplied > 0
  const sectionRefs = {
    historicalRates: historicalRatesRef,
    advancedDetails: advancedDetailsRef,
    faqs: faqsRef,
  }
  const sections: MarketSectionOption[] = [
    ...(hasSupplyPosition
      ? [{ value: 'position-details' as const, label: t`Position Details`, ref: positionDetailsRef }]
      : []),
    { value: 'historical-rates', label: t`Historical Rates`, ref: historicalRatesRef },
    { value: 'advanced-details', label: t`Advanced Details`, ref: advancedDetailsRef },
    { value: 'faqs', label: t`FAQs`, ref: faqsRef },
  ]

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
        formTabs={(market ?? apiMarket.data) && <VaultTabs />}
        header={
          <Stack>
            <MarketPageHeader isLoading={isLoading} />
            <MarketSectionNav sections={sections} />
          </Stack>
        }
      >
        <MarketBanners
          chainId={chainId}
          market={market}
          rewardsBanner={<CampaignRewardsBanner chainId={chainId} market={market} />}
        />
        {hasSupplyPosition && (
          <MarketSection id="position-details" sectionRef={positionDetailsRef}>
            <SupplyPositionDetails />
          </MarketSection>
        )}
        <MarketInformationComposite rateType={MarketRateType.Supply} sectionRefs={sectionRefs} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
