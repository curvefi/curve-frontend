import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { PositionDetailsComposite, useBorrowPositionDetails } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { useMintMarket } from '@/loan/entities/mint-markets'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getCollateralListPathname, useChainId } from '@/loan/utils/utilsRouter'
import { isPricesApiChain, type Chain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { CRVUSD } from '@ui-kit/utils/address'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { llamaApi: curve = null, isHydrated, provider } = useCurve()
  const rChainId = useChainId(params)
  const { address } = useConnection()
  const [loaded, setLoaded] = useState(false)
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)

  const market = useMintMarket({ chainId: rChainId, marketId: rCollateralId })
  const marketId = market?.id ?? ''

  const { data: loanExists } = useLoanExists({ chainId: rChainId, marketId, userAddress: address })
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)

  const loanStatus = useUserLoanDetails(market?.id ?? '')?.userStatus?.colorKey ?? ''
  const network = networks[rChainId]
  const controllerAddress = getControllerAddress(market)
  const borrowPositionDetails = useBorrowPositionDetails({
    marketType: LlamaMarketType.Mint,
    chainId: rChainId,
    marketId,
    market: market ?? null,
  })
  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Mint,
    chain: isPricesApiChain(network.id) ? network.id : undefined,
    controllerAddress,
    userAddress: curve?.signerAddress,
    collateralToken: market
      ? {
          symbol: market.collateralSymbol,
          address: market.collateral,
          decimals: market.collateralDecimals,
          name: market.collateralSymbol,
        }
      : undefined,
    borrowToken: CRVUSD,
    network,
  })
  useEffect(() => {
    if (isHydrated && curve && market) {
      void (async () => {
        await fetchLoanDetails(curve, market)
        setLoaded(true)
      })()
    }
  }, [isHydrated, curve, market, fetchLoanDetails])

  usePageVisibleInterval(async () => {
    if (curve?.signerAddress && market && loanExists) {
      await fetchLoanDetails(curve, market)
    }
  }, REFRESH_INTERVAL['1m'])

  const formProps = {
    curve,
    isReady: !!curve?.signerAddress && !!market,
    market: market ?? null,
    rChainId,
    params,
    onPricesUpdated: setPreviewPrices,
  }

  const isLoading = !loaded || (loanExists && !loanStatus)
  return isHydrated && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <DetailPageLayout
      formTabs={
        !isLoading &&
        (loanExists ? (
          <ManageLoanTabs
            {...formProps}
            collateralEvents={collateralEvents}
            isInSoftLiquidation={loanStatus !== 'healthy'}
          />
        ) : (
          <CreateLoanTabs {...formProps} />
        ))
      }
      header={
        <PageHeader
          chainId={rChainId}
          marketId={marketId}
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id as Chain}
        />
      }
    >
      <MarketBanners chainId={rChainId} market={market} />
      <PositionDetailsComposite
        hasPosition={loanExists}
        borrowPositionDetails={borrowPositionDetails}
        events={collateralEvents}
      />
      <MarketInformationComposite
        market={market ?? null}
        marketId={marketId}
        chainId={rChainId}
        page="manage"
        previewPrices={previewPrices}
      />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
