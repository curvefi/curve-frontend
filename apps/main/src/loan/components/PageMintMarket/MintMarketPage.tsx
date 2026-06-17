import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useHasLoan } from '@/llamalend/queries/user/user-loan-exists.query'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { networks } from '@/loan/networks'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getCollateralListPathname, getChainId } from '@/loan/utils/utilsRouter'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery, type Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useMintMarket } from '../../hooks/useMintMarket'

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { llamaApi: curve = null, isHydrated, provider } = useCurve()
  const rChainId = getChainId(params)
  const { address } = useConnection()
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)

  const marketQuery = useMintMarket({ chainId: rChainId, rMarket: rCollateralId })
  const { data: market, isLoading: isMarketLoading, error } = marketQuery
  const userMarketParams = { chainId: rChainId, marketId: market?.id, userAddress: address }
  const loanExists = useHasLoan({ chainId: rChainId, marketId: market?.id, userAddress: address, marketQuery })

  const network = networks[rChainId]
  const tokens = useMemo(() => maybe(market, getTokens) ?? {}, [market])

  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Mint,
    chain: isPricesApiChain(network.id) ? network.id : undefined,
    controllerAddress: getControllerAddress(market),
    userAddress: curve?.signerAddress,
    network,
    tokens,
  })

  const pageProps = { curve, market, rChainId, params, onPricesUpdated: setPreviewPrices }

  return error ? (
    <ErrorPage
      title={t`Error`}
      subtitle={error.message}
      error={error}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : provider ? (
    <DetailPageLayout
      formTabs={maybe(market && loanExists.data, loanExists =>
        loanExists ? (
          <ManageLoanTabs {...pageProps} collateralEvents={collateralEvents} />
        ) : (
          <CreateLoanTabs {...pageProps} />
        ),
      )}
      header={
        <MarketPageHeader
          blockchainId={network.id}
          chainId={rChainId}
          marketId={market?.id ?? ''}
          isLoading={!isHydrated || isMarketLoading}
          marketQuery={marketQuery}
          marketType={LlamaMarketType.Mint}
        />
      }
    >
      <MarketBanners
        chainId={rChainId}
        controllerAddress={mapQuery(marketQuery, getControllerAddress)}
        marketType={LlamaMarketType.Mint}
      />
      <PositionDetailsComposite
        tokens={tokens}
        params={userMarketParams}
        hasPosition={loanExists}
        events={collateralEvents}
      />
      <MarketInformationComposite marketQuery={marketQuery} chainId={rChainId} previewPrices={previewPrices} />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
