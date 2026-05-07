import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/lend/components/PageLendMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/lend/components/PageLendMarket/ManageLoanTabs'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/helpers'
import { PositionDetailsComposite, useBorrowPositionDetails } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { PageHeader } from '@/llamalend/widgets/page-header'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type Chain, isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { ConnectWalletPrompt, type LlamaApi, useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { useLoanSlices } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

function useLegacyFetching({
  api,
  market,
  loanExists,
}: {
  api: LlamaApi | null
  market: LendMarketTemplate | undefined
  loanExists: boolean | undefined
}) {
  const enabled = useLoanSlices()
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const isPageVisible = useLayoutStore(state => state.isPageVisible)
  const fetchAllMarketDetails = useStore(state => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore(state => state.user.fetchUserMarketBalances)
  const fetchAllUserMarketDetails = useStore(state => state.user.fetchAll)
  const setMarketsStateKey = useStore(state => state.markets.setStateByKey)
  useEffect(() => {
    // delay fetch rest after form details are fetched first
    const timer = setTimeout(async () => {
      if (!api || !market || !isPageVisible || !enabled) return
      await fetchAllMarketDetails(api, market, true)
      if (api.signerAddress) {
        await fetchUserMarketBalances(api, market, true)
        if (loanExists) {
          void fetchAllUserMarketDetails(api, market, true)
        }
      }
    }, REFRESH_INTERVAL['3s'])
    return () => clearTimeout(timer)
  }, [
    enabled,
    api,
    fetchAllMarketDetails,
    fetchUserMarketBalances,
    fetchAllUserMarketDetails,
    isPageVisible,
    market,
    loanExists,
  ])

  useEffect(() => {
    if (market && loanExists && enabled) setMarketsStateKey('marketDetailsView', 'user')
  }, [loanExists, setMarketsStateKey, enabled, market])
  return userActiveKey
}

export const LendMarketPage = () => {
  const { isHydrated } = useCurve()
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const { data: market, isSuccess } = useOneWayMarket(chainId, rMarket)
  const { llamaApi: api = null, provider } = useCurve()

  const marketId = market?.id ?? '' // todo: use market?.id directly everywhere since we pass the market too!
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)

  const network = networks[chainId]
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId,
    userAddress,
  })

  const [previewPrices, onPricesUpdated] = useState<Range<Decimal> | undefined>(undefined)
  const controllerAddress = getControllerAddress(market)
  const borrowPositionDetails = useBorrowPositionDetails({
    marketType: LlamaMarketType.Lend,
    chainId,
    marketId,
    market: market ?? null,
  })
  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Lend,
    chain: isPricesApiChain(network.id) ? network.id : undefined,
    controllerAddress,
    userAddress,
    collateralToken: market?.collateral_token,
    borrowToken: market?.borrowed_token,
    network,
  })

  const pageProps = {
    params,
    rChainId: chainId,
    rOwmId: marketId,
    userAddress,
    isLoaded: !!market,
    api,
    market,
    userActiveKey: useLegacyFetching({ api, market, loanExists }),
    onPricesUpdated,
  }

  return isSuccess && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <DetailPageLayout
      formTabs={
        market &&
        !isLoanExistsLoading &&
        (loanExists ? (
          <ManageLoanTabs {...pageProps} collateralEvents={collateralEvents} position={borrowPositionDetails} />
        ) : (
          <CreateLoanTabs {...pageProps} params={params} />
        ))
      }
      header={
        <PageHeader
          chainId={chainId}
          marketId={marketId}
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id as Chain}
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
        borrowPositionDetails={borrowPositionDetails}
        events={collateralEvents}
      />
      <MarketInformationComposite pageProps={pageProps} type="borrow" previewPrices={previewPrices} />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
