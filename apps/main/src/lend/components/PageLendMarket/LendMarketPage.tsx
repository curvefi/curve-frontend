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
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useIsInLiquidation } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens, hasResetPosition } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { getMarketSections } from '@/llamalend/widgets/market-section-nav'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useParams } from '@evm-ui/hooks/router'
import {
  useMarketResetPosition,
  useMarketMobileFormDrawer,
  useNewLlamaMarketDetailPage,
} from '@evm-ui/hooks/useFeatureFlags'
import { ErrorPage } from '@evm-ui/pages/ErrorPage'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { DetailPageSection as MarketSection } from '@evm-ui/widgets/DetailPageLayout/DetailPageSection'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

const MARKET_SECTIONS = getMarketSections({ rateType: MarketRateType.Borrow })

export const LendMarketPage = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const { isInitialized } = useCurve()
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)
  const isMobileFormDrawer = useMarketMobileFormDrawer()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()

  const network = networks[chainId]
  const queryParams = { chainId, marketId: market?.id, userAddress }
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists(queryParams)

  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
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
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const collateralEvents = useUserCollateralEvents({
    chainId,
    blockchainId: getPricesApiBlockchainId(network.blockchainId),
    app: MarketType.Lend,
    controllerAddress,
    userAddress,
    tokens,
  })
  const showReset = useMarketResetPosition() && hasResetPosition(market)
  const { data: isLiquidation, isLoading: isLiquidationLoading } = useIsInLiquidation(queryParams, !!loanExists)

  const error = marketError ?? apiMarket.error
  return error ? (
    <ErrorPage title={t`Error`} subtitle={error.message} continueUrl={getCollateralListPathname(params)} />
  ) : (
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
            !isLoading &&
            !isLoanExistsLoading &&
            !isLiquidationLoading &&
            (loanExists ? (
              <ManageLoanTabs
                onPricesUpdated={setPreviewPrices}
                collateralEvents={collateralEvents}
                showReset={showReset}
                isLiquidation={!!isLiquidation}
              />
            ) : (
              <CreateLoanTabs onPricesUpdated={setPreviewPrices} />
            )),
        }}
        header={<MarketPageHeader isLoading={isLoading} rateType={MarketRateType.Borrow} />}
        {...(isNewLlamaMarketDetailPage && { sections: MARKET_SECTIONS })}
      >
        <MarketBanners
          chainId={chainId}
          market={market}
          rewardsBanner={<CampaignRewardsBanner chainId={chainId} market={market} />}
        />
        <MarketSection id="position-details">
          <PositionDetailsComposite hasPosition={loanExists} events={collateralEvents} />
        </MarketSection>
        <MarketInformationComposite rateType={MarketRateType.Borrow} previewPrices={previewPrices} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
