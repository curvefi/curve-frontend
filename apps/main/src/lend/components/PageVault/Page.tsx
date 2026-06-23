import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { SupplyPositionDetails } from '@/llamalend/features/market-position-details'
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
import { useUserShares } from '@/llamalend/queries/user/user-balances.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const { llamaApi: api = null, isInitialized } = useCurve()
  const { data: market, isLoading: isMarketLoading, error: marketError } = useLendMarket({ chainId, rMarket })
  const network = networks[chainId]
  const { address: userAddress } = useConnection()

  useLendPageTitle(market?.collateral_token?.symbol, t`Supply`)

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
  const tokens = getTokens(market, apiMarket.data) ?? {}
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const { minBands, maxBands } = getMarketBandRange(market, apiMarket.data) ?? {}

  const pageProps: PageContentProps = {
    params,
    chainId,
    userAddress,
    api,
    market,
    marketId: market?.id,
    ammAddress: getAmmAddress(market, apiMarket.data),
    zapAddress: market && getZapAddress(market),
    controllerAddress,
    tokens,
    marketType: LlamaMarketType.Lend,
    vaultToken: getVaultToken(market, apiMarket.data),
    gaugeAddress: getGaugeAddress(market),
    minBands,
    maxBands,
    crvTokenAddress: getCrvTokenAddress(market),
    apiMarket,
  }

  const supplied = +(useUserShares({ marketId: market?.id, chainId, userAddress }).data?.value ?? 0)

  const error = marketError ?? apiMarket.error
  return error ? (
    <ErrorPage
      title={t`Error`}
      subtitle={error.message}
      error={error}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : (
    <DetailPageLayout
      formTabs={(market ?? apiMarket.data) && <VaultTabs {...pageProps} params={params} />}
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
      {market && supplied > 0 && (
        <SupplyPositionDetails
          chainId={chainId}
          market={market}
          userAddress={userAddress}
          blockchainId={networks[chainId].id}
        />
      )}
      <MarketInformationComposite pageProps={pageProps} rateType={MarketRateType.Supply} />
    </DetailPageLayout>
  )
}
