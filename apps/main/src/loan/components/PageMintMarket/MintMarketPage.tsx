import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useIsInLiquidation } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { getMarketSections } from '@/llamalend/widgets/market-section-nav'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { networks } from '@/loan/networks'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getChainId, getCollateralListPathname } from '@/loan/utils/utilsRouter'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useParams } from '@evm-ui/hooks/router'
import { useMarketMobileFormDrawer, useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@evm-ui/lib/i18n'
import { ErrorPage } from '@evm-ui/pages/ErrorPage'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import type { Range } from '@evm-ui/types/util'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { DetailPageSection as MarketSection } from '@evm-ui/widgets/DetailPageLayout/DetailPageSection'
import { useMintMarket } from '../../hooks/useMintMarket'

const MARKET_SECTIONS = getMarketSections({ rateType: MarketRateType.Borrow })

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { isInitialized } = useCurve()
  const chainId = getChainId(params)
  const { address } = useConnection()
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
  const isMobileFormDrawer = useMarketMobileFormDrawer()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()

  const marketQuery = useMintMarket({ chainId, rMarket: rCollateralId })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery

  const queryParams = { chainId, marketId: market?.id, userAddress: address }
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists(queryParams)

  const network = networks[chainId]
  const isLoading = !isInitialized || isMarketLoading
  const apiMarket = useLlamaMarket(
    {
      network: params.network,
      rMarket: rCollateralId,
      userAddress: address,
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    !isLoading && !market,
  )
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)

  const collateralEvents = useUserCollateralEvents({
    app: MarketType.Mint,
    chain: getBlockchainId(network.id),
    controllerAddress,
    userAddress: address,
    network,
    tokens,
  })
  const { data: isLiquidation, isLoading: isLiquidationLoading } = useIsInLiquidation(queryParams, !!loanExists)

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
      marketType={MarketType.Mint}
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
                isLiquidation={!!isLiquidation}
              />
            ) : (
              <CreateLoanTabs onPricesUpdated={setPreviewPrices} />
            )),
        }}
        header={<MarketPageHeader isLoading={isLoading} rateType={MarketRateType.Borrow} />}
        {...(isNewLlamaMarketDetailPage && { sections: MARKET_SECTIONS })}
      >
        <MarketBanners chainId={chainId} market={market} />
        <MarketSection id="position-details">
          <PositionDetailsComposite hasPosition={loanExists} events={collateralEvents} />
        </MarketSection>
        <MarketInformationComposite previewPrices={previewPrices} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
