import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { SupplyPositionDetails } from '@/llamalend/features/market-position-details'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { useUserShares } from '@/llamalend/queries/user/user-balances.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { mapQuery } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const { llamaApi: api = null, provider, isHydrated } = useCurve()
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market, isLoading: isMarketLoading, error } = marketQuery
  const network = networks[chainId]
  const { address: userAddress } = useConnection()

  useLendPageTitle(market?.collateral_token?.symbol, t`Supply`)

  const pageProps: PageContentProps = {
    params,
    chainId,
    marketId: market?.id ?? '',
    userAddress,
    api,
    marketQuery,
  }

  const supplied = +(useUserShares({ marketId: market?.id, chainId, userAddress }).data?.value ?? 0)

  return error ? (
    <ErrorPage
      title={t`Error`}
      subtitle={error.message}
      error={error}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : provider ? (
    <DetailPageLayout
      formTabs={chainId && <VaultTabs {...pageProps} params={params} />}
      header={
        <MarketPageHeader
          blockchainId={network.id}
          chainId={chainId}
          marketId={market?.id}
          isLoading={!isHydrated || isMarketLoading}
          marketQuery={marketQuery}
          marketType={LlamaMarketType.Lend}
        />
      }
    >
      <MarketBanners
        chainId={chainId}
        controllerAddress={mapQuery(marketQuery, getControllerAddress)}
        marketType={LlamaMarketType.Lend}
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
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
