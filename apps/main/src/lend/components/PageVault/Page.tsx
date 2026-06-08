import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useSupplyPositionDetails } from '@/lend/hooks/useSupplyPositionDetails'
import { networks } from '@/lend/networks'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { SupplyPositionDetails } from '@/llamalend/features/market-position-details'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { MarketRateType } from '@ui-kit/types/market'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId } = parseMarketParams(params)
  const { llamaApi: api = null, provider, isHydrated } = useCurve()
  const { data: market, isSuccess } = useLendMarket(rChainId, rMarket)
  const network = networks[rChainId]
  const marketId = market?.id ?? ''
  const { address: userAddress } = useConnection()

  const supplyPositionDetails = useSupplyPositionDetails({
    chainId: rChainId,
    market,
    marketId,
    userAddress,
  })

  useLendPageTitle(market?.collateral_token?.symbol, t`Supply`)

  const pageProps: PageContentProps = { params, rChainId, marketId, userAddress, api, market }

  const hasSupplyPosition = (supplyPositionDetails.shares.value ?? 0) > 0

  return isSuccess && !market ? (
    <ErrorPage
      title="404"
      subtitle={`${t`Market`} ${rMarket} ${t`Not Found`}`}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : provider ? (
    <DetailPageLayout
      formTabs={rChainId && marketId && <VaultTabs {...pageProps} params={params} />}
      header={
        <PageHeader
          chainId={rChainId}
          marketId={marketId}
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id}
        />
      }
    >
      <MarketBanners
        chainId={rChainId}
        market={market}
        rewardsBanner={<CampaignRewardsBanner chainId={rChainId} market={market} />}
      />
      {hasSupplyPosition && <SupplyPositionDetails {...supplyPositionDetails} />}
      <MarketInformationComposite pageProps={pageProps} rateType={MarketRateType.Supply} />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
