import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs, type MintManageLoanProps } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { networks } from '@/loan/networks'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getChainId, getCollateralListPathname } from '@/loan/utils/utilsRouter'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useMintMarket } from '../../hooks/useMintMarket'

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { llamaApi: curve = null, isInitialized } = useCurve()
  const chainId = getChainId(params)
  const { address } = useConnection()
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)

  const {
    data: market,
    isLoading: isMarketLoading,
    error: marketError,
  } = useMintMarket({ chainId, rMarket: rCollateralId })

  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId: market?.id,
    userAddress: address,
  })

  const network = networks[chainId]
  const tokens = useMemo(() => (market ? getTokens(market) : {}), [market])
  const isLoading = !isInitialized || isMarketLoading
  const apiMarket = useLlamaMarket(
    {
      marketType: LlamaMarketType.Mint,
      network: params.network,
      rMarket: rCollateralId,
      userAddress: address,
      enableLLv2: useLLv2(),
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    !isLoading && !market?.id,
  )

  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Mint,
    chain: getBlockchainId(network.id),
    controllerAddress: getControllerAddress(market),
    userAddress: address,
    network,
    tokens,
  })

  const pageProps: Omit<MintManageLoanProps, 'collateralEvents'> = {
    curve,
    market,
    rChainId: chainId,
    params,
    onPricesUpdated: setPreviewPrices,
    apiMarket,
  }

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
      formTabs={
        ((!!market && !isLoanExistsLoading) || apiMarket.data) &&
        (loanExists ? (
          <ManageLoanTabs {...pageProps} collateralEvents={collateralEvents} />
        ) : (
          <CreateLoanTabs {...pageProps} />
        ))
      }
      header={
        <MarketPageHeader
          blockchainId={network.id}
          chainId={chainId}
          isLoading={isLoading}
          market={market}
          marketType={LlamaMarketType.Mint}
          apiMarket={apiMarket}
        />
      }
    >
      <MarketBanners chainId={chainId} market={market} />
      <PositionDetailsComposite
        tokens={tokens}
        hasPosition={loanExists}
        events={collateralEvents}
        params={{ chainId, marketId: market?.id, userAddress: address }}
      />
      <MarketInformationComposite
        market={market ?? null}
        marketId={market?.id ?? ''}
        chainId={chainId}
        previewPrices={previewPrices}
        apiMarket={apiMarket}
      />
    </DetailPageLayout>
  )
}
