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
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import {
  getControllerAddress,
  getCrvTokenAddress,
  getGaugeAddress,
  getAmmAddress,
  getMarketBandRange,
  getTokens,
  getVaultToken,
  getZapAddress,
} from '@/llamalend/llama.utils'
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
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId: market?.id,
    userAddress,
  })

  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
  const isLoading = !isInitialized || isMarketLoading
  const apiMarket = useLlamaMarket(
    {
      rMarket,
      network: params.network,
      userAddress,
      enableLLv2: useLLv2(),
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    !isLoading && !market, // only enable API data when wallet is disconnected
  )
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const { minBands, maxBands } = getMarketBandRange(market, apiMarket.data) ?? {}
  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Lend,
    chain: getBlockchainId(network.id),
    controllerAddress,
    userAddress,
    tokens,
    network,
  })

  const pageProps: Omit<LendManageLoanProps, 'collateralEvents'> = {
    params,
    chainId,
    userAddress,
    api,
    market,
    marketId: market?.id,
    ammAddress: getAmmAddress(market, apiMarket.data),
    zapAddress: getZapAddress(market),
    controllerAddress,
    tokens,
    marketType: LlamaMarketType.Lend,
    vaultToken: getVaultToken(market, apiMarket.data),
    gaugeAddress: getGaugeAddress(market),
    minBands,
    maxBands,
    crvTokenAddress: getCrvTokenAddress(market),
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
