import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/lend/components/PageLendMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/lend/components/PageLendMarket/ManageLoanTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useLendMarket } from '../../hooks/useLendMarket'
import { CampaignRewardsBanner } from '../CampaignRewardsBanner'

export const LendMarketPage = () => {
  const params = useParams<MarketUrlParams>()
  const { rMarket, rChainId: chainId } = parseMarketParams(params)
  const marketQuery = useLendMarket({ chainId, rMarket })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const { isInitialized } = useCurve()
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)

  const network = networks[chainId]
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId: market?.id,
    userAddress,
  })

  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
  const isLoading = !isInitialized || isMarketLoading
  const apiMarket = useLlamaMarket(
    {
      rMarket,
      network: params.network,
      userAddress,
      enableLLv2: useLLv2(),
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    !isLoading && !market, // only enable API data when wallet is disconnected
  )
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Lend,
    chain: getBlockchainId(network.id),
    controllerAddress,
    userAddress,
    tokens,
    network,
  })

  const error = marketError ?? apiMarket.error
  return error ? (
    <ErrorPage title={t`Error`} subtitle={error.message} continueUrl={getCollateralListPathname(params)} />
  ) : (
    <MarketContextProvider
      chainId={chainId}
      marketQuery={marketQuery}
      apiMarket={apiMarket}
      marketType={LlamaMarketType.Lend}
    >
      <DetailPageLayout
        formTabs={
          ((!!market && !isLoanExistsLoading) || apiMarket.data) &&
          (loanExists ? (
            <ManageLoanTabs onPricesUpdated={setPreviewPrices} collateralEvents={collateralEvents} />
          ) : (
            <CreateLoanTabs onPricesUpdated={setPreviewPrices} />
          ))
        }
        header={
          <MarketPageHeader
            blockchainId={network.id}
            chainId={chainId}
            isLoading={isLoading}
            market={market}
            marketType={LlamaMarketType.Lend}
            apiMarket={apiMarket}
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
          events={collateralEvents}
          tokens={tokens}
          params={{ chainId, marketId: market?.id, userAddress }}
        />
        <MarketInformationComposite rateType={MarketRateType.Borrow} previewPrices={previewPrices} />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
