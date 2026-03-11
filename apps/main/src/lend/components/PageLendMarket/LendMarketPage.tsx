import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { CampaignRewardsBanner } from '@/lend/components/CampaignRewardsBanner'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { LoanCreateTabs } from '@/lend/components/PageLendMarket/LoanCreateTabs'
import { ManageLoanTabs } from '@/lend/components/PageLendMarket/ManageLoanTabs'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { useMarketAlert } from '@/lend/hooks/useMarketAlert'
import { useTitleMapper } from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, isHighSeverityAlert, parseMarketParams } from '@/lend/utils/helpers'
import { PositionDetailsComposite, useBorrowPositionDetails } from '@/llamalend/features/market-position-details'
import type { UserCollateralEventsProps } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/user'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { isChain, type Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { MarketAlertBanner } from '../MarketAlertBanner'

export const LendMarketPage = () => {
  const { isHydrated } = useCurve()
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)

  const { data: market, isSuccess } = useOneWayMarket(chainId, rMarket)
  const { llamaApi: api = null, provider } = useCurve()
  const titleMapper = useTitleMapper()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)

  const marketId = market?.id ?? '' // todo: use market?.id directly everywhere since we pass the market too!
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)

  const network = networks[chainId]
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId,
    userAddress,
  })

  const [isLoaded, setLoaded] = useState(false)
  const [previewPrices, onPricesUpdated] = useState<Range<Decimal> | undefined>(undefined)
  const borrowPositionDetails = useBorrowPositionDetails({
    marketType: LlamaMarketType.Lend,
    chainId,
    marketId,
    market: market ?? null,
  })
  const activityQueryParams: UserCollateralEventsProps = {
    app: LlamaMarketType.Lend,
    chain: isChain(network.id) ? network.id : undefined,
    controllerAddress: market?.addresses?.controller as Address | undefined,
    userAddress,
    collateralToken: market?.collateral_token,
    borrowToken: market?.borrowed_token,
    network,
  }
  const marketAlert = useMarketAlert(chainId, market?.id)

  useEffect(() => {
    // delay fetch rest after form details are fetched first
    const timer = setTimeout(async () => {
      if (!api || !market || !isPageVisible) return
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
    api,
    fetchAllMarketDetails,
    fetchUserMarketBalances,
    fetchAllUserMarketDetails,
    isPageVisible,
    market,
    loanExists,
  ])

  useEffect(() => {
    if (api && market && isPageVisible) {
      if (loanExists) setMarketsStateKey('marketDetailsView', 'user')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true)
    }
  }, [api, isPageVisible, loanExists, market, setMarketsStateKey])

  const pageProps = {
    params,
    rChainId: chainId,
    rOwmId: marketId,
    userAddress,
    isLoaded,
    api,
    market,
    userActiveKey,
    titleMapper,
    onPricesUpdated,
  }

  return isSuccess && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <DetailPageLayout
      formTabs={
        chainId &&
        marketId &&
        !isLoanExistsLoading &&
        (loanExists ? (
          <ManageLoanTabs position={borrowPositionDetails} {...pageProps} />
        ) : (
          <LoanCreateTabs {...pageProps} params={params} />
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
      {marketAlert?.banner && <MarketAlertBanner alertType={marketAlert.alertType} banner={marketAlert.banner} />}
      {!isHighSeverityAlert(marketAlert?.alertType) && (
        <CampaignRewardsBanner
          chainId={chainId}
          borrowAddress={market?.addresses?.controller || ''}
          supplyAddress={market?.addresses?.vault || ''}
        />
      )}
      {loanExists === true && (
        <PositionDetailsComposite
          hasPosition={loanExists}
          borrowPositionDetails={borrowPositionDetails}
          activityQueryParams={activityQueryParams}
        />
      )}
      <Stack gap={PAGE_SPACING}>
        <MarketInformationComposite
          pageProps={pageProps}
          type="borrow"
          loanExists={loanExists}
          previewPrices={previewPrices}
        />
      </Stack>
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
