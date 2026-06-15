import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketInformationComposite } from '@/lend/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/lend/components/PageLendMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/lend/components/PageLendMarket/ManageLoanTabs'
import { useLendPageTitle } from '@/lend/hooks/useLendPageTitle'
import { networks } from '@/lend/networks'
import { type MarketUrlParams } from '@/lend/types/lend.types'
import { getCollateralListPathname, parseMarketParams } from '@/lend/utils/utilsRouter'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
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
  const { data: market, isLoading: isMarketLoading, isSuccess } = useLendMarket(chainId, rMarket)
  const { isHydrated, llamaApi: api = null, provider } = useCurve()
  const marketId = market?.id ?? '' // todo: use market?.id directly everywhere since we pass the market too!
  const { address: userAddress } = useConnection()
  useLendPageTitle(market?.collateral_token?.symbol ?? rMarket, t`Lend`)

  const network = networks[chainId]
  const tokens = useMemo(() => (market ? getTokens(market) : {}), [market])
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists(
    {
      chainId,
      marketId,
      userAddress,
    },
    !!market, // enable query as soon as market is defined, the validation suite isn't able to detect it otherwise
  )

  // eslint-disable-next-line @eslint-react/use-state -- Existing violation before enabling this rule.
  const [previewPrices, onPricesUpdated] = useState<Range<Decimal> | undefined>(undefined)
  const controllerAddress = getControllerAddress(market)
  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Lend,
    chain: isPricesApiChain(network.id) ? network.id : undefined,
    controllerAddress,
    userAddress,
    tokens,
    network,
  })

  const pageProps = {
    params,
    rChainId: chainId,
    marketId,
    userAddress,
    isLoaded: !!market,
    api,
    market,
    onPricesUpdated,
  }

  return isSuccess && !market ? (
    <ErrorPage
      title="404"
      subtitle={`${t`Market`} ${rMarket} ${t`Not Found`}`}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : provider ? (
    <DetailPageLayout
      formTabs={
        market &&
        !isLoanExistsLoading &&
        (loanExists ? (
          <ManageLoanTabs {...pageProps} collateralEvents={collateralEvents} />
        ) : (
          <CreateLoanTabs {...pageProps} params={params} />
        ))
      }
      header={
        <MarketPageHeader
          blockchainId={network.id}
          chainId={chainId}
          marketId={marketId}
          isLoading={!isHydrated || isMarketLoading}
          market={market}
          marketType={LlamaMarketType.Lend}
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
        params={{ chainId, marketId, userAddress }}
      />
      <MarketInformationComposite
        pageProps={pageProps}
        rateType={MarketRateType.Borrow}
        previewPrices={previewPrices}
      />
    </DetailPageLayout>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
