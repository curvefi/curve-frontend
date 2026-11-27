import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/lend/components/PageLendMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/lend/components/PageLendMarket/ManageLoanTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { useIsInLiquidation } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details/PositionDetailsComposite'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens, hasResetPosition } from '@/llamalend/llama.utils'
import { useMarketCollateralRewardsEnabled } from '@/llamalend/queries/market/market-collateral-rewards-enabled.query'
import { useLoanExists } from '@/llamalend/queries/user/user-loan-exists.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { getMarketSections } from '@/llamalend/widgets/market-section-nav/getMarketSections'
import { MarketPageHeader } from '@/llamalend/widgets/page-header/MarketPageHeader'
import {
  useMarketResetPosition,
  useMarketMobileFormDrawer,
  useNewLlamaMarketDetailPage,
} from '@evm-ui/hooks/useFeatureFlags'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { DetailPageSection as MarketSection } from '@ui/features/layout/DetailPageLayout/DetailPageSection'
import { PageState } from '@ui/features/layout/PageState'
import type { Range } from '@ui/features/queries/util'
import { mapQuery, q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { useLendMarket } from '../../hooks/useLendMarket'
import { MarketCampaignRewardsBanner } from '../MarketCampaignRewardsBanner'

const MARKET_SECTIONS = getMarketSections({ rateType: MarketRateType.Borrow })

export const LendMarketPage = () => {
  const params = useParams<MarketUrlParams>()
  const { marketId: rMarket, chainId } = parseMarketParams(params)
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market } = marketQuery
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)
  const isMobileFormDrawer = useMarketMobileFormDrawer()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()

  const network = networks[chainId]
  const queryParams = { chainId, marketId: mapQuery(marketQuery, m => m?.id), userAddress }
  const loanExists = q(useLoanExists(queryParams))
  const { data: collateralRewardsEnabled } = useMarketCollateralRewardsEnabled(queryParams)
  const showCollateralClaim = collateralRewardsEnabled === true

  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
  const { query, apiMarket } = useLlamaMarket(
    {
      rMarket,
      network: params.network,
      userAddress,
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    marketQuery,
  )
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const collateralEvents = useUserCollateralEvents({
    chainId,
    app: MarketType.Lend,
    controllerAddress,
    userAddress,
    tokens,
  })
  const showReset = useMarketResetPosition() && hasResetPosition(market)
  const { data: isLiquidation, isLoading: isLiquidationLoading } = useIsInLiquidation(queryParams, !!loanExists.data)

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
            placement: isMobileFormDrawer ? 'mobile-drawer' : 'inline',
            content:
              !query.isLoading &&
              !loanExists.isLoading &&
              !(loanExists.data && isLiquidationLoading) &&
              (loanExists.data ? (
                <ManageLoanTabs
                  onPricesUpdated={setPreviewPrices}
                  collateralEvents={collateralEvents}
                  showReset={showReset}
                  showCollateralClaim={showCollateralClaim}
                  isLiquidation={!!isLiquidation}
                />
              ) : (
                <CreateLoanTabs onPricesUpdated={setPreviewPrices} showCollateralClaim={showCollateralClaim} />
              )),
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
            <PositionDetailsComposite
              type={MarketRateType.Borrow}
              hasPosition={loanExists}
              events={mapQuery(collateralEvents, data => data.events)}
            />
          </MarketSection>
          <MarketInformationComposite rateType={MarketRateType.Borrow} previewPrices={previewPrices} />
        </DetailPageLayout>
      </MarketContextProvider>
    </PageState>
  )
}
