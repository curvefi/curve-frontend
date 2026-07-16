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
import { useIsInSoftLiquidation } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens, hasResetPosition } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { useMarketResetPosition, useMarketMobileFormDrawer } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { MarketType, MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const LendMarketPage = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const { isInitialized } = useCurve()
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)
  const isMobileFormDrawer = useMarketMobileFormDrawer()

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
    app: MarketType.Lend,
    chain: getBlockchainId(network.id),
    controllerAddress,
    userAddress,
    tokens,
    network,
  })
  const showReset = useMarketResetPosition() && hasResetPosition(market)
  const { data: isSoftLiquidation, isLoading: isSoftLiquidationLoading } = useIsInSoftLiquidation(
    queryParams,
    !!loanExists,
  )

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
            !isSoftLiquidationLoading &&
            (loanExists ? (
              <ManageLoanTabs
                onPricesUpdated={setPreviewPrices}
                collateralEvents={collateralEvents}
                showReset={showReset}
                isSoftLiquidation={!!isSoftLiquidation}
              />
            ) : (
              <CreateLoanTabs onPricesUpdated={setPreviewPrices} />
            )),
        }}
        header={<MarketPageHeader isLoading={isLoading} />}
      >
        <MarketBanners
          chainId={chainId}
          market={market}
          rewardsBanner={<CampaignRewardsBanner chainId={chainId} market={market} />}
        />
        <PositionDetailsComposite hasPosition={loanExists} events={collateralEvents} />
        <MarketInformationComposite rateType={MarketRateType.Borrow} previewPrices={previewPrices} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
