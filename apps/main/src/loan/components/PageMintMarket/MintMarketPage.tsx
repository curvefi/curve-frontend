import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { useIsInLiquidation } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details/PositionDetailsComposite'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user/user-loan-exists.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { getMarketSections } from '@/llamalend/widgets/market-section-nav/getMarketSections'
import { MarketPageHeader } from '@/llamalend/widgets/page-header/MarketPageHeader'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { networks } from '@/loan/networks'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getChainId, getCollateralListPathname } from '@/loan/utils/utilsRouter'
import { useMarketMobileFormDrawer, useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { AlertDisableForm } from '@ui/features/forms/AlertDisableForm'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { DetailPageSection as MarketSection } from '@ui/features/layout/DetailPageLayout/DetailPageSection'
import { PageState } from '@ui/features/layout/PageState'
import type { Range } from '@ui/features/queries/util'
import { mapQuery, q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { useMintMarket } from '../../hooks/useMintMarket'

const MARKET_SECTIONS = getMarketSections({ rateType: MarketRateType.Borrow })

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const chainId = getChainId(params)
  const { address } = useConnection()
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
  const isMobileFormDrawer = useMarketMobileFormDrawer()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()

  const marketQuery = useMintMarket({ chainId, rMarket: rCollateralId })
  const { data: market } = marketQuery

  const queryParams = { chainId, marketId: mapQuery(marketQuery, m => m?.id), userAddress: address }
  const loanExists = q(useLoanExists(queryParams))

  const network = networks[chainId]
  const { query, apiMarket } = useLlamaMarket(
    {
      network: params.network,
      rMarket: rCollateralId,
      marketType: MarketType.Mint,
      userAddress: address,
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    marketQuery,
  )
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)

  const collateralEvents = useUserCollateralEvents({
    app: MarketType.Mint,
    chainId,
    controllerAddress,
    userAddress: address,
    tokens,
  })
  const { data: isLiquidation, isLoading: isLiquidationLoading } = useIsInLiquidation(queryParams, !!loanExists.data)

  return (
    <PageState
      query={query}
      notFound={t`Market Not Found`}
      continueUrl={getCollateralListPathname(params)}
      userAddress={address}
    >
      <MarketContextProvider
        network={network}
        marketQuery={marketQuery}
        apiMarket={apiMarket}
        marketType={MarketType.Mint}
      >
        <DetailPageLayout
          formTabs={{
            placement: isMobileFormDrawer ? 'mobile-drawer' : 'inline',
            content: market
              ? !loanExists.isLoading &&
                !(loanExists.data && isLiquidationLoading) &&
                (loanExists.data ? (
                  <ManageLoanTabs
                    onPricesUpdated={setPreviewPrices}
                    collateralEvents={collateralEvents}
                    isLiquidation={!!isLiquidation}
                  />
                ) : (
                  <CreateLoanTabs onPricesUpdated={setPreviewPrices} />
                ))
              : marketQuery.error && <AlertDisableForm>{marketQuery.error.message}</AlertDisableForm>,
          }}
          header={<MarketPageHeader />}
          {...(isNewLlamaMarketDetailPage && { sections: MARKET_SECTIONS })}
        >
          <MarketBanners chainId={chainId} market={market} />
          <MarketSection id="position-details">
            <PositionDetailsComposite
              type={MarketRateType.Borrow}
              hasPosition={loanExists}
              events={mapQuery(collateralEvents, data => data.events)}
            />
          </MarketSection>
          <MarketInformationComposite previewPrices={previewPrices} />
        </DetailPageLayout>
      </MarketContextProvider>
    </PageState>
  )
}
