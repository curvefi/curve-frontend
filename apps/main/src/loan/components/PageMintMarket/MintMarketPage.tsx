import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useIsInSoftLiquidation } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { networks } from '@/loan/networks'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getChainId, getCollateralListPathname } from '@/loan/utils/utilsRouter'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useMintMarket } from '../../hooks/useMintMarket'

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { isInitialized } = useCurve()
  const chainId = getChainId(params)
  const { address } = useConnection()
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)

  const marketQuery = useMintMarket({ chainId, rMarket: rCollateralId })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery

  const queryParams = { chainId, marketId: market?.id, userAddress: address }
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists(queryParams)

  const network = networks[chainId]
  const isLoading = !isInitialized || isMarketLoading
  const apiMarket = useLlamaMarket(
    {
      network: params.network,
      rMarket: rCollateralId,
      userAddress: address,
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    !isLoading && !market,
  )
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)

  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Mint,
    chain: getBlockchainId(network.id),
    controllerAddress,
    userAddress: address,
    network,
    tokens,
  })
  const { data: isSoftLiquidation, isLoading: isSoftLiquidationLoading } = useIsInSoftLiquidation(
    queryParams,
    !!loanExists,
  )

  const error = marketError ?? apiMarket.error
  return error ? (
    <ErrorPage
      title={t`Error`}
      subtitle={error.message}
      error={error}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : (
    <MarketContextProvider
      network={network}
      marketQuery={marketQuery}
      apiMarket={apiMarket}
      marketType={LlamaMarketType.Mint}
    >
      <DetailPageLayout
        formTabs={
          !isLoading &&
          !isLoanExistsLoading &&
          !isSoftLiquidationLoading &&
          (loanExists ? (
            <ManageLoanTabs
              onPricesUpdated={setPreviewPrices}
              collateralEvents={collateralEvents}
              isSoftLiquidation={!!isSoftLiquidation}
            />
          ) : (
            <CreateLoanTabs onPricesUpdated={setPreviewPrices} />
          ))
        }
        header={<MarketPageHeader isLoading={isLoading} />}
      >
        <MarketBanners chainId={chainId} market={market} />
        <PositionDetailsComposite hasPosition={loanExists} events={collateralEvents} />
        <MarketInformationComposite previewPrices={previewPrices} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
