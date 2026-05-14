import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { type CollateralUrlParams, type LlamaApi } from '@/loan/types/loan.types'
import { getCollateralListPathname, useChainId } from '@/loan/utils/utilsRouter'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type Chain, isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { useLoanSlices } from '@ui-kit/hooks/useFeatureFlags'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { CRVUSD } from '@ui-kit/utils/address'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useMintMarket } from '../../hooks/useMintMarket'

function useLegacyFetching({
  market,
  loanExists,
  curve,
}: {
  curve: LlamaApi | null
  market: MintMarketTemplate | undefined
  loanExists: boolean | undefined
}) {
  const enabled = useLoanSlices()
  const [loaded, setLoaded] = useState(!enabled)
  const fetchLoanDetails = useStore(state => state.loans.fetchLoanDetails)
  useEffect(() => {
    if (curve && market) {
      void (async () => {
        await fetchLoanDetails(curve, market)
        setLoaded(true)
      })()
    }
  }, [curve, market, fetchLoanDetails])

  usePageVisibleInterval(async () => {
    if (curve?.signerAddress && market && loanExists) {
      await fetchLoanDetails(curve, market)
    }
  }, REFRESH_INTERVAL['1m'])
  return loaded
}

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { llamaApi: curve = null, isHydrated, provider } = useCurve()
  const rChainId = useChainId(params)
  const { address } = useConnection()
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)

  const { data: market, isSuccess } = useMintMarket({ chainId: rChainId, marketId: rCollateralId })
  const userMarketParams = { chainId: rChainId, marketId: market?.id, userAddress: address }
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId: rChainId,
    marketId: market?.id,
    userAddress: address,
  })

  const network = networks[rChainId]

  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Mint,
    chain: isPricesApiChain(network.id) ? network.id : undefined,
    controllerAddress: getControllerAddress(market),
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
  const loaded = useLegacyFetching({ curve, market, loanExists })

  const pageProps = {
    curve,
    isReady: !!curve?.signerAddress && !!market,
    market: market ?? null,
    rChainId,
    params,
    onPricesUpdated: setPreviewPrices,
  }

  return isSuccess && !market ? (
    <ErrorPage
      title="404"
      subtitle={`${t`Market`} ${rCollateralId} ${t`Not Found`}`}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : provider ? (
    <DetailPageLayout
      formTabs={
        loaded &&
        !isLoanExistsLoading &&
        (loanExists ? (
          <ManageLoanTabs {...pageProps} collateralEvents={collateralEvents} />
        ) : (
          <CreateLoanTabs {...pageProps} />
        ))
      }
      header={
        <PageHeader
          chainId={rChainId}
          marketId={market?.id ?? ''}
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id as Chain}
        />
      }
    >
      <MarketBanners chainId={rChainId} market={market} />
      <PositionDetailsComposite
        market={market}
        params={userMarketParams}
        hasPosition={loanExists}
        events={collateralEvents}
      />
      <MarketInformationComposite
        market={market ?? null}
        marketId={market?.id ?? ''}
        chainId={rChainId}
        previewPrices={previewPrices}
      />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
