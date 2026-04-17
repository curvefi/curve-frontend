import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { CampaignRewardsBanner } from '@/lend/components/CampaignRewardsBanner'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { VaultTabs } from '@/lend/components/PageVault/VaultTabs'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useMarketAlert } from '@/lend/hooks/useMarketAlert'
import { useSupplyPositionDetails } from '@/lend/hooks/useSupplyPositionDetails'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { isHighSeverityAlert } from '@/lend/utils/helpers'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { SupplyPositionDetails } from '@/llamalend/features/market-position-details'
import { TryNewLlamalend } from '@/llamalend/features/try-new-llamalend/TryNewLlamalend'
import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { BadDebtBanner } from '@/llamalend/widgets/BadDebtBanner'
import { MarketAlertBanner } from '@/llamalend/widgets/MarketAlertBanner'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { type Chain } from '@curvefi/prices-api'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

export const Page = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId } = parseMarketParams(params)
  const { llamaApi: api = null, provider, isHydrated } = useCurve()
  const { data: market, isSuccess } = useOneWayMarket(rChainId, rMarket)
  const network = networks[rChainId]

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)

  const rOwmId = market?.id ?? ''
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const { address: userAddress } = useConnection()
  const [isLoaded, setLoaded] = useState(false)

  const { data: loanExists } = useLoanExists({
    chainId: rChainId,
    marketId: market?.id,
    userAddress,
  })

  const supplyPositionDetails = useSupplyPositionDetails({
    chainId: rChainId,
    market,
    marketId: rOwmId,
    userAddress,
  })
  const marketAlert = useMarketAlert(rChainId, rOwmId)
  const controllerAddress = getControllerAddress(market)
  const { data: solvencyMarket } = useSolvencyMarket({
    type: LlamaMarketType.Lend,
    blockchainId: network.id,
    controllerAddress,
  })

  useEffect(() => {
    if (api && market && isPageVisible) {
      setLoaded(true)
      const timer = setTimeout(
        () =>
          Promise.all([
            fetchAllMarketDetails(api, market, true),
            api.signerAddress &&
              (loanExists ? fetchAllUserMarketDetails(api, market, true) : fetchUserMarketBalances(api, market, true)),
          ]),
        REFRESH_INTERVAL['3s'],
      )
      return () => clearTimeout(timer)
    }
  }, [
    api,
    fetchAllMarketDetails,
    fetchAllUserMarketDetails,
    fetchUserMarketBalances,
    isPageVisible,
    loanExists,
    market,
  ])

  useLendPageTitle(market?.collateral_token?.symbol, t`Supply`)

  const pageProps: PageContentProps = {
    params,
    rChainId,
    rOwmId,
    userAddress,
    isLoaded,
    api,
    market,
    userActiveKey,
  }

  const hasSupplyPosition = (supplyPositionDetails.shares.value ?? 0) > 0

  return isSuccess && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <DetailPageLayout
      formTabs={rChainId && rOwmId && <VaultTabs {...pageProps} params={params} />}
      header={
        <PageHeader
          chainId={rChainId}
          marketId={rOwmId}
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id as Chain}
        />
      }
    >
      {!marketAlert?.banner && loanExists === true && <TryNewLlamalend />}
      {marketAlert?.banner && <MarketAlertBanner alertType={marketAlert.alertType} banner={marketAlert.banner} />}
      {solvencyMarket && <BadDebtBanner {...solvencyMarket} />}
      {!isHighSeverityAlert(marketAlert?.alertType) && (
        <CampaignRewardsBanner
          chainId={rChainId}
          borrowAddress={market?.addresses?.controller || ''}
          supplyAddress={market?.addresses?.vault || ''}
        />
      )}
      {hasSupplyPosition && <SupplyPositionDetails {...supplyPositionDetails} />}
      <MarketInformationComposite loanExists={loanExists} pageProps={pageProps} type="supply" />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
