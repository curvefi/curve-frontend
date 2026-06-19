import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/lend/components/PageLendMarket/CreateLoanTabs'
import { type LendManageLoanProps, ManageLoanTabs } from '@/lend/components/PageLendMarket/ManageLoanTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const LendMarketPage = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const { data: market, isLoading: isMarketLoading, error: marketError } = useLendMarket({ chainId, rMarket })
  const { llamaApi: api = null, isInitialized } = useCurve()
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)

  const network = networks[chainId]
  const tokens = useMemo(() => (market ? getTokens(market) : {}), [market])
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId: market?.id,
    userAddress,
  })

  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Lend,
    chain: getBlockchainId(network.id),
    controllerAddress: getControllerAddress(market),
    userAddress,
    tokens,
    network,
  })

  const isLoading = !isInitialized || isMarketLoading
  const useApiData = !isLoading && !market?.id
  const apiMarket = useLlamaMarket(
    {
      rMarket,
      network: params.network,
      marketType: LlamaMarketType.Lend,
      userAddress,
      enableLLv2: useLLv2(),
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    useApiData,
  )

  const pageProps: Omit<LendManageLoanProps, 'collateralEvents'> = {
    params,
    rChainId: chainId,
    userAddress,
    api,
    market,
    onPricesUpdated: setPreviewPrices,
    apiMarket,
  }

  const error = marketError ?? apiMarket.error
  return error ? (
    <ErrorPage title={t`Error`} subtitle={error.message} continueUrl={getCollateralListPathname(params)} />
  ) : (
    <DetailPageLayout
      formTabs={
        ((!!market && !isLoanExistsLoading) || apiMarket.data) &&
        (loanExists ? (
          <ManageLoanTabs {...pageProps} collateralEvents={collateralEvents} />
        ) : (
          <CreateLoanTabs {...pageProps} params={params} />
        ))
      }
      header={
        <MarketPageHeader
          blockchainId={network.id}
          chainId={chainId}
          isLoading={isLoading}
          market={market}
          marketType={LlamaMarketType.Lend}
          apiMarket={apiMarket}
        />
      }
    >
      <MarketBanners
        chainId={chainId}
        market={market}
        rewardsBanner={<CampaignRewardsBanner chainId={chainId} market={market} />}
      />
      <PositionDetailsComposite
        hasPosition={loanExists}
        events={collateralEvents}
        tokens={tokens}
        params={{ chainId, marketId: market?.id, userAddress }}
      />
      <MarketInformationComposite
        pageProps={pageProps}
        rateType={MarketRateType.Borrow}
        previewPrices={previewPrices}
      />
    </DetailPageLayout>
  )
}
